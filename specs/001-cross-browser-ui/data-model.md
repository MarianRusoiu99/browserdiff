# Data Model: Cross-Browser UI Diff CLI Tool

**Feature**: Cross-Browser UI Diff CLI Tool  
**Date**: 2025-10-01  
**Phase**: 1 - Data Model Design

## Core Entities

### TestSession
Represents a complete cross-browser testing execution.

**Properties**:
- `sessionId`: string (UUID) - Unique identifier for the test run
- `targetUrl`: string - URL or file path being tested
- `browsers`: string[] - List of browser names used in testing
- `timestamp`: Date - When the test session was initiated
- `viewport`: Viewport - Screen dimensions used for testing
- `config`: TestConfig - Configuration used for this session
- `status`: 'running' | 'completed' | 'failed' - Current session state
- `results`: BrowserResult[] - Array of browser-specific test results

**Relationships**:
- Has many BrowserResult entities
- References one TestConfig entity
- May reference one BaselineReference entity

### BrowserResult
Contains screenshot and metadata for a single browser's rendering.

**Properties**:
- `browserName`: string - Browser identifier ('chromium', 'firefox', 'webkit')
- `browserVersion`: string - Full browser version string
- `screenshotPath`: string - Relative path to captured screenshot
- `screenshotData`: Buffer | null - Raw image data (optional, for in-memory processing)
- `captureTimestamp`: Date - When screenshot was taken
- `pageLoadTime`: number - Time taken to load the page (ms)
- `errorMessage`: string | null - Error details if capture failed
- `status`: 'success' | 'failed' | 'timeout' - Capture result status
- `metadata`: BrowserMetadata - Additional browser-specific information

**Relationships**:
- Belongs to one TestSession entity
- May have one DifferenceReport entity (if compared against baseline)

### BaselineReference
Represents the reference image used for visual comparison.

**Properties**:
- `baselineId`: string - Unique identifier for the baseline
- `imagePath`: string - Path to the baseline image file
- `imageHash`: string - SHA-256 hash of the image content
- `createdAt`: Date - When baseline was established
- `updatedAt`: Date - Last modification timestamp
- `targetUrl`: string - URL this baseline represents
- `viewport`: Viewport - Viewport dimensions for this baseline
- `browserName`: string - Browser used to create baseline
- `version`: string - Baseline version (for tracking changes)

**Relationships**:
- May be referenced by multiple TestSession entities
- Used by DifferenceReport entities for comparison

### DifferenceReport
Contains visual comparison results between browser rendering and baseline.

**Properties**:
- `comparisonId`: string - Unique identifier for this comparison
- `baselineId`: string - Reference to baseline used
- `browserResult`: string - Reference to browser result compared
- `differenceImagePath`: string - Path to generated diff image
- `pixelDifference`: number - Number of different pixels
- `percentageDifference`: number - Percentage of image that differs
- `threshold`: number - Threshold used for comparison
- `comparisonTimestamp`: Date - When comparison was performed
- `status`: 'match' | 'different' | 'error' - Comparison result
- `metadata`: DiffMetadata - Additional comparison information

**Relationships**:
- References one BaselineReference entity
- References one BrowserResult entity
- Belongs to one TestSession entity

### HTMLReport
Represents the generated HTML report containing all test results.

**Properties**:
- `reportId`: string - Unique identifier for the report
- `sessionId`: string - Reference to the test session
- `reportPath`: string - Path to the generated HTML file
- `assetPaths`: string[] - Paths to all embedded assets (images, CSS, JS)
- `generatedAt`: Date - When report was created
- `templateVersion`: string - Version of report template used
- `title`: string - Report title/name
- `summary`: ReportSummary - High-level results summary

**Relationships**:
- References one TestSession entity
- Contains multiple asset references

## Supporting Types

### Viewport
```typescript
interface Viewport {
  width: number;    // Screen width in pixels
  height: number;   // Screen height in pixels
  deviceScaleFactor?: number; // Default: 1
}
```

### TestConfig
```typescript
interface TestConfig {
  browsers: string[];
  viewport: Viewport;
  comparison: {
    threshold: number;        // 0.0 to 1.0
    includeAA: boolean;      // Anti-aliasing consideration
    ignoreColors: string[];  // Colors to ignore in comparison
  };
  output: {
    directory: string;
    format: 'html';         // Future: 'json', 'junit'
    embedAssets: boolean;   // Inline vs external assets
  };
  timeout: {
    pageLoad: number;       // Page load timeout (ms)
    screenshot: number;     // Screenshot capture timeout (ms)
  };
  retry: {
    attempts: number;       // Max retry attempts for failures
    delay: number;         // Delay between retries (ms)
  };
}
```

