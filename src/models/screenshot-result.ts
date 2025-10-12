/**
 * Enhanced ScreenshotResult interface for full page screenshot metadata
 */

import { BrowserType } from 'playwright';

export interface ScreenshotResult {
  // Existing properties (preserved for compatibility)
  browser: BrowserType;
  filePath: string;
  width: number;
  height: number;

  // NEW: Full page metadata
  isFullPage: boolean;
  actualPageHeight: number;
  captureTime: number;           // Milliseconds to capture
  wasTruncated: boolean;         // True if height exceeded maxHeight
  truncationReason?: string;     // Reason for truncation if applicable
}

/**
 * Factory function to create a ScreenshotResult instance
 */
export function createScreenshotResult(
  browser: BrowserType,
  filePath: string,
  width: number,
  height: number,
  options: {
    isFullPage?: boolean;
    actualPageHeight?: number;
    captureTime?: number;
    wasTruncated?: boolean;
    truncationReason?: string;
  } = {}
): ScreenshotResult {
  return {
    browser,
    filePath,
    width,
    height,
    isFullPage: options.isFullPage ?? false,
    actualPageHeight: options.actualPageHeight ?? height,
    captureTime: options.captureTime ?? 0,
    wasTruncated: options.wasTruncated ?? false,
    truncationReason: options.truncationReason
  };
}

/**
 * Validation constants for ScreenshotResult
 */
export const SCREENSHOT_RESULT_VALIDATION = {
  MIN_WIDTH: 1,
  MIN_HEIGHT: 1,
  MAX_CAPTURE_TIME: 300000, // 5 minutes
  MAX_FILE_PATH_LENGTH: 4096
} as const;