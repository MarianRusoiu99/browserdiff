export type BrowserStatus = 'success' | 'failed' | 'timeout';

export interface BrowserMetadata {
  userAgent: string;
  platform: string;
  architecture: string;
  headless: boolean;
  viewport: { width: number; height: number };
  additionalFlags: string[];
}

// Import ScreenshotResult for enhanced screenshot metadata
import { ScreenshotResult } from './screenshot-result';

export class BrowserResult {
  public browserName: string;
  public browserVersion: string;
  public screenshotPath: string;
  public screenshotData: Buffer | null;
  public captureTimestamp: Date;
  public pageLoadTime: number;
  public errorMessage: string | null;
  public status: BrowserStatus;
  public metadata: BrowserMetadata;
  // NEW: Enhanced screenshot metadata
  public screenshot?: ScreenshotResult;

  constructor(
    browserName: string,
    browserVersion: string,
    metadata: BrowserMetadata
  ) {
    this.browserName = browserName;
    this.browserVersion = browserVersion;
    this.screenshotPath = '';
    this.screenshotData = null;
    this.captureTimestamp = new Date();
    this.pageLoadTime = 0;
    this.errorMessage = null;
    this.status = 'success';
    this.metadata = metadata;
  }

  public setScreenshot(path: string, data: Buffer | null = null): void {
    this.screenshotPath = path;
    this.screenshotData = data;
  }

  // NEW: Set enhanced screenshot result with full page metadata
  public setScreenshotResult(screenshotResult: ScreenshotResult): void {
    this.screenshot = screenshotResult;
    this.screenshotPath = screenshotResult.filePath;
  }

  public setPageLoadTime(time: number): void {
    this.pageLoadTime = time;
  }

  public setError(message: string): void {
    this.errorMessage = message;
    this.status = 'failed';
  }

  public setTimeout(): void {
    this.status = 'timeout';
  }

  public toJSON(): Record<string, unknown> {
    return {
      browserName: this.browserName,
      browserVersion: this.browserVersion,
      screenshotPath: this.screenshotPath,
      captureTimestamp: this.captureTimestamp.toISOString(),
      pageLoadTime: this.pageLoadTime,
      errorMessage: this.errorMessage,
      status: this.status,
      metadata: this.metadata,
      // NEW: Include screenshot metadata in JSON output
      screenshot: this.screenshot,
    };
  }
}

