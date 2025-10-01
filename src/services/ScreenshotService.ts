import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfig } from '../models/Config';
import { BrowserResult, BrowserMetadata } from '../models/BrowserResult';

export class ScreenshotService {
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  public async captureScreenshot(
    page: Page,
    browserName: string,
    outputDir: string
  ): Promise<BrowserResult> {
    const startTime = Date.now();

    // Get page metadata first
    const metadata = await this.getPageMetadata(page);
    
    // Get browser version
    const browserVersion = await this.getBrowserVersion(page, browserName);
    
    // Create result with required parameters
    const result = new BrowserResult(browserName, browserVersion, metadata);

    try {
      // Ensure output directory exists
      await fs.promises.mkdir(outputDir, { recursive: true });

      // Generate screenshot filename
      const timestamp = Date.now();
      const filename = `${browserName}-${timestamp}.png`;
      const screenshotPath = path.join(outputDir, filename);

      // Capture screenshot with timeout
      await Promise.race([
        page.screenshot({
          path: screenshotPath,
          fullPage: false,
          type: 'png',
        }),
        this.timeoutPromise(this.config.timeout.screenshot),
      ]);

      // Read screenshot data
      const screenshotBuffer = await fs.promises.readFile(screenshotPath);

      // Set screenshot data
      result.setScreenshot(screenshotPath, screenshotBuffer);

      // Calculate page load time
      const pageLoadTime = Date.now() - startTime;
      result.setPageLoadTime(pageLoadTime);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          result.setTimeout();
        } else {
          result.setError(error.message);
        }
      } else {
        result.setError('Unknown error during screenshot capture');
      }
    }

    return result;
  }

  private async getPageMetadata(page: Page): Promise<BrowserMetadata> {
    const userAgent = (await page.evaluate('navigator.userAgent')) as string;
    const platform = (await page.evaluate('navigator.platform')) as string;
    const viewport = page.viewportSize() || { width: 0, height: 0 };

    return {
      userAgent,
      platform,
      architecture: process.arch,
      headless: true,
      viewport,
      additionalFlags: [],
    };
  }

  private async getBrowserVersion(
    page: Page,
    _browserName: string
  ): Promise<string> {
    try {
      const userAgent = (await page.evaluate('navigator.userAgent')) as string;
      // Extract version from user agent
      const match = userAgent.match(/(?:Chrome|Firefox|Safari)\/(\d+\.\d+)/);
      return match ? match[1] : 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }

  public async cleanupOldScreenshots(
    directory: string,
    maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
  ): Promise<number> {
    try {
      const files = await fs.promises.readdir(directory);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        if (!file.endsWith('.png')) continue;

        const filePath = path.join(directory, file);
        const stats = await fs.promises.stat(filePath);

        if (now - stats.mtimeMs > maxAgeMs) {
          await fs.promises.unlink(filePath);
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up screenshots:', error);
      return 0;
    }
  }
}
