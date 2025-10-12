# CLI Interface Contract

## Command Extensions

### Enhanced `diff` Command
```bash
# Existing usage (preserved)
browserdiff diff <url> [options]

# NEW: Full page screenshot options  
browserdiff diff <url> --full-page
browserdiff diff <url> --full-page --max-height 15000
browserdiff diff <url> --full-page --screenshot-timeout 90000

# NEW: Structured output options
browserdiff diff <url> --structured-output  
browserdiff diff <url> --structured-output --directory-pattern "test_{url}_{timestamp}"

# NEW: Combined usage
browserdiff diff <url> --full-page --structured-output
```

### NEW CLI Options

#### Screenshot Options
```bash
--full-page                    # Enable full page screenshot capture
--max-height <pixels>          # Maximum page height (default: 20000)  
--screenshot-timeout <ms>      # Screenshot timeout (default: 60000)
--screenshot-quality <0-100>   # PNG quality (default: 90)
```

#### Output Organization Options  
```bash
--structured-output            # Enable organized directory structure
--directory-pattern <pattern>  # Custom directory naming pattern
--url-max-length <chars>       # Max URL length in folder name (default: 100)
```

## Configuration File Contract

### Enhanced browserdiff.json
```json
{
  // Existing configuration (preserved)
  "url": "https://example.com",
  "browsers": ["chromium", "firefox", "webkit"],
  "viewport": { "width": 1280, "height": 720 },
  "outputDir": "browserdiff-output",
  "threshold": 0.1,
  
  // NEW: Screenshot configuration
  "screenshot": {
    "fullPage": false,
    "maxHeight": 20000,
    "timeout": 60000,
    "quality": 90
  },
  
  // NEW: Report configuration
  "reporting": {
    "structured": false,
    "directoryPattern": "YYYY-MM-DD_HH-mm-ss_SSS_{url}",
    "urlSanitization": {
      "maxLength": 100,
      "removeProtocol": true,
      "preserveStructure": true
    }
  }
}
```

## Service Interface Contracts

### Enhanced ScreenshotService
```typescript
interface IScreenshotService {
  // Existing methods (preserved)
  captureScreenshot(browser: BrowserType, config: TestConfig): Promise<ScreenshotResult>;
  
  // NEW: Full page methods
  captureFullPageScreenshot(
    browser: BrowserType, 
    config: TestConfig
  ): Promise<ScreenshotResult>;
  
  // NEW: Height validation
  validatePageHeight(
    browser: BrowserType,
    maxHeight: number
  ): Promise<{ height: number; exceedsLimit: boolean }>;
}
```

### Enhanced ReportService  
```typescript
interface IReportService {
  // Existing methods (preserved)
  generateReport(results: TestRunResult[]): Promise<void>;
  
  // NEW: Structured output methods
  createStructuredDirectory(
    url: string, 
    config: ReportConfig
  ): Promise<ReportStructure>;
  
  // NEW: Directory management
  resolveDirectoryCollision(basePath: string): Promise<string>;
  
  // NEW: URL utilities
  sanitizeUrl(url: string, config: UrlSanitizationConfig): string;
}
```

### NEW: DirectoryService
```typescript
interface IDirectoryService {
  createTestDirectory(
    baseDir: string,
    timestamp: Date,
    sanitizedUrl: string
  ): Promise<ReportStructure>;
  
  ensureSubdirectories(structure: ReportStructure): Promise<void>;
  
  resolveCollisions(proposedPath: string): Promise<string>;
  
  validateDirectoryStructure(structure: ReportStructure): Promise<boolean>;
}
```

## CLI Help Contract

### Enhanced Help Output
```bash
$ browserdiff diff --help

Usage: browserdiff diff <url> [options]

Compare visual differences across browsers

Arguments:
  url                          URL to test

Options:
  -b, --browsers <browsers>    Browsers to test (default: chromium,firefox,webkit)
  -o, --output <dir>          Output directory (default: browserdiff-output)
  -t, --threshold <number>    Difference threshold 0-1 (default: 0.1)
  
  Screenshot Options:
  --full-page                 Capture full page height (default: false)
  --max-height <pixels>       Maximum page height for full page (default: 20000)
  --screenshot-timeout <ms>   Screenshot timeout in milliseconds (default: 60000)
  --screenshot-quality <0-100> PNG compression quality (default: 90)
  
  Output Organization:
  --structured-output         Create organized directory structure (default: false)
  --directory-pattern <pattern> Directory naming pattern (default: YYYY-MM-DD_HH-mm-ss_SSS_{url})
  --url-max-length <chars>    Maximum URL length in folder names (default: 100)
  
  -h, --help                  Display help for command

Examples:
  # Basic usage (unchanged)
  browserdiff diff https://example.com
  
  # Full page screenshots  
  browserdiff diff https://example.com --full-page
  
  # Organized output structure
  browserdiff diff https://example.com --structured-output
  
  # Combined features
  browserdiff diff https://example.com --full-page --structured-output --max-height 15000
```

