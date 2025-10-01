# Report Format Contract

**Feature**: Cross-Browser UI Diff CLI Tool  
**Contract**: HTML Report Structure  
**Date**: 2025-10-01

## HTML Report Structure

### File Organization
```
session-{sessionId}/
├── report.html                 # Main report file
├── assets/
│   ├── css/
│   │   └── report.css         # Report styling
│   ├── js/
│   │   └── report.js          # Interactive functionality
│   ├── screenshots/
│   │   ├── baseline.png       # Reference image
│   │   ├── chromium.png       # Browser screenshots
│   │   ├── firefox.png
│   │   └── webkit.png
│   └── diffs/
│       ├── chromium-diff.png  # Difference images
│       ├── firefox-diff.png
│       └── webkit-diff.png
└── session-data.json          # Test session metadata
```

## Report HTML Structure

### Document Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cross-Browser Diff Report - {TARGET_URL}</title>
    <style>
        /* Embedded CSS for self-containment */
    </style>
</head>
<body>
    <header class="report-header">
        <!-- Report title, timestamp, summary -->
    </header>
    
    <nav class="report-navigation">
        <!-- Browser tabs, comparison controls -->
    </nav>
    
    <main class="report-content">
        <!-- Comparison views, difference highlights -->
    </main>
    
    <footer class="report-footer">
        <!-- Execution details, system info -->
    </footer>
    
    <script>
        /* Embedded JavaScript for interactivity */
    </script>
</body>
</html>
```

### Header Section
```html
<header class="report-header">
    <div class="header-content">
        <h1 class="report-title">Cross-Browser Diff Report</h1>
        <div class="report-metadata">
            <div class="target-info">
                <span class="label">Target:</span>
                <span class="value">{TARGET_URL}</span>
            </div>
            <div class="timestamp">
                <span class="label">Generated:</span>
                <span class="value">{TIMESTAMP}</span>
            </div>
            <div class="session-id">
                <span class="label">Session:</span>
                <span class="value">{SESSION_ID}</span>
            </div>
        </div>
        <div class="summary-stats">
            <div class="stat">
                <span class="stat-value">{BROWSER_COUNT}</span>
                <span class="stat-label">Browsers</span>
            </div>
            <div class="stat">
                <span class="stat-value">{MATCH_COUNT}</span>
                <span class="stat-label">Matches</span>
            </div>
            <div class="stat">
                <span class="stat-value">{DIFF_COUNT}</span>
                <span class="stat-label">Differences</span>
            </div>
            <div class="stat">
                <span class="stat-value">{EXECUTION_TIME}s</span>
                <span class="stat-label">Duration</span>
            </div>
        </div>
    </div>
</header>
```

### Navigation Section
```html
<nav class="report-navigation">
    <div class="browser-tabs">
        <button class="tab-button active" data-browser="overview">
            📊 Overview
        </button>
        <button class="tab-button" data-browser="chromium" data-status="{STATUS}">
            🌐 Chromium
            <span class="status-indicator {STATUS}"></span>
        </button>
        <button class="tab-button" data-browser="firefox" data-status="{STATUS}">
            🦊 Firefox
            <span class="status-indicator {STATUS}"></span>
        </button>
        <button class="tab-button" data-browser="webkit" data-status="{STATUS}">
            🧭 WebKit
            <span class="status-indicator {STATUS}"></span>
        </button>
    </div>
    
    <div class="view-controls">
        <div class="view-mode">
            <label>
                <input type="radio" name="view" value="side-by-side" checked>
                Side by Side
            </label>
            <label>
                <input type="radio" name="view" value="overlay">
                Overlay
            </label>
            <label>
                <input type="radio" name="view" value="difference">
                Difference Only
            </label>
        </div>
        
        <div class="zoom-controls">
            <button id="zoom-out">➖</button>
            <span id="zoom-level">100%</span>
            <button id="zoom-in">➕</button>
            <button id="zoom-fit">🔍 Fit</button>
        </div>
    </div>
