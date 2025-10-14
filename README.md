# BrowserDiff

> Cross-browser UI testing and visual regression tool powered by Playwright

BrowserDiff is a command-line tool that captures screenshots of web pages across multiple browsers (Chromium, Firefox, WebKit) and performs pixel-perfect visual comparisons to detect rendering differences.

## Features

- 🌐 **Multi-Browser Support**: Test across Chromium, Firefox, and WebKit
- 📸 **Screenshot Capture**: Automated screenshot capture with configurable viewports
- �️ **Full Page Screenshots**: Capture entire page height, not just viewport (NEW!)
- 📁 **Organized Output**: Structured directory organization with timestamped folders (NEW!)
- �🔍 **Visual Diff**: Pixel-level comparison using Pixelmatch
- 📊 **HTML Reports**: Beautiful, interactive HTML reports with diff visualization
- ⚙️ **Configurable**: Flexible configuration via CLI options or config file
- 🎯 **Baseline Management**: Create and manage baseline images for regression testing
- ⚡ **Parallel Execution**: Concurrent browser testing for faster results
- 🔧 **TypeScript**: Fully typed for better developer experience

## Installation

For production use:

```bash
npm install -g @browserdiff/cli
```

For local development/testing:

```bash
# Clone and setup
git clone <repository-url>
cd BrowserDiff

# Install dependencies
npm install

# Build the project
npm run build

# Install Playwright browsers
npx playwright install chromium

# Test locally (no global install needed!)
node dist/cli/index.js diff https://example.com --browsers chromium --verbose

# Or use the test script
./test-local.sh
```

Or use with npx:

```bash
npx @browserdiff/cli diff https://example.com
```

## Quick Start

### Basic Diff

Compare a URL across all browsers:

```bash
browserdiff diff https://example.com
```

### Custom Configuration

Test with specific browsers and viewport:

```bash
browserdiff diff https://example.com \
  --browsers chromium firefox \
  --width 1920 \
  --height 1080 \
  --threshold 0.1
```

### Initialize Configuration

Create a `.browserdiff.json` configuration file:

```bash
browserdiff config init
```

Example configuration:

```json
{
  "browsers": ["chromium", "firefox", "webkit"],
  "viewport": {
    "width": 1920,
    "height": 1080,
    "deviceScaleFactor": 1
  },
  "comparison": {
    "threshold": 0.1,
    "includeAA": true
  },
  "output": {
    "directory": "./browserdiff-output",
    "format": "html",
    "embedAssets": true
  },
  "timeout": {
    "pageLoad": 30000,
    "screenshot": 10000
  },
  "retry": {
    "attempts": 3,
    "delay": 1000
  },
  "parallel": 3,
  "screenshot": {
    "fullPage": false,
    "maxHeight": 20000,
    "timeout": 60000,
    "quality": 90
  },
  "reporting": {
    "structuredOutput": false,
    "directoryPattern": "YYYY-MM-DD_HH-mm-ss_SSS_{url}",
    "urlMaxLength": 100
  }
}
```

## Commands

### `diff`

Compare a URL across multiple browsers:

```bash
browserdiff diff <url> [options]
```

**Options:**
- `-b, --browsers <browsers...>` - Browsers to test (chromium, firefox, webkit)
- `-w, --width <width>` - Viewport width (default: 1920)
- `-h, --height <height>` - Viewport height (default: 1080)
- `-t, --threshold <threshold>` - Diff threshold 0.0-1.0 (default: 0.1)
- `-o, --output <directory>` - Output directory (default: ./browserdiff-output)
- `-c, --config <path>` - Config file path
- `--baseline <browser>` - Baseline browser (default: chromium)
- `--ignore-https-errors` - Ignore HTTPS certificate errors
- `--open` - Open report after generation
- `--verbose` - Verbose output

**Screenshot Options (NEW):**
- `--full-page` - Capture full page height instead of viewport only
- `--max-height <pixels>` - Maximum page height for full page screenshots (default: 20000)
- `--screenshot-timeout <ms>` - Screenshot capture timeout in milliseconds (default: 60000)
- `--screenshot-quality <quality>` - PNG compression quality 0-100 (default: 90)

