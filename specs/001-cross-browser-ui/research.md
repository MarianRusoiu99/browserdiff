# Research: Cross-Browser UI Diff CLI Tool

**Feature**: Cross-Browser UI Diff CLI Tool  
**Date**: 2025-10-01  
**Phase**: 0 - Technical Research & Architecture Decisions

## Architecture Overview

### High-Level Design
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CLI Layer     │───▶│ Execution Layer  │───▶│ Reporting Layer │
│ (Commander.js)  │    │   (Playwright)   │    │ (EJS Templates) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Diff Engine   │
                       │  (Pixelmatch)   │
                       └─────────────────┘
```

### Layer Responsibilities

**CLI Layer**
- Command parsing and validation (`--browsers`, `--config`, `--output`)
- User input sanitization and help/version display
- Configuration file loading (JSON/YAML support)
- Error handling and user feedback

**Execution Layer**
- Browser lifecycle management via Playwright
- Parallel browser execution coordination
- Screenshot capture and storage
- Baseline management and comparison

**Diff Engine**
- Pixel-level comparison using Pixelmatch
- Difference highlighting and annotation
- Performance optimization through caching
- Image format handling and conversion

**Reporting Layer**
- HTML report generation using EJS templates
- Asset embedding and self-containment
- Navigation structure and accessibility
- Portable output directory management

## Technical Decisions

### 1. Runtime Platform: Node.js + TypeScript
**Decision**: Node.js 18+ with TypeScript 5.0+
**Rationale**: 
- Playwright native support and ecosystem
- Strong typing reduces CLI complexity bugs
- Cross-platform compatibility (Linux, macOS, Windows)
- Rich npm ecosystem for CLI tools

### 2. Browser Automation: Playwright
**Decision**: Playwright for all browser interactions
**Rationale**:
- Multi-browser support (Chromium, Firefox, WebKit)
- Reliable screenshot capabilities
- Built-in waiting and synchronization
- Active development and maintenance

### 3. Image Comparison: Pixelmatch
**Decision**: Pixelmatch for pixel-level diff computation
**Rationale**:
- Fast, lightweight pixel comparison
- Configurable threshold and anti-aliasing
- Good difference highlighting capabilities
- No native dependencies

### 4. CLI Framework: Commander.js
**Decision**: Commander.js for command-line interface
**Rationale**:
- Mature, well-documented CLI parsing
- Built-in help generation
- Subcommand and option validation
- TypeScript support available

### 5. Templating: EJS
**Decision**: EJS for HTML report generation
**Rationale**:
- Simple, JavaScript-based templating
- No complex compilation step
- Good performance for report generation
- Easy to embed assets inline

## Performance Strategy

### Parallel Execution
- Launch all browsers simultaneously using Promise.all()
- Independent screenshot capture per browser
- Shared diff computation queue to manage memory

### Caching Strategy
- Screenshot caching based on URL + viewport hash
- Diff result caching for repeated comparisons
- Baseline storage with metadata timestamps
- Smart cache invalidation on content changes

### Memory Management
- Stream-based image processing where possible
- Browser instance cleanup after capture
- Configurable parallel browser limits
- Progress reporting for long operations

## Configuration Architecture

### Config File Support
```typescript
interface Config {
  browsers: string[];           // ['chromium', 'firefox', 'webkit']
  viewport: {
    width: number;             // Default: 1920
    height: number;            // Default: 1080
  };
  comparison: {
    threshold: number;          // Default: 0.1
    includeAA: boolean;        // Default: true
  };
  output: {
    directory: string;         // Default: './reports'
    format: 'html';           // Future: 'json', 'junit'
  };
  timeout: {
    pageLoad: number;         // Default: 30000ms
    screenshot: number;       // Default: 5000ms
  };
}
```

### CLI Options Mapping
- `--browsers chrome,firefox` → config.browsers
- `--viewport 1280x720` → config.viewport
- `--threshold 0.05` → config.comparison.threshold
- `--output ./my-reports` → config.output.directory

## Error Handling Strategy

### Browser Failures
- Graceful degradation when browsers unavailable
- Clear error messages for missing browser binaries
- Retry logic for transient network failures
- Detailed logging for debugging

### Image Processing Errors
- Validation of image formats and dimensions
- Fallback handling for corrupted baselines
- Clear diff when comparison impossible
- User guidance for resolution steps

### File System Issues
- Permission checking before operations
- Atomic operations for report generation
- Cleanup on interrupted execution
- Path validation and sanitization

## Security Considerations

### Input Validation
- URL validation and sanitization
- File path traversal prevention
- Config file schema validation
- Browser option sanitization

### Output Security
- Safe HTML generation (no script injection)
- Image data validation
- Secure temporary file handling
- Restricted file system access

## Future Extensibility

### Plugin Architecture
- Diff algorithm plugins (beyond Pixelmatch)
- Report format plugins (JSON, JUnit, etc.)
- Browser driver plugins (beyond Playwright)
- Custom screenshot processors

### API Design
- Core library separate from CLI
- Programmatic usage support
- Event-driven architecture for progress
- Configurable reporter interfaces

## Dependencies Analysis

### Core Dependencies
- `playwright`: Browser automation (stable, actively maintained)
- `pixelmatch`: Image comparison (mature, performant)
- `commander`: CLI framework (stable, widely used)
- `ejs`: Templating (lightweight, simple)

### Development Dependencies
- `typescript`: Type checking and compilation
- `jest`: Unit and integration testing
- `eslint`: Code quality and consistency
- `prettier`: Code formatting

### Risk Assessment
- All chosen dependencies are mature and actively maintained
- No dependencies with known security vulnerabilities
- Minimal dependency tree to reduce supply chain risks
- All dependencies support TypeScript or have type definitions

## Outstanding Questions Requiring Clarification

### Image Format Support
**Question**: What image formats should be supported for baselines and outputs?
**Impact**: Affects file size, quality, and browser compatibility
**Recommendation**: PNG for lossless quality, JPEG option for size optimization

### Baseline Management
**Question**: How should the tool behave when no baseline exists?
**Options**: 
1. Create new baseline automatically
2. Prompt user for confirmation
3. Error and require explicit baseline creation
**Recommendation**: Option 2 - prompt user to prevent accidental baseline creation

### Report Customization
**Question**: Should reports support custom branding or styling?
**Impact**: Affects template complexity and user adoption
**Recommendation**: Start with single professional template, add customization later

## Implementation Readiness

✅ **Architecture Defined**: Clear layer separation and responsibilities  
✅ **Technology Stack**: All major technical decisions made  
✅ **Performance Strategy**: Caching and parallelization planned  
✅ **Configuration Design**: Flexible config file and CLI options  
✅ **Error Handling**: Comprehensive failure scenarios addressed  
✅ **Security Considerations**: Input validation and output safety planned  
✅ **Dependency Analysis**: All dependencies validated and approved  

**Status**: Ready to proceed to Phase 1 (Design Artifacts)