### BrowserMetadata
```typescript
interface BrowserMetadata {
  userAgent: string;
  platform: string;        // 'linux', 'darwin', 'win32'
  architecture: string;    // 'x64', 'arm64'
  headless: boolean;
  viewport: Viewport;
  additionalFlags: string[]; // Browser-specific launch flags
}
```

### DiffMetadata
```typescript
interface DiffMetadata {
  algorithm: string;        // 'pixelmatch'
  algorithmVersion: string;
  processingTime: number;   // Time taken for comparison (ms)
  imageFormat: string;      // 'png', 'jpeg'
  colorChannels: number;    // 3 (RGB) or 4 (RGBA)
  antiAliasing: boolean;
  regions: DiffRegion[];    // Areas of difference
}
```

### DiffRegion
```typescript
interface DiffRegion {
  x: number;               // X coordinate of difference region
  y: number;               // Y coordinate of difference region
  width: number;           // Width of difference region
  height: number;          // Height of difference region
  severity: 'low' | 'medium' | 'high'; // Difference intensity
}
```

### ReportSummary
```typescript
interface ReportSummary {
  totalBrowsers: number;
  successfulCaptures: number;
  failedCaptures: number;
  comparisonsPerformed: number;
  matchingResults: number;
  differentResults: number;
  overallStatus: 'pass' | 'fail' | 'partial';
  executionTime: number;    // Total execution time (ms)
}
```

## Data Flow

### Test Execution Flow
```
1. TestSession created with initial configuration
2. Multiple BrowserResult entities created (one per browser)
3. Screenshots captured and stored in BrowserResult entities
4. BaselineReference loaded or created if needed
5. DifferenceReport entities created for each comparison
6. HTMLReport generated with all results
7. TestSession status updated to 'completed' or 'failed'
```

### File System Organization
```
reports/
├── session-{sessionId}/
│   ├── report.html                 # HTMLReport
│   ├── assets/
│   │   ├── screenshots/
│   │   │   ├── chromium.png       # BrowserResult screenshots
│   │   │   ├── firefox.png
│   │   │   └── webkit.png
│   │   ├── diffs/
│   │   │   ├── chromium-diff.png  # DifferenceReport images
│   │   │   ├── firefox-diff.png
│   │   │   └── webkit-diff.png
│   │   └── baseline.png           # BaselineReference
│   └── session.json               # TestSession metadata
```

## Persistence Strategy

### File-Based Storage
- **TestSession**: Serialized to JSON in session directory
- **BrowserResult**: Screenshots as PNG files, metadata in session JSON
- **BaselineReference**: PNG files with metadata JSON sidecar
- **DifferenceReport**: Diff images as PNG, metadata in session JSON
- **HTMLReport**: Static HTML file with embedded or linked assets

### In-Memory Representation
- All entities loaded into memory during test execution
- Streaming for large image operations
- Cleanup after report generation
- Cache frequently accessed baselines

## Validation Rules

### TestSession Validation
- `targetUrl` must be valid URL or existing file path
- `browsers` array must contain at least one supported browser
- `viewport` dimensions must be positive integers
- `config` must pass schema validation

### BrowserResult Validation
- `browserName` must be in supported browsers list
- `screenshotPath` must point to valid image file (if present)
- `captureTimestamp` must be within session timeframe
- `pageLoadTime` must be non-negative

### BaselineReference Validation
- `imagePath` must point to valid image file
- `imageHash` must match actual file content
- `viewport` must have positive dimensions
- `version` must follow semantic versioning

### DifferenceReport Validation
- `pixelDifference` must be non-negative
- `percentageDifference` must be between 0.0 and 100.0
- `threshold` must be between 0.0 and 1.0
- Referenced baseline and browser result must exist

## Error Handling

### Data Integrity
- Checksum validation for image files
- Orphaned file cleanup on session failure
- Atomic operations for critical data updates
- Rollback capability for failed operations

### Missing Data
- Graceful handling of missing baselines
- Default values for optional metadata
- Clear error messages for invalid data
- Recovery suggestions for common issues

**Status**: Data model complete and ready for contract definition