import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import { DifferenceReport } from './DifferenceReport';
import { TestSession } from './TestSession';

export interface HTMLReportData {
  session: TestSession;
  report: DifferenceReport;
  timestamp: string;
  title: string;
}

export class HTMLReport {
  private templatePath: string;
  private outputPath: string;
  private reportData: HTMLReportData;

  constructor(
    session: TestSession,
    report: DifferenceReport,
    outputPath: string,
    templatePath?: string
  ) {
    this.templatePath =
      templatePath || path.join(__dirname, '../templates/report.ejs');
    this.outputPath = outputPath;
    this.reportData = {
      session,
      report,
      timestamp: new Date().toISOString(),
      title: `BrowserDiff Report - ${session.targetUrl}`,
    };
  }

  public async generate(): Promise<string> {
    const template = await fs.promises.readFile(this.templatePath, 'utf-8');
    const html = ejs.render(template, this.reportData);

    const outputDir = path.dirname(this.outputPath);
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(this.outputPath, html, 'utf-8');

    return this.outputPath;
  }

  public async generateInline(): Promise<string> {
    const template = await fs.promises.readFile(this.templatePath, 'utf-8');
    return ejs.render(template, this.reportData);
  }

  public getReportData(): HTMLReportData {
    return this.reportData;
  }

  public setCustomTitle(title: string): void {
    this.reportData.title = title;
  }
}
