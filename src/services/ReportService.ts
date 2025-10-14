import * as fs from 'fs';
import * as path from 'path';
import { HTMLReport } from '../models/HTMLReport';
import { TestSession } from '../models/TestSession';
import { DifferenceReport } from '../models/DifferenceReport';
import { TestConfig } from '../models/Config';
import { DirectoryService } from './DirectoryService';
import { ReportStructure } from '../models/report-structure';
import { DEFAULT_REPORT_CONFIG } from '../models/report-config';

export class ReportService {
  private config: TestConfig;
  private templatePath: string;
  private directoryService: DirectoryService;

  constructor(config: TestConfig, templatePath?: string) {
    this.config = config;
    this.templatePath =
      templatePath || path.join(__dirname, '../templates/report.ejs');
    this.directoryService = new DirectoryService();
  }

  public async generateHTMLReport(
    session: TestSession,
    report: DifferenceReport,
    customOutputPath?: string
  ): Promise<string> {
    const outputPath =
      customOutputPath ||
      path.join(
        this.config.output.directory,
        `report-${session.sessionId}.html`
      );

    const htmlReport = new HTMLReport(
      session,
      report,
      outputPath,
      this.templatePath
    );

    return await htmlReport.generate();
  }

  public async generateInlineHTMLReport(
    session: TestSession,
    report: DifferenceReport
  ): Promise<string> {
    const htmlReport = new HTMLReport(
      session,
      report,
      '',
      this.templatePath
    );

    return await htmlReport.generateInline();
  }

  public async saveReportData(
    session: TestSession,
    report: DifferenceReport
  ): Promise<string> {
    const outputDir = this.config.output.directory;
    await fs.promises.mkdir(outputDir, { recursive: true });

    const jsonPath = path.join(outputDir, `report-${session.sessionId}.json`);
    const data = {
      session: session.toJSON(),
      report: report.toJSON(),
      timestamp: new Date().toISOString(),
    };

    await fs.promises.writeFile(jsonPath, JSON.stringify(data, null, 2));
    return jsonPath;
  }

  public async openReport(reportPath: string): Promise<void> {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const platform = process.platform;
    let command: string;

    switch (platform) {
      case 'darwin':
        command = `open "${reportPath}"`;
        break;
      case 'win32':
        command = `start "" "${reportPath}"`;
        break;
      default:
        command = `xdg-open "${reportPath}"`;
        break;
    }

    try {
      await execAsync(command);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to open report:', error);
      // eslint-disable-next-line no-console
      console.log(`Report available at: ${reportPath}`);
    }
  }

  public async listReports(): Promise<string[]> {
    const outputDir = this.config.output.directory;

    try {
      const files = await fs.promises.readdir(outputDir);
      return files
        .filter((f) => f.startsWith('report-') && f.endsWith('.html'))
        .map((f) => path.join(outputDir, f));
    } catch {
      return [];
    }
  }

  /**
   * NEW: Create structured output directory for organized report generation
   * @param url - The URL being tested
   * @returns Promise<ReportStructure> - The created directory structure
   */
  public async createStructuredDirectory(
    url: string
  ): Promise<ReportStructure> {
    const reportConfig = this.config.reporting || DEFAULT_REPORT_CONFIG;
    
    if (!reportConfig.structured) {
      throw new Error('Structured output is not enabled in configuration');
    }

    const timestamp = new Date();
    const baseDir = this.config.output.directory;

    return await this.directoryService.createTestDirectory(
      baseDir,
      timestamp,
      url,
      reportConfig.directoryPattern,
      reportConfig.urlSanitization
    );
  }

  /**
   * NEW: Generate HTML report with structured output support
   * @param session - Test session data
   * @param report - Difference report data
   * @param structure - Optional report structure for structured output
   * @returns Promise<string> - Path to generated report
   */
  public async generateHTMLReportStructured(
    session: TestSession,
    report: DifferenceReport,
    structure?: ReportStructure
  ): Promise<string> {
    const reportConfig = this.config.reporting || DEFAULT_REPORT_CONFIG;

    if (reportConfig.structured && structure) {
      // Use structured output path
      const paths = this.directoryService.getAbsolutePaths(structure);
      const htmlReport = new HTMLReport(
        session,
        report,
        paths.htmlReport,
        this.templatePath
      );
      return await htmlReport.generate();
    } else {
      // Fall back to legacy behavior
      return await this.generateHTMLReport(session, report);
    }
  }

  /**
   * NEW: Save report data with structured output support
   * @param session - Test session data
   * @param report - Difference report data
   * @param structure - Optional report structure for structured output
   * @returns Promise<string> - Path to saved JSON report
   */
  public async saveReportDataStructured(
    session: TestSession,
    report: DifferenceReport,
    structure?: ReportStructure
  ): Promise<string> {
    const reportConfig = this.config.reporting || DEFAULT_REPORT_CONFIG;

    if (reportConfig.structured && structure) {
      // Use structured output path
      const paths = this.directoryService.getAbsolutePaths(structure);
      const data = {
        session: session.toJSON(),
        report: report.toJSON(),
        timestamp: new Date().toISOString(),
        structure: {
          baseDirectory: structure.baseDirectory,
          sanitizedUrl: structure.sanitizedUrl,
          originalUrl: structure.metadata.originalUrl
        }
      };

      await fs.promises.writeFile(paths.jsonReport, JSON.stringify(data, null, 2));
      return paths.jsonReport;
    } else {
      // Fall back to legacy behavior
      return await this.saveReportData(session, report);
    }
  }

  /**
   * NEW: Get screenshot output path based on configuration
   * @param browserName - Name of the browser
   * @param structure - Optional report structure for structured output
   * @returns string - Path where screenshot should be saved
   */
  public getScreenshotPath(
    browserName: string,
    structure?: ReportStructure
  ): string {
    const reportConfig = this.config.reporting || DEFAULT_REPORT_CONFIG;

    if (reportConfig.structured && structure) {
      const paths = this.directoryService.getAbsolutePaths(structure);
      const timestamp = Date.now();
      return path.join(paths.screenshotsDir, `${browserName}-${timestamp}.png`);
    } else {
      // Legacy flat structure
      const timestamp = Date.now();
      return path.join(this.config.output.directory, `${browserName}-${timestamp}.png`);
    }
  }

  /**
   * NEW: Get diff output path based on configuration
   * @param browser1 - First browser name
   * @param browser2 - Second browser name
   * @param structure - Optional report structure for structured output
   * @returns string - Path where diff image should be saved
   */
  public getDiffPath(
    browser1: string,
    browser2: string,
    structure?: ReportStructure
  ): string {
    const reportConfig = this.config.reporting || DEFAULT_REPORT_CONFIG;

    if (reportConfig.structured && structure) {
      const paths = this.directoryService.getAbsolutePaths(structure);
      return path.join(paths.diffsDir, `diff-${browser1}-vs-${browser2}.png`);
    } else {
      // Legacy flat structure
      return path.join(this.config.output.directory, `diff-${browser1}-vs-${browser2}.png`);
    }
  }
}

