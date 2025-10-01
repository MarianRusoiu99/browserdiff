# CLI Interface Contract

**Feature**: Cross-Browser UI Diff CLI Tool  
**Contract**: Command Line Interface  
**Date**: 2025-10-01

## Primary Command

### `browserdiff [url] [options]`

**Purpose**: Execute cross-browser UI diff testing on specified URL

**Parameters**:
- `url` (required): Target URL or local file path to test

**Options**:
- `--browsers, -b <browsers>`: Comma-separated list of browsers (default: "chromium,firefox,webkit")
- `--output, -o <directory>`: Output directory for reports (default: "./reports")
- `--config, -c <file>`: Configuration file path (optional)
- `--baseline <path>`: Path to baseline image (optional)
- `--viewport <size>`: Viewport size as "WIDTHxHEIGHT" (default: "1920x1080")
- `--threshold <number>`: Diff threshold 0.0-1.0 (default: 0.1)
- `--timeout <ms>`: Page load timeout in milliseconds (default: 30000)
- `--parallel <number>`: Max parallel browser instances (default: 3)
- `--no-cache`: Disable screenshot caching
- `--verbose, -v`: Enable verbose logging
- `--help, -h`: Show help information
- `--version, -V`: Show version number

**Examples**:
```bash
# Basic usage
browserdiff https://example.com

# Specific browsers
browserdiff https://example.com --browsers chromium,firefox

# Custom output directory
browserdiff https://example.com --output ./my-reports

# With baseline comparison
browserdiff https://example.com --baseline ./baseline.png

# Custom viewport and threshold
browserdiff https://example.com --viewport 1280x720 --threshold 0.05
```

**Exit Codes**:
- `0`: Success - all tests passed
- `1`: Differences detected - visual changes found
- `2`: Partial failure - some browsers failed
- `3`: Complete failure - all browsers failed
- `4`: Configuration error - invalid options or config
- `5`: System error - missing dependencies or permissions

## Configuration Command

### `browserdiff config [action] [options]`

**Purpose**: Manage configuration files and settings

**Actions**:
- `init`: Create default configuration file
- `validate`: Validate existing configuration
- `show`: Display current configuration

**Options**:
- `--file, -f <path>`: Configuration file path (default: "./browserdiff.config.json")
- `--template <type>`: Configuration template type ("basic", "advanced")

**Examples**:
```bash
# Create default config
browserdiff config init

# Create advanced config template
browserdiff config init --template advanced

# Validate config file
browserdiff config validate --file ./my-config.json

# Show current configuration
browserdiff config show
```

## Baseline Management Commands

### `browserdiff baseline create <url> [options]`

**Purpose**: Create new baseline image for comparison

**Parameters**:
- `url` (required): URL to capture as baseline

**Options**:
- `--browser, -b <browser>`: Browser to use for baseline (default: "chromium")
- `--output, -o <path>`: Baseline image output path
- `--viewport <size>`: Viewport size (default: "1920x1080")
- `--wait <ms>`: Wait time before capture (default: 1000)

### `browserdiff baseline update <url> [options]`

**Purpose**: Update existing baseline image

**Parameters**:
- `url` (required): URL to update baseline for

**Options**:
- Same as `create` command
- `--force, -f`: Overwrite existing baseline without confirmation

### `browserdiff baseline list [options]`

**Purpose**: List all available baselines

**Options**:
- `--format <type>`: Output format ("table", "json") (default: "table")
- `--path <directory>`: Baseline directory to search

**Examples**:
```bash
# Create baseline
browserdiff baseline create https://example.com

# Update baseline with confirmation
browserdiff baseline update https://example.com

# Force update baseline
browserdiff baseline update https://example.com --force

# List all baselines
browserdiff baseline list
```

## Report Commands

### `browserdiff report [path] [options]`

**Purpose**: Generate or view reports from previous test runs

**Parameters**:
- `path` (optional): Path to session data or report directory

**Options**:
- `--format <type>`: Report format ("html", "json") (default: "html")
- `--open, -o`: Open report in default browser
- `--template <name>`: Report template to use