</nav>
```

### Overview Tab Content
```html
<div class="tab-content" id="overview-tab">
    <div class="overview-section">
        <h2>Test Configuration</h2>
        <div class="config-grid">
            <div class="config-item">
                <span class="config-label">Target URL:</span>
                <span class="config-value">{TARGET_URL}</span>
            </div>
            <div class="config-item">
                <span class="config-label">Viewport:</span>
                <span class="config-value">{VIEWPORT_WIDTH}x{VIEWPORT_HEIGHT}</span>
            </div>
            <div class="config-item">
                <span class="config-label">Threshold:</span>
                <span class="config-value">{THRESHOLD}%</span>
            </div>
            <div class="config-item">
                <span class="config-label">Browsers:</span>
                <span class="config-value">{BROWSER_LIST}</span>
            </div>
        </div>
    </div>
    
    <div class="results-grid">
        <div class="result-card" data-browser="chromium">
            <div class="result-header">
                <h3>🌐 Chromium</h3>
                <span class="status-badge {STATUS}">{STATUS}</span>
            </div>
            <div class="result-preview">
                <img src="assets/screenshots/chromium.png" alt="Chromium screenshot" loading="lazy">
                <div class="result-stats">
                    <div class="stat">
                        <span class="stat-label">Difference:</span>
                        <span class="stat-value">{DIFF_PERCENTAGE}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Load Time:</span>
                        <span class="stat-value">{LOAD_TIME}ms</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Similar result cards for Firefox and WebKit -->
    </div>
</div>
```

### Browser-Specific Tab Content
```html
<div class="tab-content" id="chromium-tab" style="display: none;">
    <div class="browser-info">
        <h2>🌐 Chromium Results</h2>
        <div class="browser-metadata">
            <span class="browser-version">Version: {BROWSER_VERSION}</span>
            <span class="user-agent">{USER_AGENT}</span>
            <span class="platform">Platform: {PLATFORM}</span>
        </div>
    </div>
    
    <div class="comparison-container">
        <div class="comparison-view side-by-side">
            <div class="image-panel">
                <h3>Baseline Reference</h3>
                <div class="image-container">
                    <img src="assets/screenshots/baseline.png" 
                         alt="Baseline reference" 
                         class="comparison-image baseline-image">
                </div>
            </div>
            
            <div class="image-panel">
                <h3>Chromium Render</h3>
                <div class="image-container">
                    <img src="assets/screenshots/chromium.png" 
                         alt="Chromium screenshot" 
                         class="comparison-image browser-image">
                </div>
            </div>
            
            <div class="image-panel">
                <h3>Visual Differences</h3>
                <div class="image-container">
                    <img src="assets/diffs/chromium-diff.png" 
                         alt="Difference visualization" 
                         class="comparison-image diff-image">
                </div>
            </div>
        </div>
        
        <div class="difference-stats">
            <div class="stat-item">
                <span class="stat-label">Total Pixels:</span>
                <span class="stat-value">{TOTAL_PIXELS}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Different Pixels:</span>
                <span class="stat-value">{DIFF_PIXELS}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Percentage:</span>
                <span class="stat-value {DIFF_CLASS}">{DIFF_PERCENTAGE}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Threshold:</span>
                <span class="stat-value">{THRESHOLD}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Result:</span>
                <span class="stat-value status-{STATUS}">{STATUS_TEXT}</span>
            </div>
        </div>
    </div>
</div>
```

### Footer Section
```html
<footer class="report-footer">
    <div class="execution-details">
        <div class="detail-section">
            <h4>Execution Summary</h4>
            <ul>
                <li>Started: {START_TIME}</li>
                <li>Completed: {END_TIME}</li>
                <li>Duration: {DURATION}s</li>
                <li>Screenshots: {SUCCESS_COUNT}/{TOTAL_COUNT}</li>
            </ul>
        </div>
        
        <div class="detail-section">
            <h4>System Information</h4>
            <ul>
                <li>Node.js: {NODE_VERSION}</li>
                <li>Playwright: {PLAYWRIGHT_VERSION}</li>
                <li>Platform: {OS_PLATFORM}</li>
                <li>Architecture: {OS_ARCH}</li>
            </ul>
        </div>
        
        <div class="detail-section">
            <h4>Configuration</h4>
            <ul>
                <li>Browsers: {BROWSER_LIST}</li>
                <li>Viewport: {VIEWPORT}</li>
                <li>Threshold: {THRESHOLD}%</li>
                <li>Parallel: {PARALLEL_COUNT}</li>
            </ul>
        </div>
    </div>
    
    <div class="footer-branding">
        <p>Generated by Cross-Browser UI Diff CLI Tool v{TOOL_VERSION}</p>
        <p>Report ID: {REPORT_ID}</p>
    </div>
