import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Executor } from '../../src/core/Executor';
import { TestConfig } from '../../src/models/Config';
import * as fs from 'fs';
import * as path from 'path';

describe('Combined Features Integration - Full Page + Structured Output', () => {
  const testOutputDir = path.join(process.cwd(), 'test-output-combined');

  beforeEach(async () => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  it('should capture full page screenshots with structured output', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 60000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      screenshot: {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      },
      reporting: {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_HH-mm-ss_{url}',
        urlSanitization: {
          maxLength: 100,
          removeProtocol: true,
          preserveStructure: true,
          characterMap: {
            '/': '-',
            '\\': '-',
            ':': '-',
            '*': '-',
            '?': '-',
            '"': '-',
            '<': '-',
            '>': '-',
            '|': '-'
          }
        }
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    // Verify full page screenshot
    expect(result.session.results[0].screenshot?.isFullPage).toBe(true);
    expect(result.session.results[0].screenshot?.height).toBeGreaterThan(720);

    // Verify structured output
    const outputContents = fs.readdirSync(testOutputDir);
    const structuredDir = outputContents.find(item => 
      fs.statSync(path.join(testOutputDir, item)).isDirectory()
    );
    expect(structuredDir).toBeDefined();

    // Verify screenshots are in subdirectory
    if (!structuredDir) {
      throw new Error('Structured directory not found');
    }
    const screenshotsDir = path.join(testOutputDir, structuredDir, 'screenshots');
    expect(fs.existsSync(screenshotsDir)).toBe(true);
    
    const screenshots = fs.readdirSync(screenshotsDir);
    expect(screenshots.length).toBeGreaterThan(0);
    expect(screenshots[0]).toMatch(/chromium.*\.png/);
  }, 90000);

  it('should handle multiple browsers with full page and structured output', async () => {
    const config: TestConfig = {
      browsers: ['chromium', 'firefox'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 60000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      screenshot: {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      },
      reporting: {
        structured: true,
        directoryPattern: 'test_{url}',
        urlSanitization: {
          maxLength: 50,
          removeProtocol: true,
          preserveStructure: false,
          characterMap: {
            '/': '-',
            '\\': '-',
            ':': '-',
            '*': '-',
            '?': '-',
            '"': '-',
            '<': '-',
            '>': '-',
            '|': '-'
          }
        }
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com/test-page');

    // Verify both browsers captured full page
    expect(result.session.results).toHaveLength(2);
    result.session.results.forEach(browserResult => {
      expect(browserResult.screenshot?.isFullPage).toBe(true);
    });

    // Verify structured directory contains all screenshots
    const outputContents = fs.readdirSync(testOutputDir);
    const structuredDir = path.join(testOutputDir, outputContents[0]);
    const screenshotsDir = path.join(structuredDir, 'screenshots');
    
    const screenshots = fs.readdirSync(screenshotsDir);
    expect(screenshots.length).toBeGreaterThanOrEqual(2); // At least one per browser
  }, 120000);

  it('should generate complete report with full page metadata in structured directory', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 60000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      screenshot: {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 95
      },
      reporting: {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_HH-mm-ss_{url}',
        urlSanitization: {
          maxLength: 100,
          removeProtocol: true,
          preserveStructure: true,
          characterMap: {
            '/': '-',
            '\\': '-',
            ':': '-',
            '*': '-',
            '?': '-',
            '"': '-',
            '<': '-',
            '>': '-',
            '|': '-'
          }
        }
      }
    };

    const executor = new Executor(config);
    await executor.execute('https://example.com');

    const outputContents = fs.readdirSync(testOutputDir);
    const structuredDir = path.join(testOutputDir, outputContents[0]);
    
    // Check JSON report exists and contains full page metadata
    const jsonReportPath = path.join(structuredDir, 'report.json');
    expect(fs.existsSync(jsonReportPath)).toBe(true);
    
    const jsonReport = JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
    expect(jsonReport.results[0].screenshot).toBeDefined();
    expect(jsonReport.results[0].screenshot.isFullPage).toBe(true);
    expect(jsonReport.results[0].screenshot.actualPageHeight).toBeDefined();
    expect(jsonReport.results[0].screenshot.captureTime).toBeDefined();

    // Check HTML report exists
    const htmlReportPath = path.join(structuredDir, 'report.html');
    expect(fs.existsSync(htmlReportPath)).toBe(true);
  }, 90000);
});
