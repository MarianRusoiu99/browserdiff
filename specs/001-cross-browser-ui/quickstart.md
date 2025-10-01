# Quick Start Guide: Cross-Browser UI Diff CLI Tool

**Feature**: Cross-Browser UI Diff CLI Tool  
**Date**: 2025-10-01  
**Purpose**: Get developers up and running quickly with the cross-browser diff tool

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **Operating System**: Linux, macOS, or Windows
- **Memory**: 2GB RAM minimum (4GB recommended for parallel execution)
- **Disk Space**: 500MB for browser binaries + storage for reports

### Browser Dependencies
The tool uses Playwright for browser automation. Browser binaries are installed automatically:
- **Chromium**: Latest stable version
- **Firefox**: Latest stable version  
- **WebKit**: Latest stable version (Safari engine)

## Installation

### NPM Installation (Recommended)
```bash
# Install globally for CLI access
npm install -g @browserdiff/cli

# Or install locally in project
npm install --save-dev @browserdiff/cli
```

### Manual Installation
```bash
# Clone repository
git clone https://github.com/browserdiff/cli.git
cd cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for global access
npm link
```

### Browser Setup
```bash
# Install browser binaries (automatic on first run)
npx browserdiff --install-browsers

# Or install specific browsers
npx playwright install chromium firefox webkit
```

## Basic Usage

### Your First Diff Test
```bash
# Test a website with default settings
browserdiff https://example.com

# This will:
# 1. Launch all browsers (Chromium, Firefox, WebKit)
# 2. Capture screenshots at 1920x1080 resolution
# 3. Compare against baseline (or create one if missing)
# 4. Generate HTML report in ./reports directory
```

### Example Output
```
✅ Cross-browser diff completed successfully

📊 Results Summary:
  • Browsers tested: chromium, firefox, webkit  
  • Screenshots captured: 3/3
  • Comparisons performed: 3
  • Matches: 2, Differences: 1
  • Execution time: 8.4s

📁 Report generated: ./reports/session-20251001-143022/report.html

🌐 Open report: browserdiff report --open
```

## Common Use Cases

### 1. Test Specific Browsers
```bash
# Test only Chrome and Firefox
browserdiff https://example.com --browsers chromium,firefox

# Test single browser
browserdiff https://example.com --browsers webkit
```

### 2. Custom Viewport Testing
```bash
# Mobile viewport
browserdiff https://example.com --viewport 375x667

# Tablet viewport  
browserdiff https://example.com --viewport 768x1024

# Desktop large
browserdiff https://example.com --viewport 2560x1440
```

### 3. Local File Testing
```bash
# Test local HTML file
browserdiff ./dist/index.html

# Test with local server
browserdiff http://localhost:3000
```

### 4. Baseline Management
```bash
# Create initial baseline
browserdiff baseline create https://example.com

# Update existing baseline
browserdiff baseline update https://example.com

# Test against specific baseline
browserdiff https://example.com --baseline ./my-baseline.png
```

### 5. Custom Configuration
```bash
# Generate config file
browserdiff config init

# Use custom config
browserdiff https://example.com --config ./my-config.json

# Custom output directory
browserdiff https://example.com --output ./test-results
```

## Configuration File Example

### Basic Configuration (`browserdiff.config.json`)
```json
{
  "browsers": ["chromium", "firefox", "webkit"],
  "viewport": {
    "width": 1920,
    "height": 1080
  },
  "comparison": {
    "threshold": 0.1,
    "includeAA": true
  },
  "output": {
    "directory": "./reports",
    "format": "html"
  },
  "timeout": {
    "pageLoad": 30000,
    "screenshot": 5000
  }
}
```

### Advanced Configuration
```json
{
  "browsers": ["chromium", "firefox"],
  "viewport": {
    "width": 1280,
    "height": 720,
    "deviceScaleFactor": 2
  },
  "comparison": {
    "threshold": 0.05,
    "includeAA": false,
    "ignoreColors": ["#ff0000", "#00ff00"]
  },
  "output": {
    "directory": "./reports",
    "embedAssets": true
  },
  "timeout": {
    "pageLoad": 60000,
    "screenshot": 10000
  },
  "retry": {
    "attempts": 3,
    "delay": 1000
  },
  "parallel": 2
}
```

## Understanding Reports

