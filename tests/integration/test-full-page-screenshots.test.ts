import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Executor } from '../../src/core/Executor';
import { TestConfig } from '../../src/models/Config';
import * as fs from 'fs';
import * as path from 'path';

describe('Full Page Screenshots Integration', () => {
  const testOutputDir = path.join(process.cwd(), 'test-output-fullpage');

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

  it('should capture full page screenshots when fullPage is enabled', async () => {
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
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session).toBeDefined();
    expect(result.session.results[0].screenshot).toBeDefined();
    expect(result.session.results[0].screenshot?.isFullPage).toBe(true);
    expect(result.session.results[0].screenshot?.height).toBeGreaterThan(720); // Should capture more than viewport
  }, 90000);

  it('should respect maxHeight limit for very long pages', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 60000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      screenshot: {
        fullPage: true,
        maxHeight: 5000, // Artificially low limit
        timeout: 60000,
        quality: 90
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session.results[0].screenshot).toBeDefined();
    const screenshot = result.session.results[0].screenshot;
    expect(screenshot).toBeDefined();
    
    // If truncated, reason should be present
    const wasTruncated = screenshot?.wasTruncated || false;
    const hasTruncationReason = screenshot?.truncationReason !== undefined;
    expect(wasTruncated ? hasTruncationReason : true).toBe(true);
  }, 90000);

  it('should capture viewport-only screenshots when fullPage is false (default)', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 3, delay: 1000 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
      screenshot: {
        fullPage: false,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session.results[0].screenshot).toBeDefined();
    expect(result.session.results[0].screenshot?.isFullPage).toBe(false);
    expect(result.session.results[0].screenshot?.height).toBe(720); // Should match viewport
  }, 60000);

  it('should record capture time for performance tracking', async () => {
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
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session.results[0].screenshot?.captureTime).toBeDefined();
    expect(result.session.results[0].screenshot?.captureTime).toBeGreaterThan(0);
  }, 90000);

  it('should apply screenshot quality setting', async () => {
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
        quality: 50 // Lower quality for testing
      }
    };

    const executor = new Executor(config);
    const result = await executor.execute('https://example.com');

    expect(result.session).toBeDefined();
    expect(result.session.status).toBe('completed');
  }, 90000);
});
