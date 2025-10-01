#!/bin/bash

# BrowserDiff Local Testing Script
# Run this script to test the CLI locally

set -e

echo "🧪 BrowserDiff Local Testing Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if dist exists
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  dist/ folder not found. Building...${NC}"
    npm run build
fi

# Check if Playwright browsers are installed
if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    echo -e "${YELLOW}⚠️  Playwright browsers not installed. Installing Chromium...${NC}"
    npx playwright install chromium
fi

echo -e "${BLUE}Test 1: Show version${NC}"
node dist/cli/index.js --version
echo ""

echo -e "${BLUE}Test 2: Show help${NC}"
node dist/cli/index.js --help
echo ""

echo -e "${BLUE}Test 3: Test with example.com (single browser)${NC}"
node dist/cli/index.js diff https://example.com --browsers chromium --verbose
echo ""

echo -e "${BLUE}Test 4: Initialize config${NC}"
node dist/cli/index.js config init --path .browserdiff-test.json || true
echo ""

echo -e "${BLUE}Test 5: Show config${NC}"
node dist/cli/index.js config show --path .browserdiff-test.json || true
echo ""

echo -e "${BLUE}Test 6: List reports${NC}"
node dist/cli/index.js report list
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "📊 Generated files:"
ls -lh browserdiff-output/ 2>/dev/null || echo "No output files yet"
echo ""
echo "🌐 To view the HTML report:"
echo "   xdg-open browserdiff-output/report-*.html"
echo ""
echo "📝 To test with more browsers:"
echo "   node dist/cli/index.js diff https://example.com --browsers chromium firefox webkit --verbose"
