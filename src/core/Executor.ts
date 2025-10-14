import { TestConfig } from '../models/Config';
import { TestSession } from '../models/TestSession';
import { BrowserResult } from '../models/BrowserResult';
import { DifferenceReport } from '../models/DifferenceReport';
import { ReportStructure } from '../models/report-structure';
import { BrowserService } from '../services/BrowserService';
import { ScreenshotService } from '../services/ScreenshotService';
import { DiffService } from '../services/DiffService';
import { ReportService } from '../services/ReportService';
import { DirectoryService } from '../services/DirectoryService';
import { Logger } from '../utils/Logger';
import { DEFAULT_REPORT_CONFIG } from '../models/report-config';
import * as path from 'path';

export interface ExecutionResult {
  session: TestSession;
  report: DifferenceReport;
  reportPath: string;
  success: boolean;
}

export class Executor {
  private config: TestConfig;
  private logger: Logger;
  private browserService: BrowserService;
  private screenshotService: ScreenshotService;
  private diffService: DiffService;
  private reportService: ReportService;
  private directoryService: DirectoryService;

  constructor(config: TestConfig, logger?: Logger) {
    this.config = config;
    this.logger = logger || new Logger(false);
    this.browserService = new BrowserService(config);
    this.screenshotService = new ScreenshotService(config);
    this.diffService = new DiffService(config);
    this.reportService = new ReportService(config);
    this.directoryService = new DirectoryService();
  }

  public async openReport(reportPath: string): Promise<void> {
    return this.reportService.openReport(reportPath);
  }

  public async execute(
    url: string,
    baselineBrowser: string = 'chromium'
  ): Promise<ExecutionResult> {
    const session = new TestSession(url, this.config);

    try {
      this.logger.info(`Starting test session: ${session.sessionId}`);
      this.logger.info(`Target URL: ${url}`);
      this.logger.info(`Baseline browser: ${baselineBrowser}`);
      this.logger.info(`Browsers: ${this.config.browsers.join(', ')}`);

      // Check if structured output is enabled
      const reportConfig = this.config.reporting || DEFAULT_REPORT_CONFIG;
      let structure: ReportStructure | undefined;

      if (reportConfig.structured) {
        // Create structured directory
        structure = await this.reportService.createStructuredDirectory(url);
        this.logger.info(`Created structured directory: ${structure.baseDirectory}`);
      }

      // Capture screenshots for all browsers
      // The screenshot config is already in this.config and will be used by ScreenshotService
      const results = await this.captureScreenshots(url, structure);

      // Add results to session
      for (const result of results) {
        session.addResult(result);
      }

      // Find baseline result
      const baselineResult = results.find(
        (r) => r.browserName === baselineBrowser
      );

      if (!baselineResult) {
        throw new Error(`Baseline browser ${baselineBrowser} not found`);
      }

      if (baselineResult.status !== 'success') {
        throw new Error(
          `Baseline browser failed: ${baselineResult.errorMessage}`
        );
      }

      // Generate difference report
      this.logger.info('Generating difference report...');
      
      const outputDir = structure 
        ? this.directoryService.getAbsolutePaths(structure).diffsDir
        : this.config.output.directory;

      const report = await this.diffService.generateDifferenceReport(
        session.sessionId,
        baselineBrowser,
        baselineResult,
        results,
        outputDir
      );

      session.complete();

      // Generate HTML report (structured or flat)
      const reportPath = structure
        ? await this.reportService.generateHTMLReportStructured(session, report, structure)
        : await this.reportService.generateHTMLReport(session, report);

      this.logger.info(`Report generated: ${reportPath}`);

      // Save JSON data (structured or flat)
      if (structure) {
        await this.reportService.saveReportDataStructured(session, report, structure);
      } else {
        await this.reportService.saveReportData(session, report);
      }

      return {
        session,
        report,
        reportPath,
        success: !report.hasDifferences() || report.overallStatus !== 'different',
      };
    } catch (error) {
      session.fail();
      this.logger.error(`Execution failed: ${(error as Error).message}`);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  private async captureScreenshots(
    url: string,
    structure?: ReportStructure
  ): Promise<BrowserResult[]> {
    const results: BrowserResult[] = [];
    
    // Determine screenshot directory
    const screenshotDir = structure
      ? this.directoryService.getAbsolutePaths(structure).screenshotsDir
      : path.join(this.config.output.directory, 'screenshots');

    for (const browserName of this.config.browsers) {
      this.logger.info(`Launching ${browserName}...`);

      try {
        const page = await this.browserService.createPage(browserName);
        
        this.logger.info(`Navigating to ${url}...`);
        await this.browserService.navigateWithRetry(page, url);

        this.logger.info(`Capturing screenshot for ${browserName}...`);
        
        // Use enhanced screenshot method with config via the legacy wrapper
        // The captureScreenshot method will call captureScreenshotEnhanced internally
        // and properly handle the BrowserType conversion
        const result = await this.screenshotService.captureScreenshot(
          page,
          browserName,
          screenshotDir
        );
        
        results.push(result);

        if (result.status === 'success') {
          this.logger.success(
            `✓ ${browserName}: ${result.pageLoadTime}ms`
          );
        } else {
          this.logger.error(
            `✗ ${browserName}: ${result.errorMessage || result.status}`
          );
        }
      } catch (error) {
        // Create a failed result for the browser
        const failedResult = new BrowserResult(browserName, 'unknown', {
          userAgent: 'unknown',
          platform: 'unknown',
          architecture: 'unknown',
          headless: true,
          viewport: this.config.viewport,
          additionalFlags: [],
        });
        failedResult.setError((error as Error).message);
        results.push(failedResult);
        
        this.logger.error(
          `✗ ${browserName}: ${(error as Error).message}`
        );
      }
    }

    return results;
  }

  private async cleanup(): Promise<void> {
    this.logger.info('Cleaning up...');
    await this.browserService.closeAllBrowsers();
  }

  public getConfig(): TestConfig {
    return this.config;
  }

  public setLogger(logger: Logger): void {
    this.logger = logger;
  }
}
