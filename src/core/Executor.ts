import { TestConfig } from '../models/Config';
import { TestSession } from '../models/TestSession';
import { BrowserResult } from '../models/BrowserResult';
import { DifferenceReport } from '../models/DifferenceReport';
import { BrowserService } from '../services/BrowserService';
import { ScreenshotService } from '../services/ScreenshotService';
import { DiffService } from '../services/DiffService';
import { ReportService } from '../services/ReportService';
import { Logger } from '../utils/Logger';
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

  constructor(config: TestConfig, logger?: Logger) {
    this.config = config;
    this.logger = logger || new Logger(false);
    this.browserService = new BrowserService(config);
    this.screenshotService = new ScreenshotService(config);
    this.diffService = new DiffService(config);
    this.reportService = new ReportService(config);
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

      // Capture screenshots for all browsers
      const results = await this.captureScreenshots(url);

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
      const report = await this.diffService.generateDifferenceReport(
        session.sessionId,
        baselineBrowser,
        baselineResult,
        results,
        this.config.output.directory
      );

      session.complete();

      // Generate HTML report
      const reportPath = await this.reportService.generateHTMLReport(
        session,
        report
      );

      this.logger.info(`Report generated: ${reportPath}`);

      // Save JSON data
      await this.reportService.saveReportData(session, report);

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

  private async captureScreenshots(url: string): Promise<BrowserResult[]> {
    const results: BrowserResult[] = [];
    const screenshotDir = path.join(
      this.config.output.directory,
      'screenshots'
    );

    for (const browserName of this.config.browsers) {
      this.logger.info(`Launching ${browserName}...`);

      try {
        const page = await this.browserService.createPage(browserName);
        
        this.logger.info(`Navigating to ${url}...`);
        await this.browserService.navigateWithRetry(page, url);

        this.logger.info(`Capturing screenshot for ${browserName}...`);
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
