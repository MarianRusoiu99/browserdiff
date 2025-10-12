import { describe, it, expect } from '@jest/globals';
import { TestConfig, DEFAULT_CONFIG, validateConfig, mergeConfig } from '../../src/models/Config';

describe('TestConfig Model', () => {
  describe('Enhanced Interface Definition', () => {
    it('should export TestConfig interface with enhanced properties', () => {
      expect(() => {
        require('../../src/models/Config');
      }).not.toThrow();
    });

    it('should define TestConfig with existing and new properties', () => {
      const config: TestConfig = {
        ...DEFAULT_CONFIG,
        url: 'https://example.com',
        outputDir: './custom-reports',
        threshold: 0.05,
        screenshot: {
          fullPage: true,
          maxHeight: 15000,
          timeout: 45000,
          quality: 85
        },
        reporting: {
          structured: true,
          directoryPattern: 'test-{url}',
          urlSanitization: {
            maxLength: 50,
            removeProtocol: true,
            characterMap: { '/': '-', ':': '-' },
            preserveStructure: false
          }
        }
      };

      expect(config.url).toBe('https://example.com');
      expect(config.outputDir).toBe('./custom-reports');
      expect(config.threshold).toBe(0.05);
      expect(config.screenshot?.fullPage).toBe(true);
      expect(config.reporting?.structured).toBe(true);
    });

    it('should maintain backward compatibility with existing properties', () => {
      const config: TestConfig = {
        browsers: ['chromium', 'firefox'],
        viewport: { width: 1280, height: 720 },
        comparison: { threshold: 0.2, includeAA: false },
        output: { directory: './output', format: 'html', embedAssets: false },
        timeout: { pageLoad: 20000, screenshot: 3000 },
        retry: { attempts: 2, delay: 500 },
        parallel: 2
      };

      expect(config.browsers).toEqual(['chromium', 'firefox']);
      expect(config.viewport.width).toBe(1280);
      expect(config.comparison.threshold).toBe(0.2);
      expect(config.output.directory).toBe('./output');
    });
  });

  describe('Default Configuration', () => {
    it('should provide default configuration with enhanced properties', () => {
      expect(DEFAULT_CONFIG.screenshot).toBeDefined();
      expect(DEFAULT_CONFIG.reporting).toBeDefined();
      expect(DEFAULT_CONFIG.screenshot?.fullPage).toBe(false);
      expect(DEFAULT_CONFIG.reporting?.structured).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate browsers array', () => {
      const errors = validateConfig({ browsers: [] });
      expect(errors).toContain('At least one browser must be specified');
    });

    it('should validate invalid browsers', () => {
      const errors = validateConfig({ browsers: ['invalid-browser'] });
      expect(errors).toContain('Invalid browsers: invalid-browser');
    });

    it('should validate viewport dimensions', () => {
      const errors = validateConfig({
        viewport: { width: 100, height: 100 }
      });
      expect(errors).toContain('Viewport width must be between 320 and 7680');
      expect(errors).toContain('Viewport height must be between 240 and 4320');
    });

    it('should validate comparison threshold', () => {
      const errors = validateConfig({
        comparison: { threshold: 1.5, includeAA: true }
      });
      expect(errors).toContain('Comparison threshold must be between 0.0 and 1.0');
    });
  });

  describe('Configuration Merging', () => {
    it('should merge configurations correctly', () => {
      const base: TestConfig = {
        ...DEFAULT_CONFIG,
        browsers: ['chromium']
      };

      const override: Partial<TestConfig> = {
        browsers: ['firefox', 'webkit'],
        viewport: { width: 1024, height: 768 }
      };

      const merged = mergeConfig(base, override);

      expect(merged.browsers).toEqual(['firefox', 'webkit']);
      expect(merged.viewport.width).toBe(1024);
      expect(merged.viewport.height).toBe(768);
      expect(merged.comparison.threshold).toBe(DEFAULT_CONFIG.comparison.threshold);
    });
  });
});