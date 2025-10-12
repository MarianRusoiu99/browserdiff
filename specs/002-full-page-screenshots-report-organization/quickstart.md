# Quickstart: Full Page Screenshots and Report Organization

## Overview
This quickstart demonstrates the new full page screenshot and organized report features in BrowserDiff CLI.

## Prerequisites
- BrowserDiff CLI installed (`npm install -g @browserdiff/cli`)
- Node.js 18+ and npm installed
- Test website accessible (we'll use `https://example.com`)

## Basic Usage Examples

### 1. Full Page Screenshots
```bash
# Capture full page screenshots (instead of viewport-only)
browserdiff diff https://example.com --full-page

# With custom height limit for very long pages
browserdiff diff https://example.com --full-page --max-height 15000

# High quality screenshots with longer timeout
browserdiff diff https://example.com --full-page --screenshot-quality 95 --screenshot-timeout 90000
```

### 2. Organized Report Structure
```bash
# Create structured output directories
browserdiff diff https://example.com --structured-output

# Custom directory naming pattern
browserdiff diff https://example.com --structured-output --directory-pattern "test_{url}_{timestamp}"

# Limit URL length in folder names
browserdiff diff https://example.com --structured-output --url-max-length 50
```

### 3. Combined Features
```bash
# Full page screenshots with organized output
browserdiff diff https://example.com --full-page --structured-output

# Complete example with all options
browserdiff diff https://example.com \
  --full-page \
  --structured-output \
  --max-height 20000 \
  --screenshot-quality 90 \
  --directory-pattern "YYYY-MM-DD_HH-mm-ss_{url}"
```

## Output Structure Comparison

### Legacy Output (Default)
```
browserdiff-output/
├── report.html
├── report.json
├── chromium.png
├── firefox.png
├── webkit.png
└── chromium-vs-firefox.png
```

### NEW: Structured Output
```
browserdiff-output/
└── 2025-10-12_14-30-45-123_example-com/
    ├── report.html
    ├── report.json
    ├── screenshots/
    │   ├── chromium-fullpage.png
    │   ├── firefox-fullpage.png
    │   └── webkit-fullpage.png
    └── diffs/
        ├── chromium-vs-firefox.png
        └── firefox-vs-webkit.png
```

## Configuration File Examples

### Basic Configuration
```json
// browserdiff.json
{
  "url": "https://example.com",
  "browsers": ["chromium", "firefox", "webkit"],
  "viewport": { "width": 1280, "height": 720 },
  "outputDir": "browserdiff-output",
  "threshold": 0.1,
  
  "screenshot": {
    "fullPage": true,
    "maxHeight": 20000,
    "timeout": 60000,
    "quality": 90
  },
  
  "reporting": {
    "structured": true,
    "directoryPattern": "YYYY-MM-DD_HH-mm-ss_SSS_{url}",
    "urlSanitization": {
      "maxLength": 100,
      "removeProtocol": true
    }
  }
}
```

### Advanced Configuration
```json
// browserdiff-advanced.json
{
  "url": "https://example.com/long-page",
  "browsers": ["chromium", "firefox"],
  "viewport": { "width": 1920, "height": 1080 },
  "outputDir": "./test-results",
  "threshold": 0.05,
  
  "screenshot": {
    "fullPage": true,
    "maxHeight": 30000,
    "timeout": 120000,
    "quality": 95
  },
  
  "reporting": {
    "structured": true,
    "directoryPattern": "{timestamp}_visual-test_{url}",
    "urlSanitization": {
      "maxLength": 80,
      "removeProtocol": true,
      "preserveStructure": false
    }
  }
}
```

## Validation Steps

### 1. Verify Full Page Capture
```bash
# Run test and check screenshot dimensions
browserdiff diff https://example.com --full-page --structured-output

# Check the generated report.json
cat browserdiff-output/*/report.json | jq '.screenshots[0]'
```

Expected output:
```json
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
```

### 2. Verify Directory Structure
```bash
# List the output directory structure
find browserdiff-output -type f | sort

# Expected structure:
# browserdiff-output/
# └── 2025-10-12_14-30-45-123_example-com/
#     ├── report.html
#     ├── report.json
#     ├── screenshots/
#     │   ├── chromium-fullpage.png
#     │   ├── firefox-fullpage.png
#     │   └── webkit-fullpage.png
#     └── diffs/
#         ├── chromium-vs-firefox.png
#         └── firefox-vs-webkit.png
```

### 3. Performance Validation
```bash
# Time the full page capture
time browserdiff diff https://example.com --full-page

# Expected: Should complete in < 10 seconds for typical pages
# Memory usage should remain < 1GB
```

## Troubleshooting

### Common Issues

#### Page Too Tall Error
```
Error: Page height (25000px) exceeds maximum limit (20000px)
```

**Solution:**
```bash
# Increase the height limit
browserdiff diff https://example.com --full-page --max-height 30000

# Or use viewport-only for very long pages
browserdiff diff https://example.com  # (viewport-only is default)
```

#### Screenshot Timeout
```
Error: Screenshot capture timed out after 60000ms
```

**Solution:**
```bash
# Increase timeout for slow-loading pages
browserdiff diff https://example.com --full-page --screenshot-timeout 120000
```

#### Directory Name Collisions
```
Warning: Directory already exists, using collision suffix: _a1b2
```

**Solution:**
- This is normal behavior for rapid consecutive tests
- Wait a few seconds between tests, or
- Use custom directory pattern with more precision

#### Invalid Directory Pattern
```
Error: Directory pattern must contain {url} placeholder
```

**Solution:**
```bash
# Use a valid pattern
browserdiff diff https://example.com --structured-output --directory-pattern "test_{url}_{timestamp}"
```

## Migration from Legacy Usage

### Existing Scripts
```bash
# Old script (still works)
browserdiff diff https://example.com

# Enhanced script (new features)
browserdiff diff https://example.com --full-page --structured-output
```

### Configuration Migration
```bash
# Legacy config still valid
{
  "url": "https://example.com",
  "browsers": ["chromium", "firefox"]
}

# Enhanced config (backward compatible)
{
  "url": "https://example.com", 
  "browsers": ["chromium", "firefox"],
  "screenshot": { "fullPage": true },
  "reporting": { "structured": true }
}
```

## Advanced Usage

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Visual Regression Test
  run: |
    browserdiff diff ${{ env.TEST_URL }} \
      --full-page \
      --structured-output \
      --max-height 25000 \
      --output ./test-results

- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: visual-regression-results
    path: ./test-results/
```

### Automated Testing Scripts
```bash
#!/bin/bash
# test-multiple-pages.sh

PAGES=("https://example.com" "https://example.com/about" "https://example.com/contact")
OUTPUT_DIR="./visual-tests"

for page in "${PAGES[@]}"; do
  echo "Testing $page..."
  browserdiff diff "$page" \
    --full-page \
    --structured-output \
    --output "$OUTPUT_DIR" \
    --max-height 20000
done

echo "All tests completed. Results in $OUTPUT_DIR"
```

### Performance Monitoring
```bash
# Monitor memory usage during capture
/usr/bin/time -v browserdiff diff https://example.com --full-page

# Check file sizes
du -sh browserdiff-output/*/

# Validate JSON report structure
jq '.performance' browserdiff-output/*/report.json
```

## Success Criteria

✅ **Full Page Screenshots**: Screenshots capture entire page height (> viewport)  
✅ **Organized Structure**: Reports in timestamped folders with sanitized URLs  
✅ **Performance**: Full page capture < 2x viewport time, total < 10 seconds  
✅ **Compatibility**: Existing workflows unchanged, new features opt-in  
✅ **Quality**: Clear error messages, comprehensive validation  

This quickstart provides everything needed to start using the new full page screenshot and report organization features in BrowserDiff CLI.