</footer>
```

## Interactive Features

### Tab Navigation
```javascript
// Tab switching functionality
function switchTab(browserName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(`${browserName}-tab`).style.display = 'block';
    
    // Add active class to selected tab
    document.querySelector(`[data-browser="${browserName}"]`).classList.add('active');
}
```

### View Mode Controls
```javascript
// View mode switching (side-by-side, overlay, difference-only)
function setViewMode(mode) {
    const containers = document.querySelectorAll('.comparison-view');
    containers.forEach(container => {
        container.className = `comparison-view ${mode}`;
    });
    
    // Update visibility of image panels based on mode
    if (mode === 'difference') {
        // Show only difference images
    } else if (mode === 'overlay') {
        // Enable overlay mode with transparency controls
    }
}
```

### Zoom and Pan Controls
```javascript
// Image zoom and pan functionality
let zoomLevel = 1.0;

function zoomIn() {
    zoomLevel = Math.min(zoomLevel * 1.2, 5.0);
    updateImageZoom();
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel / 1.2, 0.1);
    updateImageZoom();
}

function zoomFit() {
    // Calculate optimal zoom to fit images in viewport
}

function updateImageZoom() {
    document.querySelectorAll('.comparison-image').forEach(img => {
        img.style.transform = `scale(${zoomLevel})`;
    });
    document.getElementById('zoom-level').textContent = `${Math.round(zoomLevel * 100)}%`;
}
```

## Styling Requirements

### Color Scheme
- **Primary**: #2563eb (blue)
- **Success**: #16a34a (green)
- **Warning**: #ea580c (orange)
- **Error**: #dc2626 (red)
- **Neutral**: #6b7280 (gray)
- **Background**: #f9fafb (light gray)

### Typography
- **Headers**: Inter, system-ui, sans-serif
- **Body**: Inter, system-ui, sans-serif
- **Code**: 'Fira Code', Consolas, monospace

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly controls on mobile
- Collapsible navigation on small screens

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support
- High contrast mode compatibility
- Screen reader friendly structure
- Alt text for all images

## Data Embedding

### Image Assets
- All images embedded as base64 data URIs for self-containment
- Fallback to external files if embedding fails
- Lazy loading for performance optimization
- Progressive JPEG for large screenshots

### Session Data
```javascript
// Embedded session data for JavaScript access
window.BROWSERDIFF_SESSION = {
    sessionId: "{SESSION_ID}",
    targetUrl: "{TARGET_URL}",
    timestamp: "{TIMESTAMP}",
    browsers: [
        {
            name: "chromium",
            version: "{VERSION}",
            status: "success",
            screenshotPath: "assets/screenshots/chromium.png",
            diffPath: "assets/diffs/chromium-diff.png",
            stats: {
                pixelDifference: 1234,
                percentageDifference: 2.3,
                loadTime: 1250
            }
        }
        // ... other browsers
    ],
    config: {
        viewport: { width: 1920, height: 1080 },
        threshold: 0.1,
        browsers: ["chromium", "firefox", "webkit"]
    }
};
```

## Error Handling in Reports

### Failed Screenshots
```html
<div class="image-container error-state">
    <div class="error-placeholder">
        <div class="error-icon">⚠️</div>
        <div class="error-message">Screenshot capture failed</div>
        <div class="error-details">{ERROR_MESSAGE}</div>
    </div>
</div>
```

### Missing Baselines
```html
<div class="image-container no-baseline">
    <div class="info-placeholder">
        <div class="info-icon">ℹ️</div>
        <div class="info-message">No baseline available</div>
        <div class="info-details">This browser result cannot be compared</div>
    </div>
</div>
```

**Status**: Report format contract complete and ready for implementation