**Output Organization Options (NEW):**
- `--structured-output` - Create organized directory structure with timestamps
- `--directory-pattern <pattern>` - Directory naming pattern (default: YYYY-MM-DD_HH-mm-ss_SSS_{url})
- `--url-max-length <chars>` - Maximum URL length in folder names (default: 100)

**Example:**

```bash
browserdiff diff https://example.com \
  --browsers chromium firefox webkit \
  --width 1920 --height 1080 \
  --threshold 0.05 \
  --open

# Test site with invalid SSL certificate
browserdiff diff https://example.com \
  --ignore-https-errors \
  --verbose

# NEW: Capture full page screenshots
browserdiff diff https://example.com \
  --full-page \
  --max-height 15000

# NEW: Use structured output organization
browserdiff diff https://example.com \
  --structured-output

# NEW: Combined features - full page + structured output
browserdiff diff https://example.com \
  --full-page \
  --structured-output \
  --max-height 20000 \
  --screenshot-quality 95
```

### `config`

Manage configuration:

```bash
# Initialize new config
browserdiff config init

# Show current config
browserdiff config show

# Validate config
browserdiff config validate
```

### `baseline`

Manage baseline images:

```bash
# Create baseline
browserdiff baseline create https://example.com \
  --browser chromium \
  --width 1920 --height 1080

# List baselines
browserdiff baseline list

# Update baseline
browserdiff baseline update <baseline-id>
```

### `report`

Manage reports:

```bash
# View report
browserdiff report view ./browserdiff-output/report-<session-id>.html

# List reports
browserdiff report list
```

## Configuration

### Config File

BrowserDiff looks for `.browserdiff.json` in the current directory. You can specify a custom path with `--config`.

#### Screenshot Configuration (NEW)

Control screenshot capture behavior:

- `fullPage` (boolean): Capture full page height instead of viewport only (default: false)
- `maxHeight` (number): Maximum page height for full page screenshots in pixels (default: 20000, range: 1000-50000)
- `timeout` (number): Screenshot capture timeout in milliseconds (default: 60000, range: 10000-300000)
- `quality` (number): PNG compression quality 0-100 (default: 90, range: 0-100)

#### Reporting Configuration (NEW)

Organize test output in structured directories:

- `structuredOutput` (boolean): Create organized directory structure with timestamps (default: false)
- `directoryPattern` (string): Directory naming pattern with timestamp tokens and {url} placeholder (default: "YYYY-MM-DD_HH-mm-ss_SSS_{url}")
- `urlMaxLength` (number): Maximum URL length in folder names (default: 100, range: 10-255)

**Timestamp Pattern Tokens:**
- `YYYY` - 4-digit year
- `MM` - 2-digit month
- `DD` - 2-digit day
- `HH` - 2-digit hour (24-hour format)
- `mm` - 2-digit minute
- `ss` - 2-digit second
- `SSS` - 3-digit millisecond
- `{url}` - Sanitized URL

**Example Directory Names:**
- `2025-01-12_14-30-45_123_example-com`
- `YYYY-MM-DD_{url}` → `2025-01-12_example-com`

### Environment Variables

- `BROWSERDIFF_CONFIG` - Path to configuration file
- `BROWSERDIFF_OUTPUT` - Default output directory

## Exit Codes

- `0` - Success (no differences or within threshold)
- `1` - Failure (differences beyond threshold or error)

## Examples

### Responsive Testing

Test multiple viewports:

```bash
# Desktop
browserdiff diff https://example.com --width 1920 --height 1080

# Tablet
browserdiff diff https://example.com --width 768 --height 1024

# Mobile
browserdiff diff https://example.com --width 375 --height 667
```

### Full Page Screenshot Testing (NEW)

Capture and compare entire page heights:

```bash
# Basic full page capture
browserdiff diff https://example.com --full-page

# Full page with custom max height
browserdiff diff https://example.com \
  --full-page \
  --max-height 15000

# Full page with quality optimization
browserdiff diff https://example.com \
  --full-page \
  --screenshot-quality 95 \
  --screenshot-timeout 120000
```

