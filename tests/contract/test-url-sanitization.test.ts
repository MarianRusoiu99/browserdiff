import { describe, it, expect } from '@jest/globals';
import {
  sanitizeUrlForFilesystem,
  isFilesystemSafe,
  generateCollisionSafeName
} from '../../src/utils/url-sanitization';
import { UrlSanitizationConfig, DEFAULT_URL_SANITIZATION_CONFIG } from '../../src/models/url-sanitization-config';

describe('URL Sanitization Utility', () => {
  describe('sanitizeUrlForFilesystem', () => {
    it('should export sanitizeUrlForFilesystem function', () => {
      expect(() => {
        require('../../src/utils/url-sanitization');
      }).not.toThrow();
    });

    it('should sanitize basic URL with default config', () => {
      const result = sanitizeUrlForFilesystem('https://example.com/path/to/page');
      expect(result).toBe('example.com/path/to/page');
    });

    it('should remove protocol when configured', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        removeProtocol: true
      };
      const result = sanitizeUrlForFilesystem('https://example.com', config);
      expect(result).toBe('example.com');
    });

    it('should preserve protocol when configured', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        removeProtocol: false
      };
      const result = sanitizeUrlForFilesystem('https://example.com', config);
      expect(result).toBe('https-//example.com');
    });

    it('should apply character mapping', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        characterMap: { '/': '_', ':': '_' },
        removeProtocol: true,
        preserveStructure: false
      };
      const result = sanitizeUrlForFilesystem('https://example.com/path:file', config);
      expect(result).toBe('example.com_path_file');
    });

    it('should preserve structure when configured', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        preserveStructure: true
      };
      const result = sanitizeUrlForFilesystem('https://example.com/path/to/page', config);
      expect(result).toBe('example.com/path/to/page');
    });

    it('should flatten structure when configured', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        preserveStructure: false
      };
      const result = sanitizeUrlForFilesystem('https://example.com/path/to/page', config);
      expect(result).toBe('example.com-path-to-page');
    });

    it('should truncate to maxLength', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        maxLength: 10
      };
      const result = sanitizeUrlForFilesystem('https://very-long-domain-name.com/path', config);
      expect(result.length).toBeLessThanOrEqual(10);
      expect(result).toBe('very-long');
    });

    it('should remove leading/trailing invalid characters', () => {
      const result = sanitizeUrlForFilesystem('https://example.com/-path-');
      expect(result).toBe('example.com/-path');
    });

    it('should provide fallback for empty result', () => {
      const config: UrlSanitizationConfig = {
        ...DEFAULT_URL_SANITIZATION_CONFIG,
        maxLength: 1,
        removeProtocol: true
      };
      const result = sanitizeUrlForFilesystem('https://a.com', config);
      expect(result).toBe('a');
    });
  });

  describe('isFilesystemSafe', () => {
    it('should validate filesystem-safe names', () => {
      expect(isFilesystemSafe('valid-name')).toBe(true);
      expect(isFilesystemSafe('valid_name')).toBe(true);
      expect(isFilesystemSafe('valid.name')).toBe(true);
    });

    it('should reject invalid characters', () => {
      expect(isFilesystemSafe('invalid<name>')).toBe(false);
      expect(isFilesystemSafe('invalid"name')).toBe(false);
      expect(isFilesystemSafe('invalid|name')).toBe(false);
      expect(isFilesystemSafe('invalid?name')).toBe(false);
      expect(isFilesystemSafe('invalid*name')).toBe(false);
    });

    it('should reject reserved Windows names', () => {
      expect(isFilesystemSafe('CON')).toBe(false);
      expect(isFilesystemSafe('PRN')).toBe(false);
      expect(isFilesystemSafe('COM1')).toBe(false);
      expect(isFilesystemSafe('LPT9')).toBe(false);
    });

    it('should reject leading/trailing spaces or dots', () => {
      expect(isFilesystemSafe(' invalid')).toBe(false);
      expect(isFilesystemSafe('invalid ')).toBe(false);
      expect(isFilesystemSafe('.invalid')).toBe(false);
      expect(isFilesystemSafe('invalid.')).toBe(false);
    });
  });

  describe('generateCollisionSafeName', () => {
    it('should return original name when no collision', () => {
      const result = generateCollisionSafeName('test-name', []);
      expect(result).toBe('test-name');
    });

    it('should append suffix for collision resolution', () => {
      const result = generateCollisionSafeName('test-name', ['test-name']);
      expect(result).toBe('test-name_1');
    });

    it('should increment suffix until unique', () => {
      const existing = ['test-name', 'test-name_1', 'test-name_2'];
      const result = generateCollisionSafeName('test-name', existing);
      expect(result).toBe('test-name_3');
    });

    it('should use timestamp fallback after max attempts', () => {
      const existing = Array.from({ length: 100 }, (_, i) => `test-name${i > 0 ? `_${i}` : ''}`);
      const result = generateCollisionSafeName('test-name', existing, 5);
      expect(result).toMatch(/^test-name_\d+$/);
      expect(result).not.toBe('test-name');
    });
  });
});