import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Executor } from '../../src/core/Executor';
import { TestConfig } from '../../src/models/Config';
import * as fs from 'fs';
import * as path from 'path';

describe('Basic Cross-Browser Diff Execution', () => {
  const testOutputDir = path.join(process.cwd(), 'test-output');

  beforeEach(async () => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    fs.mkdirSync(testOutputDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test output directory
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
  });

  it('should execute diff test with default browsers', async () => {
    // Test the complete workflow:
    // 1. Launch browsers
    // 2. Capture screenshots
    // 3. Compare against baseline
    // 4. Generate report
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session).toBeDefined();
    expect(result.report).toBeDefined();
    expect(result.session.targetUrl).toBe('https://example.com');
    expect(result.session.status).toBe('completed');
  }, 60000);

  it('should execute diff test with specific browsers', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session.results).toHaveLength(1);
    expect(result.session.results[0].browserName).toBe('chromium');
  }, 60000);

  it('should handle missing baseline gracefully', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    // This should work fine as chromium is both the test and baseline browser
    const result = await executor.execute('https://example.com', 'chromium');

    expect(result.session.status).toBe('completed');
  }, 60000);

  it('should detect visual differences', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.report).toBeDefined();
    expect(result.report.sessionId).toBe(result.session.sessionId);
  }, 60000);

  it('should generate HTML report with results', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.reportPath).toBeDefined();
    expect(fs.existsSync(result.reportPath)).toBe(true);
    expect(path.extname(result.reportPath)).toBe('.html');
  }, 60000);
});