**Examples**:
```bash
# View latest report
browserdiff report --open

# Generate JSON report
browserdiff report ./session-123 --format json

# Use custom template
browserdiff report --template minimal
```

## Input Validation

### URL Validation
- Must be valid HTTP/HTTPS URL or existing file path
- Local files must have .html extension
- URLs must be accessible (basic connectivity check)

### Browser Validation
- Must be from supported list: "chromium", "firefox", "webkit"
- Browser binaries must be available on system
- Invalid browsers cause graceful error with suggestions

### Viewport Validation
- Format: "WIDTHxHEIGHT" (e.g., "1920x1080")
- Width and height must be positive integers
- Minimum: 320x240, Maximum: 7680x4320

### Threshold Validation
- Must be numeric value between 0.0 and 1.0
- Invalid values cause error with valid range explanation

### Path Validation
- Output directories created if they don't exist
- Write permissions checked before execution
- Invalid characters in paths cause descriptive errors

### Configuration File Validation
- Must be valid JSON or YAML format
- Schema validation against predefined structure
- Missing required fields cause specific error messages

## Output Contracts

### Success Output
```
✅ Cross-browser diff completed successfully

📊 Results Summary:
  • Browsers tested: chromium, firefox, webkit
  • Screenshots captured: 3/3
  • Comparisons performed: 3
  • Matches: 2, Differences: 1
  • Execution time: 12.3s

📁 Report generated: ./reports/session-20251001-143022/report.html

🌐 Open report: browserdiff report --open
```

### Difference Detected Output
```
⚠️  Visual differences detected

📊 Results Summary:
  • Browsers tested: chromium, firefox, webkit
  • Screenshots captured: 3/3
  • Comparisons performed: 3
  • Matches: 1, Differences: 2
  • Execution time: 15.7s

🔍 Differences found in:
  • Firefox: 2.3% pixels different
  • WebKit: 0.8% pixels different

📁 Report generated: ./reports/session-20251001-143022/report.html
```

### Error Output
```
❌ Test execution failed

🚨 Errors encountered:
  • Chromium: Page load timeout after 30s
  • Firefox: Browser binary not found
  • WebKit: Screenshot capture failed

💡 Suggestions:
  • Check network connectivity for page load issues
  • Install missing browser: npx playwright install firefox
  • Increase timeout: --timeout 60000

📁 Partial report: ./reports/session-20251001-143022/report.html
```

### Verbose Output
When `--verbose` flag is used:
```
🔧 Initializing browsers...
  ✓ Chromium 118.0.5993.70 ready
  ✓ Firefox 119.0 ready
  ✓ WebKit 17.0 ready

📸 Capturing screenshots...
  ✓ Chromium: Screenshot saved (1024x768, 247KB)
  ✓ Firefox: Screenshot saved (1024x768, 251KB)
  ✓ WebKit: Screenshot saved (1024x768, 239KB)

🔍 Comparing against baseline...
  ✓ Chromium vs baseline: 0.05% difference (MATCH)
  ⚠️ Firefox vs baseline: 2.3% difference (DIFFERENT)
  ✓ WebKit vs baseline: 0.02% difference (MATCH)

📄 Generating HTML report...
  ✓ Report template processed
  ✓ Assets embedded
  ✓ Report saved: ./reports/session-20251001-143022/report.html

✅ Process completed in 12.3s
```

## Error Handling

### Command Validation Errors
- Unknown options: "Unknown option '--invalid'. See 'browserdiff --help'"
- Missing required parameters: "Missing required parameter: url"
- Invalid parameter values: "Invalid viewport format. Use 'WIDTHxHEIGHT'"

### Runtime Errors
- Network errors: "Failed to load https://example.com: Connection timeout"
- Permission errors: "Cannot write to ./reports: Permission denied"
- System errors: "Browser binary not found: chromium. Run 'npx playwright install'"

### Recovery Suggestions
- All errors include actionable suggestions
- Links to documentation for complex issues
- Command examples for fixing common problems

**Status**: CLI interface contract complete and ready for implementation