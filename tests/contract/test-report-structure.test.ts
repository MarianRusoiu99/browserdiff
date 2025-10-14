import { describe, it, expect } from '@jest/globals';
import { ReportStructure, createReportStructure, REPORT_STRUCTURE_VALIDATION } from '../../src/models/report-structure';

describe('ReportStructure Model', () => {
  describe('Interface Definition', () => {
    it('should export ReportStructure interface', () => {
      expect(() => {
        require('../../src/models/report-structure');
      }).not.toThrow();
    });

    it('should define ReportStructure with required properties', () => {
      const timestamp = new Date();
      const structure: ReportStructure = {
        baseDirectory: '/test/output',
        timestamp,
        sanitizedUrl: 'example-com',
        paths: {
          htmlReport: 'report.html',
          jsonReport: 'report.json',
          screenshotsDir: 'screenshots/',
          diffsDir: 'diffs/'
        },
        metadata: {
          originalUrl: 'https://example.com',
          createdAt: timestamp,
          wasCollisionResolved: false
        }
      };

      expect(structure.baseDirectory).toBe('/test/output');
      expect(structure.timestamp).toBe(timestamp);
      expect(structure.sanitizedUrl).toBe('example-com');
      expect(structure.paths.htmlReport).toBe('report.html');
      expect(structure.paths.jsonReport).toBe('report.json');
      expect(structure.paths.screenshotsDir).toBe('screenshots/');
      expect(structure.paths.diffsDir).toBe('diffs/');
      expect(structure.metadata.originalUrl).toBe('https://example.com');
      expect(structure.metadata.createdAt).toBe(timestamp);
      expect(structure.metadata.wasCollisionResolved).toBe(false);
    });
  });

  describe('Factory Function', () => {
    it('should create ReportStructure with createReportStructure', () => {
      const baseDirectory = '/test/output';
      const originalUrl = 'https://example.com/test';
      const sanitizedUrl = 'example-com-test';
      const timestamp = new Date('2024-01-01T12:00:00Z');

      const structure = createReportStructure(baseDirectory, originalUrl, sanitizedUrl, timestamp);

      expect(structure.baseDirectory).toBe(baseDirectory);
      expect(structure.timestamp).toBe(timestamp);
      expect(structure.sanitizedUrl).toBe(sanitizedUrl);
      expect(structure.paths.htmlReport).toBe('report.html');
      expect(structure.paths.jsonReport).toBe('report.json');
      expect(structure.paths.screenshotsDir).toBe('screenshots/');
      expect(structure.paths.diffsDir).toBe('diffs/');
      expect(structure.metadata.originalUrl).toBe(originalUrl);
      expect(structure.metadata.createdAt).toBe(timestamp);
      expect(structure.metadata.wasCollisionResolved).toBe(false);
    });

    it('should use current timestamp when not provided', () => {
      const before = new Date();
      const structure = createReportStructure('/test', 'https://example.com', 'example-com');
      const after = new Date();

      expect(structure.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(structure.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('Validation Constants', () => {
    it('should define validation constants', () => {
      expect(REPORT_STRUCTURE_VALIDATION.MAX_DIRECTORY_NAME_LENGTH).toBe(255);
      expect(REPORT_STRUCTURE_VALIDATION.MAX_PATH_LENGTH).toBe(4096);
      expect(REPORT_STRUCTURE_VALIDATION.REQUIRED_PATHS).toEqual(['htmlReport', 'jsonReport', 'screenshotsDir', 'diffsDir']);
    });
  });
});