### Structured Output Organization (NEW)

Organize test results in timestamped directories:

```bash
# Enable structured output
browserdiff diff https://example.com --structured-output

# Custom directory pattern (timestamp only)
browserdiff diff https://example.com \
  --structured-output \
  --directory-pattern "YYYY-MM-DD_HH-mm-ss"

# Custom pattern with URL
browserdiff diff https://example.com \
  --structured-output \
  --directory-pattern "{url}_YYYY-MM-DD" \
  --url-max-length 50
```

### Combined Features (NEW)

Full page screenshots with structured output:

```bash
# Long-scrolling page testing with organization
browserdiff diff https://example.com/long-page \
  --full-page \
  --structured-output \
  --max-height 25000 \
  --screenshot-quality 90

# Multi-browser full page test with custom naming
browserdiff diff https://example.com \
  --browsers chromium firefox webkit \
  --full-page \
  --structured-output \
  --directory-pattern "test_{url}_YYYY-MM-DD_HH-mm" \
  --max-height 20000
```

### CI/CD Integration

GitHub Actions example:

```yaml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install BrowserDiff
        run: npm install -g @browserdiff/cli
      
      - name: Run Visual Tests
        run: |
          browserdiff diff https://example.com \
            --browsers chromium firefox \
            --threshold 0.05
      
      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: browserdiff-report
          path: browserdiff-output/
```

## API Usage

You can also use BrowserDiff programmatically:

```typescript
import { Executor, Logger, DEFAULT_CONFIG } from '@browserdiff/cli';

const config = {
  ...DEFAULT_CONFIG,
  browsers: ['chromium', 'firefox'],
  viewport: { width: 1920, height: 1080 },
};

const logger = new Logger(true);
const executor = new Executor(config, logger);

try {
  const result = await executor.execute('https://example.com', 'chromium');
  console.log('Report generated:', result.reportPath);
  console.log('Success:', result.success);
} catch (error) {
  console.error('Test failed:', error);
}
```

## Architecture

```
src/
├── cli/              # CLI commands and interface
│   ├── commands/     # Individual commands
│   └── validation.ts # Input validation
├── models/           # Data models
├── services/         # Core services
├── core/             # Execution logic
├── utils/            # Utilities
└── templates/        # Report templates
```

## Development

```bash
# Clone repository
git clone https://github.com/your-org/browserdiff.git
cd browserdiff

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Lint
npm run lint

# Format
npm run format
```

## Troubleshooting

### WebKit Dependencies on Linux

If you see errors about missing WebKit dependencies (especially on Arch Linux or rolling-release distributions):

```
⚠️  Skipping comparison with webkit: browserType.launch: 
Missing libraries: libicudata.so.66, libicui18n.so.66...
```

**Quick Solution**: Use Chromium and Firefox only:
```bash
browserdiff diff https://example.com --browsers chromium firefox
```

**Full Solution**: See [WEBKIT_DEPENDENCIES.md](WEBKIT_DEPENDENCIES.md) for detailed instructions on:
- Installing ICU 66 from AUR (Arch Linux)
- Using Docker for guaranteed compatibility
- Understanding the ICU version mismatch issue

Chromium and Firefox provide excellent cross-browser coverage. WebKit is primarily needed for Safari-specific testing.

### HTTPS Certificate Errors

If testing sites with invalid SSL certificates:

```bash
browserdiff diff https://example.com --ignore-https-errors
```

### Permission Errors with npm link

See [LOCAL_TESTING.md](LOCAL_TESTING.md) for alternative testing methods without global installation.

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Your Organization]

## Acknowledgments

- [Playwright](https://playwright.dev/) - Browser automation
- [Pixelmatch](https://github.com/mapbox/pixelmatch) - Image comparison
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [EJS](https://ejs.co/) - Report templating

## Support

- 📚 [Documentation](https://browserdiff.dev/docs)
- 💬 [Discussions](https://github.com/your-org/browserdiff/discussions)
- 🐛 [Issues](https://github.com/your-org/browserdiff/issues)
