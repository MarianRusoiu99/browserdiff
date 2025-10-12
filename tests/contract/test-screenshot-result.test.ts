import { describe, it, expect } from '@jest/globals';
import { BrowserType } from 'playwright';
import { ScreenshotResult, createScreenshotResult, SCREENSHOT_RESULT_VALIDATION } from '../../src/models/screenshot-result';

describe('ScreenshotResult Model', () => {
  describe('Interface Definition', () => {
    it('should export ScreenshotResult interface', () => {
      expect(() => {
        require('../../src/models/screenshot-result');
      }).not.toThrow();
    });

    it('should define ScreenshotResult with required properties', () => {
      const result: ScreenshotResult = {
        browser: 'chromium' as unknown as BrowserType,
        filePath: '/test/screenshot.png',
        width: 1920,
        height: 1080,
        isFullPage: false,
        actualPageHeight: 1080,
        captureTime: 1500,
        wasTruncated: false
      };

      expect(result.browser).toBe('chromium');
      expect(result.filePath).toBe('/test/screenshot.png');
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.isFullPage).toBe(false);
      expect(result.actualPageHeight).toBe(1080);
      expect(result.captureTime).toBe(1500);
      expect(result.wasTruncated).toBe(false);
      expect(result.truncationReason).toBeUndefined();
    });

    it('should support full page screenshot metadata', () => {
      const result: ScreenshotResult = {
        browser: 'firefox' as unknown as BrowserType,
        filePath: '/test/fullpage.png',
        width: 1920,
        height: 5000,
        isFullPage: true,
        actualPageHeight: 8000,
        captureTime: 3000,
        wasTruncated: true,
        truncationReason: 'Exceeded maxHeight limit of 5000px'
      };

      expect(result.isFullPage).toBe(true);
      expect(result.actualPageHeight).toBe(8000);
      expect(result.wasTruncated).toBe(true);
      expect(result.truncationReason).toBe('Exceeded maxHeight limit of 5000px');
    });
  });

  describe('Factory Function', () => {
    it('should create ScreenshotResult with createScreenshotResult', () => {
      const result = createScreenshotResult(
        'webkit' as unknown as BrowserType,
        '/test/screenshot.png',
        1920,
        1080,
        {
          isFullPage: true,
          actualPageHeight: 3000,
          captureTime: 2000,
          wasTruncated: false
        }
      );

      expect(result.browser).toBe('webkit');
      expect(result.filePath).toBe('/test/screenshot.png');
      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
      expect(result.isFullPage).toBe(true);
      expect(result.actualPageHeight).toBe(3000);
      expect(result.captureTime).toBe(2000);
      expect(result.wasTruncated).toBe(false);
      expect(result.truncationReason).toBeUndefined();
    });

    it('should provide default values for optional properties', () => {
      const result = createScreenshotResult(
        'chromium' as unknown as BrowserType,
        '/test/screenshot.png',
        1920,
        1080
      );

      expect(result.isFullPage).toBe(false);
      expect(result.actualPageHeight).toBe(1080);
      expect(result.captureTime).toBe(0);
      expect(result.wasTruncated).toBe(false);
      expect(result.truncationReason).toBeUndefined();
    });
  });

  describe('Validation Constants', () => {
    it('should define validation constants', () => {
      expect(SCREENSHOT_RESULT_VALIDATION.MIN_WIDTH).toBe(1);
      expect(SCREENSHOT_RESULT_VALIDATION.MIN_HEIGHT).toBe(1);
      expect(SCREENSHOT_RESULT_VALIDATION.MAX_CAPTURE_TIME).toBe(300000);
      expect(SCREENSHOT_RESULT_VALIDATION.MAX_FILE_PATH_LENGTH).toBe(4096);
    });
  });
});