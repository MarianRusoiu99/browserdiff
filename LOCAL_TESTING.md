# Local Testing Guide

## Method 1: Direct Node Execution (Recommended)

Run the CLI directly using Node.js:

```bash
# From the project root
node dist/cli/index.js diff https://example.com

# With options
node dist/cli/index.js diff https://example.com \
  --browsers chromium firefox \
  --verbose

# Show help
node dist/cli/index.js --help

# Config commands
node dist/cli/index.js config init
node dist/cli/index.js config show

# Baseline commands
node dist/cli/index.js baseline create https://example.com
node dist/cli/index.js baseline list
```

## Method 2: NPM Scripts

Add to your package.json scripts section:

```json
{
  "scripts": {
    "start": "node dist/cli/index.js",
    "cli": "node dist/cli/index.js",
    "test:cli": "node dist/cli/index.js diff https://example.com --verbose"
  }
}
```

Then run:

```bash
npm run cli -- diff https://example.com
npm run test:cli
```

## Method 3: Create a Shell Alias

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
alias browserdiff='node /home/vali/Apps/BrowserDiff/BrowserDiff/dist/cli/index.js'
```

Reload shell:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

Then use:
```bash
browserdiff diff https://example.com
```

## Method 4: NPX with Local Path

```bash
npx . diff https://example.com
```

## Method 5: Install Playwright Browsers First

Before testing, make sure Playwright browsers are installed:

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit browsers.

## Quick Test Commands

### Test with a simple website
```bash
node dist/cli/index.js diff https://example.com --verbose
```

### Test with specific browser
```bash
node dist/cli/index.js diff https://example.com \
  --browsers chromium \
  --verbose
```

### Test configuration
```bash
node dist/cli/index.js config init
node dist/cli/index.js config show
```

### Test baseline workflow
```bash
# Create baseline
node dist/cli/index.js baseline create https://example.com \
  --browser chromium \
  --verbose

# List baselines
node dist/cli/index.js baseline list
```

### Test with custom viewport
```bash
node dist/cli/index.js diff https://example.com \
  --width 1920 \
  --height 1080 \
  --verbose
```

## Development Workflow

1. Make changes to TypeScript files
2. Build: `npm run build`
3. Test: `node dist/cli/index.js diff https://example.com`

## Testing with Different URLs

```bash
# Simple static page
node dist/cli/index.js diff https://example.com

# Your own local server
node dist/cli/index.js diff http://localhost:3000

# Popular sites
node dist/cli/index.js diff https://github.com --browsers chromium
node dist/cli/index.js diff https://stackoverflow.com --browsers chromium firefox
```

## Troubleshooting

### If browsers aren't installed
```bash
npx playwright install
```

### If you get permission errors
Use Method 1 (direct node execution) - no permissions needed!

### If you want to test parallel execution
```bash
node dist/cli/index.js diff https://example.com \
  --browsers chromium firefox webkit \
  --verbose
```

### Check if CLI is working
```bash
node dist/cli/index.js --version
node dist/cli/index.js --help
```

## Output Location

By default, results are saved to:
- Screenshots: `./browserdiff-output/screenshots/`
- Reports: `./browserdiff-output/report-*.html`
- JSON data: `./browserdiff-output/report-*.json`

You can change with `--output` option:
```bash
node dist/cli/index.js diff https://example.com --output ./my-results
```

## View Reports

After running a test, open the HTML report:
```bash
# Linux
xdg-open browserdiff-output/report-*.html

# Or use the report command
node dist/cli/index.js report list
node dist/cli/index.js report view browserdiff-output/report-*.html
```

Or use the `--open` flag to auto-open:
```bash
node dist/cli/index.js diff https://example.com --open
```
