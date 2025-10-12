/**
 * ReportStructure interface and related types for organized report output
 */

export interface ReportStructure {
  /** Root directory for this test run */
  baseDirectory: string;

  /** Timestamp when test was initiated */
  timestamp: Date;

  /** Sanitized URL used for directory naming */
  sanitizedUrl: string;

  /** File paths relative to baseDirectory */
  paths: {
    htmlReport: string;         // report.html
    jsonReport: string;         // report.json
    screenshotsDir: string;     // screenshots/
    diffsDir: string;           // diffs/
  };

  /** Metadata about directory creation */
  metadata: {
    originalUrl: string;
    createdAt: Date;
    wasCollisionResolved: boolean;
    collisionSuffix?: string;
  };
}

/**
 * Factory function to create a new ReportStructure instance
 */
export function createReportStructure(
  baseDirectory: string,
  originalUrl: string,
  sanitizedUrl: string,
  timestamp: Date = new Date()
): ReportStructure {
  return {
    baseDirectory,
    timestamp,
    sanitizedUrl,
    paths: {
      htmlReport: 'report.html',
      jsonReport: 'report.json',
      screenshotsDir: 'screenshots/',
      diffsDir: 'diffs/'
    },
    metadata: {
      originalUrl,
      createdAt: timestamp,
      wasCollisionResolved: false
    }
  };
}

/**
 * Validation constants for ReportStructure
 */
export const REPORT_STRUCTURE_VALIDATION = {
  MAX_DIRECTORY_NAME_LENGTH: 255,
  MAX_PATH_LENGTH: 4096,
  REQUIRED_PATHS: ['htmlReport', 'jsonReport', 'screenshotsDir', 'diffsDir'] as const
} as const;