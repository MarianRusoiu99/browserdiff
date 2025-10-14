import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfig } from '../models/Config';
import { BrowserResult, BrowserMetadata } from '../models/BrowserResult';
import { ScreenshotResult, createScreenshotResult } from '../models/screenshot-result';
import { ScreenshotConfig, DEFAULT_SCREENSHOT_CONFIG } from '../models/screenshot-config';
import { BrowserType } from 'playwright';

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
    const screenshotConfig = this.config.screenshot || DEFAULT_SCREENSHOT_CONFIG;
    const result = await this.captureScreenshotEnhanced(page, browserName as unknown as BrowserType, outputDir, screenshotConfig);

    // Convert to legacy BrowserResult format
    const metadata: BrowserMetadata = {
      userAgent: '',
      platform: '',
      architecture: process.arch,
      headless: true,
      viewport: { width: result.width, height: result.height },
      additionalFlags: []
    };
    const legacyResult = new BrowserResult(browserName, 'unknown', metadata);

    legacyResult.setScreenshot(result.filePath);
    legacyResult.setPageLoadTime(result.captureTime);
    
    // NEW: Set the enhanced screenshot result
    legacyResult.setScreenshotResult(result);

    if (result.wasTruncated) {
      legacyResult.setError(`Screenshot truncated: ${result.truncationReason}`);
    }

    return legacyResult;
  }

  // NEW: Enhanced screenshot capture with full page support
  public async captureScreenshotEnhanced(
    page: Page,
    browser: BrowserType,
    outputDir: string,
    screenshotConfig: ScreenshotConfig = DEFAULT_SCREENSHOT_CONFIG
  ): Promise<ScreenshotResult> {
    const startTime = Date.now();

    try {
      // Ensure output directory exists
      await fs.promises.mkdir(outputDir, { recursive: true });

      // Get page height for full page screenshots
      const pageHeight = screenshotConfig.fullPage
        ? await page.evaluate('document.body.scrollHeight') as number
        : 0;

      // Check if page height exceeds maxHeight
      const willTruncate = screenshotConfig.fullPage && pageHeight > screenshotConfig.maxHeight;
      const actualHeight = willTruncate ? screenshotConfig.maxHeight : (screenshotConfig.fullPage ? pageHeight : 0);

      // Generate screenshot filename
      const timestamp = Date.now();
      const filename = `${browser}-${timestamp}.png`;
      const screenshotPath = path.join(outputDir, filename);

      // Capture screenshot with enhanced options
      await Promise.race([
        page.screenshot({
          path: screenshotPath,
          fullPage: screenshotConfig.fullPage,
          type: 'png',
        }),
        this.timeoutPromise(screenshotConfig.timeout),
      ]);

      // Get actual screenshot dimensions
      // Note: In a real implementation, you'd use a PNG library to get dimensions
      // For now, we'll use viewport size as approximation
      const viewport = page.viewportSize() || { width: 1920, height: 1080 };
      const width = viewport.width;
      const height = screenshotConfig.fullPage ? actualHeight : viewport.height;

      const captureTime = Date.now() - startTime;

      return createScreenshotResult(
        browser,
        screenshotPath,
        width,
        height,
        {
          isFullPage: screenshotConfig.fullPage,
          actualPageHeight: pageHeight,
          captureTime,
          wasTruncated: willTruncate,
          truncationReason: willTruncate ? `Page height ${pageHeight}px exceeded maxHeight ${screenshotConfig.maxHeight}px` : undefined
        }
      );
    } catch (error) {
      const captureTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Return error result
      return createScreenshotResult(
        browser,
        '',
        0,
        0,
        {
          captureTime,
          wasTruncated: false,
          truncationReason: `Capture failed: ${errorMessage}`
        }
      );
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
