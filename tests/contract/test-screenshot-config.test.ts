import { describe, it, expect } from '@jest/globals';
import { 
  ScreenshotConfig, 
  DEFAULT_SCREENSHOT_CONFIG, 
  SCREENSHOT_CONFIG_VALIDATION 
} from '../../src/models/screenshot-config';

describe('ScreenshotConfig Model', () => {
  describe('Interface Definition', () => {
    it('should export ScreenshotConfig interface', () => {
      expect(() => {
        require('../../src/models/screenshot-config');
      }).not.toThrow();
    });

    it('should have fullPage property as boolean', () => {
      const config: ScreenshotConfig = {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      };
      expect(typeof config.fullPage).toBe('boolean');
    });

    it('should have maxHeight property as number', () => {
      const config: ScreenshotConfig = {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      };
      expect(typeof config.maxHeight).toBe('number');
    });

    it('should have timeout property as number', () => {
      const config: ScreenshotConfig = {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      };
      expect(typeof config.timeout).toBe('number');
    });

    it('should have quality property as number', () => {
      const config: ScreenshotConfig = {
        fullPage: true,
        maxHeight: 20000,
        timeout: 60000,
        quality: 90
      };
      expect(typeof config.quality).toBe('number');
    });
  });

  describe('Default Configuration', () => {
    it('should provide default screenshot configuration', () => {
      expect(DEFAULT_SCREENSHOT_CONFIG).toBeDefined();
    });

    it('should default fullPage to false for backward compatibility', () => {
      expect(DEFAULT_SCREENSHOT_CONFIG.fullPage).toBe(false);
    });

    it('should default maxHeight to 20000 pixels', () => {
      expect(DEFAULT_SCREENSHOT_CONFIG.maxHeight).toBe(20000);
    });

    it('should default timeout to 60000 milliseconds (60 seconds)', () => {
      expect(DEFAULT_SCREENSHOT_CONFIG.timeout).toBe(60000);
    });

    it('should default quality to 90', () => {
      expect(DEFAULT_SCREENSHOT_CONFIG.quality).toBe(90);
    });
  });

  describe('Validation Rules', () => {
    it('should export validation rules', () => {
      expect(SCREENSHOT_CONFIG_VALIDATION).toBeDefined();
    });

    it('should define maxHeight validation range (1000-50000)', () => {
      expect(SCREENSHOT_CONFIG_VALIDATION.maxHeight.min).toBe(1000);
      expect(SCREENSHOT_CONFIG_VALIDATION.maxHeight.max).toBe(50000);
    });

    it('should define timeout validation range (10000-300000)', () => {
      expect(SCREENSHOT_CONFIG_VALIDATION.timeout.min).toBe(10000);
      expect(SCREENSHOT_CONFIG_VALIDATION.timeout.max).toBe(300000);
    });

    it('should define quality validation range (0-100)', () => {
      expect(SCREENSHOT_CONFIG_VALIDATION.quality.min).toBe(0);
      expect(SCREENSHOT_CONFIG_VALIDATION.quality.max).toBe(100);
    });
  });

  describe('Configuration Examples', () => {
    it('should accept minimal configuration', () => {
      const config: ScreenshotConfig = {
        fullPage: false,
        maxHeight: 10000,
        timeout: 30000,
        quality: 80
      };
      expect(config).toBeDefined();
    });

    it('should accept full page configuration', () => {
      const config: ScreenshotConfig = {
        fullPage: true,
        maxHeight: 30000,
        timeout: 90000,
        quality: 95
      };
      expect(config).toBeDefined();
    });

    it('should accept default configuration', () => {
      const config: ScreenshotConfig = DEFAULT_SCREENSHOT_CONFIG;
      expect(config.fullPage).toBe(false);
      expect(config.maxHeight).toBe(20000);
    });
  });
});
