import { describe, it, expect } from '@jest/globals';
import { 
  ReportConfig, 
  DEFAULT_REPORT_CONFIG 
} from '../../src/models/report-config';
import { 
  DEFAULT_URL_SANITIZATION_CONFIG 
} from '../../src/models/url-sanitization-config';

describe('ReportConfig Model', () => {
  describe('Interface Definition', () => {
    it('should export ReportConfig interface', () => {
      expect(() => {
        require('../../src/models/report-config');
      }).not.toThrow();
    });

    it('should have structured property as boolean', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: 'test-{url}',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(typeof config.structured).toBe('boolean');
    });

    it('should have directoryPattern property as string', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_{url}',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(typeof config.directoryPattern).toBe('string');
    });

    it('should have urlSanitization property as UrlSanitizationConfig', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: 'test-{url}',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(config.urlSanitization).toBeDefined();
      expect(typeof config.urlSanitization.maxLength).toBe('number');
    });
  });

  describe('Default Configuration', () => {
    it('should provide default report configuration', () => {
      expect(DEFAULT_REPORT_CONFIG).toBeDefined();
    });

    it('should default structured to false for backward compatibility', () => {
      expect(DEFAULT_REPORT_CONFIG.structured).toBe(false);
    });

    it('should default directoryPattern to ISO timestamp format', () => {
      expect(DEFAULT_REPORT_CONFIG.directoryPattern).toContain('YYYY-MM-DD');
      expect(DEFAULT_REPORT_CONFIG.directoryPattern).toContain('{url}');
    });

    it('should include default URL sanitization config', () => {
      expect(DEFAULT_REPORT_CONFIG.urlSanitization).toBeDefined();
      expect(DEFAULT_REPORT_CONFIG.urlSanitization).toEqual(DEFAULT_URL_SANITIZATION_CONFIG);
    });
  });

  describe('Directory Pattern', () => {
    it('should accept custom directory patterns', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: 'test-{timestamp}-{url}',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(config.directoryPattern).toBe('test-{timestamp}-{url}');
    });

    it('should allow timestamp-only patterns', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_HH-mm-ss',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(config.directoryPattern).not.toContain('{url}');
    });

    it('should allow URL-only patterns', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: '{url}',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(config.directoryPattern).toBe('{url}');
    });
  });

  describe('Configuration Examples', () => {
    it('should accept backward compatible configuration (structured: false)', () => {
      const config: ReportConfig = {
        structured: false,
        directoryPattern: '',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(config.structured).toBe(false);
    });

    it('should accept full structured configuration', () => {
      const config: ReportConfig = {
        structured: true,
        directoryPattern: 'YYYY-MM-DD_HH-mm-ss_{url}',
        urlSanitization: DEFAULT_URL_SANITIZATION_CONFIG
      };
      expect(config.structured).toBe(true);
      expect(config.directoryPattern).toBeTruthy();
    });
  });
});
