# Data Model: Full Page Screenshots and Report Organization

## Overview
This document defines the data models and entities for implementing full page screenshots and organized report structure in BrowserDiff CLI.

## Core Entities

### Enhanced TestConfig
```typescript
interface TestConfig {
  // Existing configuration properties (preserved for compatibility)
  url: string;
  browsers: BrowserType[];
  viewport: ViewportConfig;
  outputDir: string;
  threshold: number;
  
  // NEW: Screenshot configuration
  screenshot: ScreenshotConfig;
  
  // NEW: Report organization
  reporting: ReportConfig;
}
```

### NEW: ScreenshotConfig
```typescript
interface ScreenshotConfig {
  /** Enable full page screenshot capture */
  fullPage: boolean;
  
  /** Maximum page height for full page screenshots (default: 20000px) */
  maxHeight: number;
  
  /** Timeout for screenshot capture in milliseconds (default: 60000) */
  timeout: number;
  
  /** Quality setting for PNG compression (0-100, default: 90) */
  quality: number;
}
```

**Validation Rules**:
- `maxHeight` must be between 1,000 and 50,000 pixels
- `timeout` must be between 10,000 and 300,000 milliseconds  
- `quality` must be between 0 and 100
- `fullPage: false` ignores `maxHeight` setting

**Default Values**:
```typescript
const defaultScreenshotConfig: ScreenshotConfig = {
  fullPage: false,           // Maintains backward compatibility
  maxHeight: 20000,          // Covers 99% of real-world pages
  timeout: 60000,            // 60 seconds for complex pages
  quality: 90                // High quality with reasonable file size
};
```

### NEW: ReportConfig  
```typescript
interface ReportConfig {
  /** Enable structured output directory organization */
  structured: boolean;
  
  /** Directory naming pattern for structured output */
  directoryPattern: string;
  
  /** URL sanitization configuration */
  urlSanitization: UrlSanitizationConfig;
}
```

**Default Values**:
```typescript
const defaultReportConfig: ReportConfig = {
  structured: false,                                    // Maintains backward compatibility
  directoryPattern: 'YYYY-MM-DD_HH-mm-ss_SSS_{url}',  // ISO timestamp + URL
  urlSanitization: defaultUrlSanitizationConfig
};
```

### NEW: UrlSanitizationConfig
```typescript
interface UrlSanitizationConfig {
  /** Maximum length for sanitized URL portion */
  maxLength: number;
  
  /** Whether to remove protocol (http://, https://) */
  removeProtocol: boolean;
  
  /** Character replacement mapping for invalid filesystem characters */
  characterMap: Record<string, string>;
  
  /** Whether to preserve subdirectories as dashes */
  preserveStructure: boolean;
}
```

**Default Values**:
```typescript
const defaultUrlSanitizationConfig: UrlSanitizationConfig = {
  maxLength: 100,
  removeProtocol: true,
  characterMap: {
    '/': '-',
    '\\': '-', 
    ':': '-',
    '*': '-',
    '?': '-',
    '"': '-',
    '<': '-',
    '>': '-',
    '|': '-'
  },
  preserveStructure: true
};
```

## Enhanced Result Entities

### Enhanced ScreenshotResult
```typescript
interface ScreenshotResult {
  // Existing properties (preserved for compatibility)
  browser: BrowserType;
  filePath: string;
  width: number;
  height: number;
  
  // NEW: Full page metadata  
  isFullPage: boolean;
  actualPageHeight: number;
  captureTime: number;           // Milliseconds to capture
  wasTruncated: boolean;         // True if height exceeded maxHeight
  truncationReason?: string;     // Reason for truncation if applicable
}
```

### Enhanced DiffResult
```typescript
interface DiffResult {
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
```

### NEW: ReportStructure
```typescript
interface ReportStructure {
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
```

## State Transitions

