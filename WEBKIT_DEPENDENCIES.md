# Installing WebKit Dependencies on Arch Linux

## Issue
When running BrowserDiff with WebKit browser, you may see this error:

```
⚠️  Skipping comparison with webkit: browserType.launch: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Missing libraries:                                   ║
║     libicudata.so.66                                 ║
║     libicui18n.so.66                                 ║
║     libicuuc.so.66                                   ║
║     libxml2.so.2                                     ║
║     libwebp.so.6                                     ║
║     libffi.so.7                                      ║
╚══════════════════════════════════════════════════════╝
```

## Root Cause

Playwright's WebKit binary is built for Ubuntu 20.04 and expects **ICU version 66**, but Arch Linux uses a newer version (ICU 76+). This is a known compatibility issue between Playwright's pre-built WebKit and rolling-release distributions like Arch Linux.

## Solution Options

### Option 1: Use Chromium and Firefox (Recommended for Arch)

The simplest and most reliable solution on Arch Linux is to use Chromium and Firefox, which work perfectly:

```bash
# Test with just Chromium and Firefox
node dist/cli/index.js diff https://example.com --browsers chromium firefox

# The tool gracefully skips WebKit if it fails
node dist/cli/index.js diff https://example.com --browsers chromium firefox webkit --verbose
```

**Chromium and Firefox provide excellent cross-browser coverage.** WebKit is primarily useful for testing Safari-specific issues on macOS/iOS.

### Option 2: Install ICU 66 from AUR

Install the older ICU version alongside your current system version:

```bash
# Using yay
yay -S icu66

# Or using paru  
paru -S icu66

# Create symlinks (may be needed)
sudo ln -s /usr/lib/libicudata.so.66 /usr/lib/libicudata.so.66
sudo ln -s /usr/lib/libicui18n.so.66 /usr/lib/libicui18n.so.66
sudo ln -s /usr/lib/libicuuc.so.66 /usr/lib/libicuuc.so.66
```

After installation, test WebKit:

```bash
node dist/cli/index.js diff https://example.com --browsers webkit --verbose
```

### Option 3: Use Docker with Ubuntu Base

Run BrowserDiff in a Docker container for guaranteed compatibility:

```bash
# Create docker-compose.yml (see DOCKER.md for details)
docker-compose run browserdiff diff https://example.com
```

### Option 4: Wait for Playwright to Update WebKit

Playwright periodically updates their browser binaries. A future version may include WebKit compiled against newer ICU versions.

```bash
# Check for Playwright updates
npm update playwright
npx playwright install webkit
```

## Current Package Status

Your system has these packages installed:
```
icu 76.1-1        ← Too new (WebKit needs 66)
libxml2 2.14.6-1  ← Compatible
libwebp 1.6.0-2   ← Compatible  
libffi 3.5.2-1    ← Compatible
```

The ICU version mismatch is the main issue.

## Verification

After installing dependencies, verify WebKit works:

```bash
node dist/cli/index.js diff https://example.com --browsers webkit --verbose
```

You should see:
```
✓ webkit: success (XXXms)
```

## Current Status

Without fixing WebKit dependencies:
- ✅ **Chromium**: Fully functional
- ✅ **Firefox**: Fully functional  
- ⚠️ **WebKit**: Requires ICU 66 compatibility layer

**The tool handles this gracefully** - it automatically skips WebKit and continues with the other browsers that work perfectly.

## Recommended Approach

For most users on Arch Linux:
1. **Skip WebKit** - Chromium and Firefox provide excellent coverage
2. **Or** run `npx playwright install-deps webkit` to let Playwright manage dependencies
3. **Or** use the AUR `icu66` package for coexistence

WebKit is mainly needed for Safari-specific testing. For general cross-browser testing, Chromium and Firefox are sufficient.
