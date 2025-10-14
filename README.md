# BrowserDiff

> Cross-browser visual regression testing made simple

BrowserDiff compares how websites render across different browsers (Chromium, Firefox, WebKit) and generates beautiful visual difference reports.

## ✨ Features

- 🌐 **Multi-Browser Testing**: Compare rendering across Chromium, Firefox, and WebKit
- 📸 **Full Page Screenshots**: Captures entire page by default with automatic page ready detection
- 🔍 **Pixel-Perfect Comparison**: Detect even the smallest visual differences
- 📊 **Beautiful Reports**: Clean, modern HTML reports with detailed metrics
- 📁 **Organized Output**: Each test run in its own timestamped folder (e.g., `2025-10-14_23-13-22_413_example.com`)
- ⚡ **Simple CLI**: Single command with sensible defaults
- 🎯 **Flexible Options**: Control output directory, logging, quality, and more

## 🚀 Quick Start

```bash
# Install globally
npm install -g @browserdiff/cli

# Test any website - full page screenshots by default!
browserdiff https://example.com

# Report will be in ./browserdiff-output/2025-10-14_HH-MM-SS_SSS_example.com/
```

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g @browserdiff/cli

# Install browser engines
npx playwright install
```

### Local Development

```bash
git clone <repository-url>
cd BrowserDiff
npm install
npm run build

# Test locally without global install
node dist/src/cli/index.js https://example.com
```

## 💡 Usage

### Basic Usage

```bash
# Compare a URL across all browsers (full page by default)
browserdiff https://example.com

# Test with specific browsers
browserdiff https://example.com -b chromium firefox

# Viewport-only screenshot (override full-page default)
browserdiff https://example.com --viewport-only

# Silent mode (no output)
browserdiff https://example.com --silent

# Open report in browser automatically
browserdiff https://example.com --open
```

### Common Options

```bash
browserdiff <url> [options]

Options:
  -b, --browsers <browsers...>  Browsers to test (default: chromium,firefox,webkit)
  -w, --width <width>           Viewport width in pixels (default: 1920)
  -h, --height <height>         Viewport height in pixels (default: 1080)
  -t, --threshold <threshold>   Diff threshold 0.0-1.0 (default: 0.1)
  -o, --output <directory>      Output directory (default: ./browserdiff-output)
  --full-page                   Capture full page screenshots (default: true)
  --viewport-only               Capture viewport only (overrides --full-page)
  --max-height <pixels>         Maximum page height for full page (default: 20000)
  --quality <quality>           Screenshot quality 0-100 (default: 90)
  --silent                      No console output
  --quiet                       Minimal console output
  --verbose                     Detailed console output
  --open                        Open report in browser after generation
  --baseline <browser>          Baseline browser for comparison (default: chromium)
```

## 📊 Reports

BrowserDiff generates organized HTML reports with each test run in its own folder:

- **Organized Structure**: Each test in timestamped folder (e.g., `2025-10-14_23-13-22_413_example.com`)
- **Visual Comparisons**: Side-by-side browser screenshots
- **Difference Metrics**: Pixel count, percentage, match rate
- **Browser Metadata**: Versions, load times
- **Status Indicators**: Identical, within threshold, or different

### Example Report Structure

```
browserdiff-output/
├── 2025-10-14_23-13-22_413_example.com/
│   ├── report.html                    # Beautiful HTML report
│   ├── report.json                    # Raw JSON data
│   ├── screenshots/
│   │   ├── chromium-{timestamp}.png
│   │   ├── firefox-{timestamp}.png
│   │   └── webkit-{timestamp}.png
│   └── diffs/
│       ├── diff-chromium-vs-firefox.png
│       └── diff-chromium-vs-webkit.png
└── 2025-10-14_23-15-48_892_another-site.com/
    └── ...
```

## 🎯 Use Cases

### Visual Regression Testing

```bash
# Test before and after changes
browserdiff https://staging.example.com
# Make changes...
browserdiff https://staging.example.com
# Compare reports in different timestamped folders
```

### Cross-Browser Compatibility

```bash
# Test new feature across browsers
browserdiff https://example.com/new-feature -b chromium firefox webkit --verbose
```

### Responsive Design Testing

```bash
# Test different viewport sizes
browserdiff https://example.com -w 375 -h 667   # Mobile
browserdiff https://example.com -w 768 -h 1024  # Tablet
browserdiff https://example.com -w 1920 -h 1080 # Desktop
```

### Full Page Capture

```bash
# Full page is the default! Just run:
browserdiff https://example.com/long-page

# For very long pages, increase max-height:
browserdiff https://example.com/long-page --max-height 50000

# To capture viewport only instead:
browserdiff https://example.com --viewport-only
```

## 🔧 Advanced Usage

### Custom Threshold

```bash
# Stricter comparison (0.01 = 1% tolerance)
browserdiff https://example.com -t 0.01

# More lenient (0.5 = 50% tolerance)
browserdiff https://example.com -t 0.5
```

### Custom Output Directory

```bash
# Save to specific directory
browserdiff https://example.com -o ./test-results

# Integrate with CI/CD
browserdiff https://example.com -o ./artifacts/browserdiff
```

### Automation & CI/CD

```bash
# Silent mode for CI pipelines
browserdiff https://example.com --silent
EXIT_CODE=$?

# Exit code 0 = no differences or within threshold
# Exit code 1 = differences detected beyond threshold
```

## 🏗️ Architecture

### Core Components

- **CLI**: Simple command-line interface (single command!)
- **Executor**: Orchestrates browser testing workflow
- **BrowserService**: Manages Playwright browser instances
- **ScreenshotService**: Captures screenshots with page ready detection
- **DiffService**: Performs pixel-perfect comparisons using Pixelmatch
- **ReportService**: Generates beautiful HTML reports from EJS templates

### Page Readiness Detection

BrowserDiff waits for pages to be fully loaded before capturing:

- ✅ All images loaded (`img.complete`)
- ✅ Web fonts ready (`document.fonts.ready`)
- ✅ Network idle (no pending requests)
- ✅ Configurable delay (default: 500ms)

This ensures consistent, reliable screenshots every time.

## 📚 Examples

### Compare Production vs Staging

```bash
# Production
browserdiff https://example.com -o ./reports/prod

# Staging
browserdiff https://staging.example.com -o ./reports/staging

# Compare reports manually
```

### Test Multiple Pages

```bash
#!/bin/bash
PAGES=(
  "https://example.com"
  "https://example.com/about"
  "https://example.com/contact"
  "https://example.com/products"
)

for PAGE in "${PAGES[@]}"; do
  echo "Testing $PAGE..."
  browserdiff "$PAGE" --quiet
done
```

### CI/CD Integration (GitHub Actions)

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  browserdiff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install BrowserDiff
        run: |
          npm install -g @browserdiff/cli
          npx playwright install --with-deps
      
      - name: Run Visual Tests
        run: |
          browserdiff https://your-app.com --silent -o ./artifacts
      
      - name: Upload Reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: browserdiff-reports
          path: ./artifacts/
```

## 🛠️ Development

```bash
# Clone repository
git clone <repository-url>
cd BrowserDiff

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## 📝 Requirements

- Node.js >= 18.0.0
- npm or yarn
- Playwright browsers (auto-installed with `npx playwright install`)

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

---

**Made with ❤️ for cross-browser testing**
