import { describe, it, expect } from '@jest/globals';
import { ScreenshotService } from '../../src/services/ScreenshotService';
import { TestConfig, DEFAULT_CONFIG } from '../../src/models/Config';
import { DEFAULT_SCREENSHOT_CONFIG } from '../../src/models/screenshot-config';

describe('ScreenshotService Extension', () => {
  describe('Enhanced Screenshot Capture', () => {
    it('should export ScreenshotService class', () => {
      expect(() => {
        require('../../src/services/ScreenshotService');
      }).not.toThrow();
    });

    it('should have captureScreenshotEnhanced method', () => {
      const service = new ScreenshotService(DEFAULT_CONFIG);
      expect(typeof service.captureScreenshotEnhanced).toBe('function');
    });

    it('should accept ScreenshotConfig parameter', () => {
      const service = new ScreenshotService(DEFAULT_CONFIG);
      const method = service.captureScreenshotEnhanced;

      // Check method signature by counting parameters
      // Note: This is a basic check - full testing would require mocking Playwright
      expect(method.length).toBe(3); // page, browser, outputDir (screenshotConfig has default)
    });

    it('should maintain backward compatibility', () => {
      const service = new ScreenshotService(DEFAULT_CONFIG);
      expect(typeof service.captureScreenshot).toBe('function');
      expect(service.captureScreenshot.length).toBe(3); // page, browserName, outputDir
    });

    it('should use default screenshot config when not provided', () => {
      const config: TestConfig = { ...DEFAULT_CONFIG };
      delete config.screenshot; // Remove screenshot config

      const service = new ScreenshotService(config);
      expect(service).toBeDefined();
    });

    it('should support full page screenshot configuration', () => {
      const config: TestConfig = {
        ...DEFAULT_CONFIG,
        screenshot: {
          ...DEFAULT_SCREENSHOT_CONFIG,
          fullPage: true,
          maxHeight: 5000,
          timeout: 30000
        }
      };

      const service = new ScreenshotService(config);
      expect(service).toBeDefined();
    });
  });

  describe('Configuration Integration', () => {
    it('should accept TestConfig with screenshot property', () => {
      const config: TestConfig = {
        ...DEFAULT_CONFIG,
        screenshot: DEFAULT_SCREENSHOT_CONFIG
      };

      const service = new ScreenshotService(config);
      expect(service).toBeDefined();
    });

    it('should handle missing screenshot config gracefully', () => {
      const config: Partial<TestConfig> = { ...DEFAULT_CONFIG };
      delete config.screenshot;

      const service = new ScreenshotService(config as TestConfig);
      expect(service).toBeDefined();
    });
  });
});