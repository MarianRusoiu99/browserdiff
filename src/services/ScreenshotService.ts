import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfig } from '../models/Config';
import { BrowserResult, BrowserMetadata } from '../models/BrowserResult';
import { ScreenshotResult, createScreenshotResult } from '../models/screenshot-result';
import { ScreenshotConfig, DEFAULT_SCREENSHOT_CONFIG } from '../models/screenshot-config';

/**
 * ScreenshotService - Responsible for capturing browser screenshots
 * Follows Single Responsibility Principle: Only handles screenshot capture logic
 */
export class ScreenshotService {
  private config: TestConfig;

  constructor(config: TestConfig) {
    this.config = config;
  }

  /**
   * Converts a browser name string to a typed browser identifier
   * This maintains type safety while working with string browser names from config
   */
  private getBrowserIdentifier(browserName: string): string {
    // Validate browser name
    const validBrowsers = ['chromium', 'firefox', 'webkit'];
    if (!validBrowsers.includes(browserName.toLowerCase())) {
      throw new Error(`Invalid browser name: ${browserName}. Valid options are: ${validBrowsers.join(', ')}`);
    }
    return browserName.toLowerCase();
  }

  public async captureScreenshot(
    page: Page,
    browserName: string,
    outputDir: string
  ): Promise<BrowserResult> {
    const screenshotConfig = this.config.screenshot || DEFAULT_SCREENSHOT_CONFIG;
    const browserIdentifier = this.getBrowserIdentifier(browserName);
    const result = await this.captureScreenshotEnhanced(page, browserIdentifier, outputDir, screenshotConfig);

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
    browserIdentifier: string,
    outputDir: string,
    screenshotConfig: ScreenshotConfig = DEFAULT_SCREENSHOT_CONFIG
  ): Promise<ScreenshotResult> {
    const startTime = Date.now();

    try {
      // Ensure output directory exists
      await fs.promises.mkdir(outputDir, { recursive: true });

      // Wait for page to be fully ready before capturing
      await this.waitForPageReady(page, screenshotConfig);

      // Get page height for full page screenshots
      const pageHeight = screenshotConfig.fullPage
        ? await page.evaluate('document.body.scrollHeight') as number
        : 0;

      // Check if page height exceeds maxHeight
      const willTruncate = screenshotConfig.fullPage && pageHeight > screenshotConfig.maxHeight;
      const actualHeight = willTruncate ? screenshotConfig.maxHeight : (screenshotConfig.fullPage ? pageHeight : 0);

      // Generate screenshot filename
      const timestamp = Date.now();
      const filename = `${browserIdentifier}-${timestamp}.png`;
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
        browserIdentifier,
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
        browserIdentifier,
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

    /**
   * Waits for the page to be fully ready before capturing screenshot.
   * Includes waiting for images, fonts, and applying delay as configured.
   * 
   * @param page - Playwright page instance
   * @param config - Screenshot configuration with wait options
   * @private
   */
  private async waitForPageReady(page: Page, config: ScreenshotConfig): Promise<void> {
    try {
      // Wait for images to load if enabled
      if (config.waitForImages !== false) {
        await page.waitForFunction(() => {
          // This code runs in browser context
          // @ts-expect-error - document is available in browser context
          const images = Array.from(document.images);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return images.every((img: any) => img.complete);
        }, { timeout: 10000 }).catch(() => {
          // Continue if timeout - some images may not load
        });
      }

      // Wait for fonts to load if enabled
      if (config.waitForFonts !== false) {
        await page.evaluate(() => {
          // This code runs in browser context
          // @ts-expect-error - document is available in browser context
          return document.fonts ? document.fonts.ready : Promise.resolve();
        }).catch(() => {
          // Continue if fonts API not supported
        });
      }

      // Apply delay before capture
      const delay = config.delayBeforeCapture ?? 500;
      if (delay > 0) {
        await page.waitForTimeout(delay);
      }

      // Ensure network is idle
      await page.waitForLoadState('networkidle').catch(() => {
        // Continue if networkidle not reached
      });
    } catch (error) {
      // Log but don't fail - screenshot should still be attempted
      console.warn('Warning during page readiness check:', error);
    }
  }
}