### Screenshot Capture Flow
```
Initial → ValidatingPage → CapturingScreenshot → ProcessingResult → Complete
       ↓                 ↓                    ↓                  ↓
       Error            Timeout              TruncatedCapture    Success
```

**State Validation**:
- `ValidatingPage`: Check page height against maxHeight limit
- `CapturingScreenshot`: Monitor memory usage and timeout
- `ProcessingResult`: Validate file creation and metadata
- `TruncatedCapture`: Handle graceful fallback when limits exceeded

### Report Generation Flow
```
Initial → CreatingStructure → GeneratingArtifacts → WritingReports → Complete
       ↓                    ↓                     ↓                ↓
       Error               DirectoryExists       WriteError       Success
```

**State Handling**:
- `DirectoryExists`: Resolve collision with random suffix
- `WriteError`: Clean up partial artifacts and retry
- Success`: Update ReportStructure with final paths

## Relationship Models

### TestRun Composition
```typescript
interface TestRunResult {
  config: TestConfig;
  structure: ReportStructure;        // NEW: Directory organization
  screenshots: ScreenshotResult[];   // Enhanced with full page metadata
  diffs: DiffResult[];              // Enhanced with comparison type
  performance: PerformanceMetrics;   // NEW: Timing and memory data
  errors: TestError[];
}
```

### NEW: PerformanceMetrics
```typescript
interface PerformanceMetrics {
  /** Total test execution time */
  totalDuration: number;
  
  /** Time spent on screenshot capture by browser */
  screenshotTiming: Record<BrowserType, number>;
  
  /** Peak memory usage during test */
  peakMemoryUsage: number;
  
  /** Page load timing for each browser */
  pageLoadTiming: Record<BrowserType, number>;
  
  /** File I/O timing for report generation */
  reportGenerationTime: number;
}
```

## Validation and Constraints

### Configuration Validation
```typescript
const configValidation = {
  screenshot: {
    maxHeight: { min: 1000, max: 50000, default: 20000 },
    timeout: { min: 10000, max: 300000, default: 60000 },
    quality: { min: 0, max: 100, default: 90 }
  },
  reporting: {
    directoryPattern: { 
      required: ['YYYY', 'MM', 'DD', '{url}'],
      maxLength: 255 
    },
    urlSanitization: {
      maxLength: { min: 20, max: 200, default: 100 }
    }
  }
};
```

### Cross-Field Validation
- If `structured: true`, `directoryPattern` must contain `{url}` placeholder
- If `fullPage: false`, performance metrics exclude page height calculations
- Browser compatibility: WebKit may have different full page behavior

## Backward Compatibility

### Configuration Migration
```typescript
// Legacy config (v1.x) → Enhanced config (v2.x)
function migrateConfig(legacyConfig: any): TestConfig {
  return {
    ...legacyConfig,
    screenshot: {
      fullPage: false,     // Preserve existing behavior
      maxHeight: 20000,
      timeout: 60000,
      quality: 90
    },
    reporting: {
      structured: false,   // Preserve existing output structure
      directoryPattern: 'YYYY-MM-DD_HH-mm-ss_SSS_{url}',
      urlSanitization: defaultUrlSanitizationConfig
    }
  };
}
```

### Result Compatibility
- Existing `ScreenshotResult` fields preserved with same types
- New fields added with safe defaults
- JSON report format remains backward compatible
- HTML report enhanced with progressive disclosure of new features

## Data Persistence

### Configuration Storage
- JSON configuration files support new nested structure
- CLI flags map to configuration properties
- Environment variable overrides supported
- Schema validation prevents invalid configurations

### Result Storage  
- JSON reports include full enhanced metadata
- File naming preserves existing patterns for compatibility
- Directory structure accommodates both legacy and structured modes
- Artifact cleanup utilities understand new organization

This data model provides a solid foundation for implementing full page screenshots and report organization while maintaining full backward compatibility with existing BrowserDiff installations.