## Error Handling Contract

### Error Response Format
```typescript
interface CLIError {
  code: string;
  message: string;
  details?: string;
  suggestions?: string[];
  exitCode: number;
}
```

### Screenshot Error Scenarios
```typescript
const screenshotErrors = {
  PAGE_TOO_TALL: {
    code: 'PAGE_HEIGHT_EXCEEDED',
    message: 'Page height ({height}px) exceeds maximum limit ({limit}px)',
    suggestions: [
      'Use --max-height to increase the limit',
      'Consider viewport-only screenshots for very long pages',
      'Check if page has infinite scroll that needs to be disabled'
    ],
    exitCode: 1
  },
  
  SCREENSHOT_TIMEOUT: {
    code: 'SCREENSHOT_TIMEOUT', 
    message: 'Screenshot capture timed out after {timeout}ms',
    suggestions: [
      'Use --screenshot-timeout to increase timeout',
      'Check if page has blocking resources or JavaScript',
      'Verify page is fully loaded before screenshot'
    ],
    exitCode: 1
  }
};
```

### Directory Error Scenarios
```typescript
const directoryErrors = {
  INVALID_PATTERN: {
    code: 'INVALID_DIRECTORY_PATTERN',
    message: 'Directory pattern must contain {url} placeholder',
    suggestions: [
      'Include {url} in your --directory-pattern',
      'Use default pattern: YYYY-MM-DD_HH-mm-ss_SSS_{url}',
      'See documentation for pattern variables'  
    ],
    exitCode: 1
  },
  
  PATH_TOO_LONG: {
    code: 'PATH_LENGTH_EXCEEDED',
    message: 'Generated directory path exceeds filesystem limits',
    suggestions: [
      'Use --url-max-length to shorten URL portion',
      'Choose a shorter --directory-pattern',
      'Use a different output directory location'
    ],
    exitCode: 1
  }
};
```

## Output Format Contract

### Enhanced JSON Report Structure
```json
{
  "metadata": {
    "version": "2.0.0",
    "timestamp": "2025-10-12T14:30:45.123Z",
    "url": "https://example.com/page",
    "config": {
      "fullPage": true,
      "structuredOutput": true,
      "maxHeight": 20000
    }
  },
  
  "structure": {
    "baseDirectory": "2025-10-12_14-30-45-123_example-com",
    "paths": {
      "htmlReport": "report.html",
      "jsonReport": "report.json", 
      "screenshotsDir": "screenshots/",
      "diffsDir": "diffs/"
    }
  },
  
  "screenshots": [
    {
      "browser": "chromium",
      "filePath": "screenshots/chromium-fullpage.png",
      "width": 1280,
      "height": 3420,
      "isFullPage": true,
      "actualPageHeight": 3420,
      "captureTime": 1250,
      "wasTruncated": false
    }
  ],
  
  "diffs": [
    {
      "browser1": "chromium", 
      "browser2": "firefox",
      "similarity": 0.95,
      "differenceCount": 42,
      "diffImagePath": "diffs/chromium-vs-firefox.png",
      "comparisonType": "fullpage",
      "heightDifference": 15,
      "scrollableRegions": 3
    }
  ],
  
  "performance": {
    "totalDuration": 8450,
    "screenshotTiming": {
      "chromium": 1250,
      "firefox": 1380,
      "webkit": 1420
    },
    "peakMemoryUsage": 256000000,
    "reportGenerationTime": 340
  }
}
```

### Enhanced HTML Report Features
- Progressive disclosure of full page vs viewport differences
- Interactive scroll position indicators for large page diffs
- Performance metrics display with timing breakdown
- Directory structure navigation aids
- Responsive design for viewing large screenshot comparisons

## Compatibility Contract

### Backward Compatibility Guarantees
1. **Existing CLI commands work unchanged** - No behavioral changes without explicit flags
2. **Configuration files remain valid** - New fields optional with sensible defaults  
3. **JSON report format extended** - Existing fields preserved, new fields added
4. **File output locations unchanged** - Legacy flat output structure maintained by default
5. **Performance characteristics similar** - No significant slowdown for existing workflows

### Migration Support
- Automatic configuration migration from v1.x format
- Warning messages for deprecated patterns (future versions)
- Documentation for upgrading existing automation scripts
- Compatibility testing with existing report parsing tools

This contract specification ensures reliable, consistent behavior for all new features while maintaining full backward compatibility with existing BrowserDiff usage patterns.