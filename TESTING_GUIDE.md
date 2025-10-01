# 🚀 How to Test BrowserDiff Locally

## ✅ Your Setup is Working!

The CLI has been successfully tested and is working. Here's how to use it:

---

## Quick Start (Already Built)

Since the project is already built, you can test immediately:

```bash
# Test with example.com (fastest - single browser)
node dist/cli/index.js diff https://example.com --browsers chromium --verbose

# Test with multiple browsers
node dist/cli/index.js diff https://example.com --browsers chromium firefox --verbose

# Show help
node dist/cli/index.js --help

# Show version
node dist/cli/index.js --version
```

---

## Automated Testing

Use the provided test script:

```bash
./test-local.sh
```

This will:
- Check if build exists
- Install Playwright browsers if needed
- Run multiple test scenarios
- Show you where the reports are saved

---

## Test Commands by Feature

### 1. Basic Diff Test
```bash
node dist/cli/index.js diff https://example.com --browsers chromium --verbose
```

**Expected Output:**
- ✓ Screenshot captured
- ✓ Report generated in `browserdiff-output/`
- ✓ Exit code 0 (success)

### 2. Multi-Browser Test
```bash
# Install other browsers first (optional)
npx playwright install firefox webkit

# Then test
node dist/cli/index.js diff https://example.com \
  --browsers chromium firefox webkit \
  --verbose
```

### 3. Configuration Management
```bash
# Initialize config
node dist/cli/index.js config init

# Show current config
node dist/cli/index.js config show

# Validate config
node dist/cli/index.js config validate
```

### 4. Baseline Management
```bash
# Create baseline
node dist/cli/index.js baseline create https://example.com \
  --browser chromium \
  --verbose

# List baselines
node dist/cli/index.js baseline list

# The baseline is stored in ./baselines/ directory
```

### 5. Report Management
```bash
# List all reports
node dist/cli/index.js report list

# View specific report (auto-opens in browser)
node dist/cli/index.js report view browserdiff-output/report-*.html
```

### 6. Custom Viewport Testing
```bash
# Desktop
node dist/cli/index.js diff https://example.com \
  --width 1920 --height 1080 \
  --browsers chromium

# Tablet
node dist/cli/index.js diff https://example.com \
  --width 768 --height 1024 \
  --browsers chromium

# Mobile
node dist/cli/index.js diff https://example.com \
  --width 375 --height 667 \
  --browsers chromium
```

---

## Test with Different Websites

```bash
# Simple static page
node dist/cli/index.js diff https://example.com --browsers chromium

# Your local development server
node dist/cli/index.js diff http://localhost:3000 --browsers chromium

# Popular websites
node dist/cli/index.js diff https://github.com --browsers chromium --verbose
node dist/cli/index.js diff https://stackoverflow.com --browsers chromium --verbose
```

---

## Understanding the Output

After running a test, you'll get:

```
browserdiff-output/
├── report-<session-id>.html    # Beautiful HTML report
├── report-<session-id>.json    # Machine-readable data
└── screenshots/
    └── chromium-<timestamp>.png  # Browser screenshots
```

### View the Report

**Option 1: Manual**
```bash
# Linux
xdg-open browserdiff-output/report-*.html

# macOS
open browserdiff-output/report-*.html

# Windows
start browserdiff-output/report-*.html
```

**Option 2: Use CLI command**
```bash
node dist/cli/index.js report view browserdiff-output/report-*.html
```

**Option 3: Auto-open flag**
```bash
node dist/cli/index.js diff https://example.com --open
```

---

## Development Workflow

When you make changes:

```bash
# 1. Edit TypeScript files in src/
vim src/services/BrowserService.ts

# 2. Rebuild (includes template copying)
npm run build

# 3. Test your changes
node dist/cli/index.js diff https://example.com --verbose
```

---

## Troubleshooting

### Issue: "Cannot find module 'playwright'"
**Solution:**
```bash
npm install
```

### Issue: "Browser not found"
**Solution:**
```bash
# Install browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Or install all at once
npx playwright install
```

### Issue: "ENOENT: no such file or directory, open '.../report.ejs'"
**Solution:**
```bash
# The build script should copy templates automatically
npm run build

# Or manually
mkdir -p dist/templates
cp src/templates/*.ejs dist/templates/
```

### Issue: "Permission denied" errors
**Solution:** Use direct node execution (no npm link or global install needed):
```bash
node dist/cli/index.js <command>
```

---

## Performance Testing

Test parallel execution:

```bash
# Time the execution with all 3 browsers in parallel
time node dist/cli/index.js diff https://example.com \
  --browsers chromium firefox webkit \
  --verbose
```

Expected: < 10 seconds for parallel execution

---

## Exit Codes

The CLI follows standard conventions:

- **0** = Success (no differences or within threshold)
- **1** = Failure (differences beyond threshold or error occurred)

Test this:
```bash
node dist/cli/index.js diff https://example.com --browsers chromium
echo "Exit code: $?"
```

---

## Create a Shell Alias (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias browserdiff='node /home/vali/Apps/BrowserDiff/BrowserDiff/dist/cli/index.js'
```

Then reload:
```bash
source ~/.bashrc
```

Now you can use:
```bash
browserdiff diff https://example.com
browserdiff --help
```

---

## Next Steps

1. ✅ **You've successfully tested the CLI!**
2. Try testing with your own website
3. Experiment with different viewport sizes
4. Create baselines for regression testing
5. View the beautiful HTML reports

---

## Example Test Session

```bash
# Start fresh
rm -rf browserdiff-output/ baselines/

# Test with example.com
node dist/cli/index.js diff https://example.com \
  --browsers chromium \
  --verbose \
  --open

# Create a baseline
node dist/cli/index.js baseline create https://example.com \
  --browser chromium

# List everything
node dist/cli/index.js report list
node dist/cli/index.js baseline list
```

---

## Success Indicators

✅ Screenshots are captured in `browserdiff-output/screenshots/`  
✅ HTML report is generated  
✅ JSON data is exported  
✅ Exit code is 0 for successful tests  
✅ Verbose logging shows progress  

🎉 **Your CLI is working perfectly!**
