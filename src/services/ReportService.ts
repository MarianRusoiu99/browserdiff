import * as fs from 'fs';
import * as path from 'path';
import { HTMLReport } from '../models/HTMLReport';
import { TestSession } from '../models/TestSession';
import { DifferenceReport } from '../models/DifferenceReport';
import { TestConfig } from '../models/Config';

export class ReportService {
  private config: TestConfig;
  private templatePath: string;

  constructor(config: TestConfig, templatePath?: string) {
    this.config = config;
    this.templatePath =
      templatePath || path.join(__dirname, '../templates/report.ejs');
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
}
