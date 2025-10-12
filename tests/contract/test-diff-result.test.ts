import { describe, it, expect } from '@jest/globals';
import { BrowserType } from 'playwright';
import { DiffResult, createDiffResult, DIFF_RESULT_VALIDATION } from '../../src/models/diff-result';

describe('DiffResult Model', () => {
  describe('Interface Definition', () => {
    it('should export DiffResult interface', () => {
      expect(() => {
        require('../../src/models/diff-result');
      }).not.toThrow();
    });

    it('should define DiffResult with required properties', () => {
      const result: DiffResult = {
        browser1: 'chromium' as unknown as BrowserType,
        browser2: 'firefox' as unknown as BrowserType,
        similarity: 0.95,
        differenceCount: 150,
        diffImagePath: '/test/diff.png',
        comparisonType: 'viewport',
        heightDifference: 0,
        scrollableRegions: 0
      };

      expect(result.browser1).toBe('chromium');
      expect(result.browser2).toBe('firefox');
      expect(result.similarity).toBe(0.95);
      expect(result.differenceCount).toBe(150);
      expect(result.diffImagePath).toBe('/test/diff.png');
      expect(result.comparisonType).toBe('viewport');
      expect(result.heightDifference).toBe(0);
      expect(result.scrollableRegions).toBe(0);
    });

    it('should support full page diff metadata', () => {
      const result: DiffResult = {
        browser1: 'webkit' as unknown as BrowserType,
        browser2: 'chromium' as unknown as BrowserType,
        similarity: 0.87,
        differenceCount: 2500,
        diffImagePath: '/test/fullpage-diff.png',
        comparisonType: 'fullpage',
        heightDifference: 200,
        scrollableRegions: 3
      };

      expect(result.comparisonType).toBe('fullpage');
      expect(result.heightDifference).toBe(200);
      expect(result.scrollableRegions).toBe(3);
    });
  });

  describe('Factory Function', () => {
    it('should create DiffResult with createDiffResult', () => {
      const result = createDiffResult(
        'chromium' as unknown as BrowserType,
        'firefox' as unknown as BrowserType,
        0.92,
        200,
        '/test/diff.png',
        {
          comparisonType: 'fullpage',
          heightDifference: 150,
          scrollableRegions: 2
        }
      );

      expect(result.browser1).toBe('chromium');
      expect(result.browser2).toBe('firefox');
      expect(result.similarity).toBe(0.92);
      expect(result.differenceCount).toBe(200);
      expect(result.diffImagePath).toBe('/test/diff.png');
      expect(result.comparisonType).toBe('fullpage');
      expect(result.heightDifference).toBe(150);
      expect(result.scrollableRegions).toBe(2);
    });

    it('should provide default values for optional properties', () => {
      const result = createDiffResult(
        'webkit' as unknown as BrowserType,
        'chromium' as unknown as BrowserType,
        1.0,
        0,
        '/test/diff.png'
      );

      expect(result.comparisonType).toBe('viewport');
      expect(result.heightDifference).toBe(0);
      expect(result.scrollableRegions).toBe(0);
    });
  });

  describe('Validation Constants', () => {
    it('should define validation constants', () => {
      expect(DIFF_RESULT_VALIDATION.MIN_SIMILARITY).toBe(0);
      expect(DIFF_RESULT_VALIDATION.MAX_SIMILARITY).toBe(1);
      expect(DIFF_RESULT_VALIDATION.MIN_DIFFERENCE_COUNT).toBe(0);
      expect(DIFF_RESULT_VALIDATION.MAX_SCROLLABLE_REGIONS).toBe(1000);
      expect(DIFF_RESULT_VALIDATION.MAX_FILE_PATH_LENGTH).toBe(4096);
    });
  });
});