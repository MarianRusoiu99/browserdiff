import { describe, it, expect } from '@jest/globals';
import { Executor } from '../../src/core/Executor';
import { TestConfig } from '../../src/models/Config';
import * as path from 'path';

describe('Error Handling Scenarios', () => {
  const testOutputDir = path.join(process.cwd(), 'test-output-errors');

  it('should handle browser launch failures', async () => {
    const config: TestConfig = {
      browsers: ['invalid-browser'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 1, delay: 100 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    await expect(executor.execute('https://example.com')).rejects.toThrow();
  }, 60000);

  it('should handle page load timeouts', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 1, screenshot: 5000 },
      retry: { attempts: 1, delay: 100 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    await expect(executor.execute('https://example.com')).rejects.toThrow();
  }, 60000);

  it('should handle invalid URLs', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 1, delay: 100 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: testOutputDir, format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    await expect(executor.execute('not-a-valid-url')).rejects.toThrow();
  }, 60000);

  it('should handle file system errors', async () => {
    const config: TestConfig = {
      browsers: ['chromium'],
      viewport: { width: 1280, height: 720 },
      timeout: { pageLoad: 30000, screenshot: 5000 },
      retry: { attempts: 1, delay: 100 },
      comparison: { threshold: 0.1, includeAA: true },
      output: { directory: '/invalid/path/that/does/not/exist', format: 'html', embedAssets: true },
    };

    const executor = new Executor(config);
    await expect(executor.execute('https://example.com')).rejects.toThrow();
  }, 60000);
});
