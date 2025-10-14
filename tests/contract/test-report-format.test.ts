import { describe, it, expect } from '@jest/globals';
import { ReportService } from '../../src/services/ReportService';
import { TestConfig } from '../../src/models/Config';
import { TestSession } from '../../src/models/TestSession';
import { DifferenceReport } from '../../src/models/DifferenceReport';
import * as fs from 'fs';
import * as path from 'path';

describe('HTML Report Format Contract', () => {
  const testOutputDir = path.join(process.cwd(), 'test-report-format');
  const config: TestConfig = {
    browsers: ['chromium'],
    viewport: { width: 1280, height: 720 },
    timeout: { pageLoad: 30000, screenshot: 5000 },
    retry: { attempts: 3, delay: 1000 },
    comparison: { threshold: 0.1, includeAA: true },
    output: { directory: testOutputDir, format: 'html', embedAssets: true },
  };

  afterAll(() => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  describe('Report Structure', () => {
    it('should contain HTML document structure', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('</html>');
    });

    it('should contain report title', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content).toContain('browserdiff');
    });

    it('should contain session information', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content).toContain(session.sessionId);
    });
  });

  describe('Report Content', () => {
    it('should display target URL', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content).toContain('example.com');
    });

    it('should display baseline browser', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content).toContain('chromium');
    });

    it('should be a valid HTML file', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      
      expect(fs.existsSync(reportPath)).toBe(true);
      expect(path.extname(reportPath)).toBe('.html');
    });
  });

  describe('Report Features', () => {
    it('should contain embedded styles', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content).toContain('<style>');
    });

    it('should generate unique report files', async () => {
      const service = new ReportService(config);
      const session1 = new TestSession('https://example.com', config);
      const report1 = new DifferenceReport(session1.sessionId, 'chromium');
      session1.complete();
      
      const session2 = new TestSession('https://example.com', config);
      const report2 = new DifferenceReport(session2.sessionId, 'chromium');
      session2.complete();
      
      const reportPath1 = await service.generateHTMLReport(session1, report1);
      const reportPath2 = await service.generateHTMLReport(session2, report2);
      
      expect(reportPath1).not.toBe(reportPath2);
    });

    it('should write readable files', async () => {
      const service = new ReportService(config);
      const session = new TestSession('https://example.com', config);
      const report = new DifferenceReport(session.sessionId, 'chromium');
      session.complete();
      
      const reportPath = await service.generateHTMLReport(session, report);
      const content = fs.readFileSync(reportPath, 'utf-8');
      
      expect(content.length).toBeGreaterThan(0);
    });
  });
});