### Report Structure
After running a test, you'll find:
```
reports/session-20251001-143022/
├── report.html          # Main report file - open this!
├── assets/
│   ├── screenshots/     # Browser screenshots
│   ├── diffs/          # Difference images
│   └── baseline.png    # Reference image
└── session-data.json   # Raw test data
```

### Reading the Report
1. **Overview Tab**: Summary of all browsers and results
2. **Browser Tabs**: Detailed comparison for each browser
3. **Side-by-side View**: Compare baseline vs browser rendering
4. **Difference View**: See highlighted differences
5. **Stats Panel**: Pixel counts and percentages

### Status Indicators
- 🟢 **Match**: Differences within threshold (success)
- 🟡 **Different**: Differences exceed threshold (needs review)  
- 🔴 **Failed**: Screenshot capture or comparison failed
- ⚪ **Skipped**: Browser not tested or unavailable

## Troubleshooting

### Common Issues

#### Browser Not Found
```bash
❌ Browser binary not found: firefox

💡 Solution:
npx playwright install firefox
```

#### Permission Denied
```bash
❌ Cannot write to ./reports: Permission denied

💡 Solutions:
# Change output directory
browserdiff https://example.com --output ~/my-reports

# Fix permissions
chmod 755 ./reports
```

#### Page Load Timeout
```bash
❌ Page load timeout after 30s

💡 Solutions:
# Increase timeout
browserdiff https://example.com --timeout 60000

# Check network connectivity
curl -I https://example.com
```

#### High Memory Usage
```bash
💡 Solutions:
# Reduce parallel browsers
browserdiff https://example.com --parallel 1

# Test fewer browsers
browserdiff https://example.com --browsers chromium
```

### Getting Help
```bash
# Show all available commands and options
browserdiff --help

# Show version information
browserdiff --version

# Validate your configuration
browserdiff config validate

# Enable verbose logging for debugging
browserdiff https://example.com --verbose
```

## Integration Examples

### CI/CD Pipeline (GitHub Actions)
```yaml
name: Visual Regression Tests
on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install browsers
        run: npx playwright install --with-deps
      
      - name: Run visual tests
        run: |
          npm start &
          npx wait-on http://localhost:3000
          browserdiff http://localhost:3000 --browsers chromium,firefox
      
      - name: Upload reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: visual-test-reports
          path: reports/
```

### NPM Scripts Integration
```json
{
  "scripts": {
    "test:visual": "browserdiff http://localhost:3000",
    "test:visual:mobile": "browserdiff http://localhost:3000 --viewport 375x667",
    "test:visual:update": "browserdiff baseline update http://localhost:3000",
    "test:visual:ci": "browserdiff http://localhost:3000 --browsers chromium --no-cache"
  }
}
```

### Docker Usage
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-focal
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["browserdiff", "http://app:3000"]
```

## Best Practices

### 1. Baseline Management
- Create baselines from your most stable browser (usually Chromium)
- Update baselines when you intentionally change UI
- Store baselines in version control for team consistency
- Use descriptive baseline names for multiple pages

### 2. Test Strategy
- Start with critical user journeys and key pages
- Test at common viewport sizes (mobile, tablet, desktop)
- Set appropriate thresholds (0.1% for strict, 1% for lenient)
- Run tests in CI/CD pipeline for early detection

### 3. Performance Optimization
- Use `--parallel` to limit concurrent browsers on resource-constrained systems
- Enable caching (default) to speed up repeated runs
- Test locally before running in CI to catch obvious issues
- Use `--browsers` to test specific browsers when debugging

### 4. Team Collaboration
- Share configuration files in version control
- Document baseline update procedures
- Set up automated alerts for visual regressions
- Review difference reports together during code reviews

## Next Steps

1. **Run your first test**: `browserdiff https://your-website.com`
2. **Create a baseline**: `browserdiff baseline create https://your-website.com`
3. **Set up configuration**: `browserdiff config init`
4. **Integrate with your workflow**: Add NPM scripts or CI/CD pipeline
5. **Explore advanced features**: Custom viewports, multiple pages, automation

## Support and Resources

- **Documentation**: [Full documentation site]
- **GitHub Issues**: [Report bugs and feature requests]
- **Community**: [Discord/Slack community]
- **Examples**: [Sample projects and configurations]

**Ready to start?** Run `browserdiff --help` to see all available options!

---

*This guide covers the essential features to get you productive quickly. For advanced usage, configuration options, and API reference, see the complete documentation.*