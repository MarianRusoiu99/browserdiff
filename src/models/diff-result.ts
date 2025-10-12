/**
 * Enhanced DiffResult interface for full page diff metadata
 */

import { BrowserType } from 'playwright';

export interface DiffResult {
  // Existing properties (preserved for compatibility)
  browser1: BrowserType;
  browser2: BrowserType;
  similarity: number;
  differenceCount: number;
  diffImagePath: string;

  // NEW: Full page diff metadata
  comparisonType: 'viewport' | 'fullpage';
  heightDifference: number;      // Difference in page heights
  scrollableRegions: number;     // Count of regions requiring scroll
}

/**
 * Factory function to create a DiffResult instance
 */
export function createDiffResult(
  browser1: BrowserType,
  browser2: BrowserType,
  similarity: number,
  differenceCount: number,
  diffImagePath: string,
  options: {
    comparisonType?: 'viewport' | 'fullpage';
    heightDifference?: number;
    scrollableRegions?: number;
  } = {}
): DiffResult {
  return {
    browser1,
    browser2,
    similarity,
    differenceCount,
    diffImagePath,
    comparisonType: options.comparisonType ?? 'viewport',
    heightDifference: options.heightDifference ?? 0,
    scrollableRegions: options.scrollableRegions ?? 0
  };
}

/**
 * Validation constants for DiffResult
 */
export const DIFF_RESULT_VALIDATION = {
  MIN_SIMILARITY: 0,
  MAX_SIMILARITY: 1,
  MIN_DIFFERENCE_COUNT: 0,
  MAX_SCROLLABLE_REGIONS: 1000,
  MAX_FILE_PATH_LENGTH: 4096
} as const;