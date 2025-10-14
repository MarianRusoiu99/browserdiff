import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ReportService } from '../../src/services/ReportService';
import { TestConfig } from '../../src/models/Config';
import { TestSession } from '../../src/models/TestSession';
import { DifferenceReport } from '../../src/models/DifferenceReport';
import * as fs from 'fs';
import * as path from 'path';

describe('Report Generation', () => {
  const testOutputDir = path.join(process.cwd(), 'test-reports');
  const config: TestConfig = {
    browsers: ['chromium'],
    viewport: { width: 1280, height: 720 },
    timeout: { pageLoad: 30000, screenshot: 5000 },
    retry: { attempts: 3, delay: 1000 },
    comparison: { threshold: 0.1, includeAA: true },
    output: { directory: testOutputDir, format: 'html', embedAssets: true },
  };

  beforeEach(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  it('should generate HTML report with all sections', async () => {
    const service = new ReportService(config);
    const session = new TestSession('https://example.com', config);
    const report = new DifferenceReport(session.sessionId, 'chromium');
    
    session.complete();
    const reportPath = await service.generateHTMLReport(session, report);
    
    expect(fs.existsSync(reportPath)).toBe(true);
    const content = fs.readFileSync(reportPath, 'utf-8');
    expect(content).toContain('<!DOCTYPE html>');
    expect(content).toContain('browserdiff Report');
  });

  it('should embed all assets in report', async () => {
    const service = new ReportService(config);
    const session = new TestSession('https://example.com', config);
    const report = new DifferenceReport(session.sessionId, 'chromium');
    
    session.complete();
    const reportPath = await service.generateHTMLReport(session, report);
    
    const content = fs.readFileSync(reportPath, 'utf-8');
    // Check for embedded CSS
    expect(content).toContain('<style>');
    expect(content).toContain('</style>');
  });

  it('should generate portable report directory', async () => {
    const service = new ReportService(config);
    const session = new TestSession('https://example.com', config);
    const report = new DifferenceReport(session.sessionId, 'chromium');
    
    session.complete();
    await service.generateHTMLReport(session, report);
    await service.saveReportData(session, report);
    
    const jsonFiles = fs.readdirSync(testOutputDir).filter(f => f.endsWith('.json'));
    expect(jsonFiles.length).toBeGreaterThan(0);
  });
});
