# BrowserDiff

> Cross-browser UI testing and visual regression tool powered by Playwright

BrowserDiff is a command-line tool that captures screenshots of web pages across multiple browsers (Chromium, Firefox, WebKit) and performs pixel-perfect visual comparisons to detect rendering differences.

## Features

- 🌐 **Multi-Browser Support**: Test across Chromium, Firefox, and WebKit
- 📸 **Screenshot Capture**: Automated screenshot capture with configurable viewports
- 🔍 **Visual Diff**: Pixel-level comparison using Pixelmatch
- 📊 **HTML Reports**: Beautiful, interactive HTML reports with diff visualization
- ⚙️ **Configurable**: Flexible configuration via CLI options or config file
- 🎯 **Baseline Management**: Create and manage baseline images for regression testing
- ⚡ **Parallel Execution**: Concurrent browser testing for faster results
- 🔧 **TypeScript**: Fully typed for better developer experience

## Installation

```bash
npm install -g @browserdiff/cli
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
  "parallel": 3
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
- `--open` - Open report after generation
- `--verbose` - Verbose output

**Example:**

```bash
browserdiff diff https://example.com \
  --browsers chromium firefox webkit \
  --width 1920 --height 1080 \
  --threshold 0.05 \
  --open
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
