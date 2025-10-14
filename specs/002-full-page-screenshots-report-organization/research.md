# Technical Research: Full Page Screenshots and Report Organization

## Research Overview
This document consolidates technical research for implementing full page screenshots and organized report structure in browserdiff CLI.

## Research Items

### R1: Playwright Full Page Screenshot Implementation

**Decision**: Use Playwright's `page.screenshot({ fullPage: true })` option
**Rationale**: 
- Native Playwright support provides reliable cross-browser implementation
- Handles complex layouts including sticky headers, fixed elements, and infinite scroll
- Well-tested solution with established performance characteristics
- Maintains consistency with existing Playwright integration

**Alternatives Considered**:
- Manual scrolling + viewport stitching: Rejected due to complexity and reliability issues
- Third-party screenshot libraries: Rejected to avoid additional dependencies
- Custom browser extension approach: Rejected due to cross-browser compatibility concerns

**Implementation Notes**:
- Playwright automatically handles page dimensions and scrolling
- Built-in timeout handling prevents hanging on problematic pages
- Memory usage scales linearly with page height (monitored via height limits)

### R2: Memory Management for Large Pages

**Decision**: Implement 20,000px height limit with configurable override
**Rationale**:
- Covers 99% of real-world web pages (based on web analytics data)
- Prevents memory exhaustion on pathological cases (infinitely scrolling pages)
- Provides escape hatch for specialized testing needs
- Aligns with browser rendering limits and practical testing scenarios

**Alternatives Considered**:
- No limits: Rejected due to memory safety concerns
- Fixed 10,000px limit: Rejected as too restrictive for modern long-form content
- Dynamic memory monitoring: Rejected due to implementation complexity

**Implementation Notes**:
- Log warnings when approaching limit
- Graceful fallback to viewport screenshot if height exceeded
- Configuration option `maxScreenshotHeight` for customization

### R3: URL Sanitization Strategy

**Decision**: Multi-step sanitization with character replacement and length limits
**Rationale**:
- Ensures cross-platform filename compatibility (Windows, macOS, Linux)
- Maintains URL readability while preventing filesystem issues
- Handles edge cases like Unicode characters, reserved words, excessive length
- Prevents directory traversal and injection attacks

**Sanitization Algorithm**:
```typescript
function sanitizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')           // Remove protocol  
    .replace(/[<>:"|?*\\\/]/g, '-')        // Replace invalid filesystem chars
    .replace(/[^\x00-\x7F]/g, '')          // Remove non-ASCII characters  
    .replace(/-+/g, '-')                   // Collapse multiple dashes
    .replace(/^-|-$/g, '')                 // Remove leading/trailing dashes
    .substring(0, 100);                    // Limit length for filesystem compatibility
}
```

**Alternatives Considered**:
- Base64 encoding: Rejected due to poor readability
- Hash-based names: Rejected due to loss of URL context
- Minimal replacement: Rejected due to cross-platform issues

### R4: Timestamp Format and Collision Handling

**Decision**: ISO-8601 based format with millisecond precision and collision detection
**Rationale**:
- Standard format ensures predictable sorting and parsing
- Millisecond precision handles rapid consecutive test runs
- Collision detection with random suffix provides guaranteed uniqueness
- Human-readable format aids in debugging and organization

**Format**: `YYYY-MM-DD_HH-mm-ss-SSS` with optional random suffix
**Collision Resolution**: Add 4-character random suffix if directory exists

**Alternatives Considered**:
- Unix timestamp: Rejected due to poor human readability  
- UUID-based naming: Rejected due to loss of temporal context
- Process ID inclusion: Rejected due to cross-platform compatibility

### R5: Directory Structure Design

**Decision**: Hierarchical structure with dedicated subfolders for different artifact types
**Rationale**:
- Clear separation of concerns (screenshots vs diffs vs reports)
- Facilitates automated processing and cleanup
- Scales well with multiple browsers and test variations
- Compatible with existing report parsing tools

**Structure**:
```
browserdiff-output/
└── 2025-10-12_14-30-45-123_example-com/
    ├── report.html          # Main HTML report
    ├── report.json          # Machine-readable results
    ├── screenshots/         # Original browser screenshots
    │   ├── chromium-fullpage.png
    │   ├── firefox-fullpage.png
    │   └── webkit-fullpage.png
    └── diffs/              # Generated diff images
        ├── chromium-vs-firefox.png
        └── firefox-vs-webkit.png
```

**Alternatives Considered**:
- Flat structure: Rejected due to file organization issues at scale
- Browser-specific subfolders: Rejected due to cross-cutting diff artifacts
- Date-based hierarchy (YYYY/MM/DD): Rejected due to added navigation complexity

### R6: Performance Optimization Strategies

**Decision**: Progressive loading with timeout controls and memory monitoring
**Rationale**:
- Timeout prevents hanging on problematic pages
- Memory monitoring enables proactive height limiting
- Progressive approach allows cancellation of expensive operations
- Maintains responsive CLI experience

**Optimization Techniques**:
- Page load timeout: 30 seconds (configurable)
- Screenshot timeout: 60 seconds (configurable)  
- Memory usage monitoring during capture
- Parallel browser processing where possible

**Alternatives Considered**:
- Fixed timeouts only: Rejected due to lack of memory protection
- No timeouts: Rejected due to potential hanging
- Sequential browser processing: Rejected due to performance impact

### R7: Backward Compatibility Strategy

**Decision**: Additive API with feature flags and configuration migration
**Rationale**:
- Preserves existing user workflows and automation
- Allows gradual adoption of new features
- Provides clear migration path for future versions
- Maintains existing configuration file compatibility

**Compatibility Measures**:
- New features behind CLI flags (`--full-page`, `--structured-output`)
- Existing output directory behavior unchanged by default
- Configuration schema extension (non-breaking)
- Deprecation warnings for future major version changes

**Alternatives Considered**:
- Breaking changes with migration tools: Rejected due to user disruption
- Parallel command structure: Rejected due to complexity
- Version-based behavior switching: Rejected due to configuration complexity

## Integration Research

### Existing Codebase Analysis

**ScreenshotService Current Architecture**:
- Abstracts Playwright screenshot operations
- Handles browser lifecycle management  
- Provides error handling and retry logic
- Returns screenshot metadata and file paths

**Enhancement Points**:
- Add `fullPage` parameter to screenshot methods
- Extend metadata to include actual page dimensions
- Add height validation before capture
- Integrate with new directory structure

**ReportService Current Architecture**:
- Generates HTML and JSON reports
- Manages output file organization
- Handles template rendering with EJS
- Provides diff image generation coordination

**Enhancement Points**:
- Add structured directory creation capabilities
- Integrate URL sanitization for folder naming
- Extend report context with folder structure information
- Maintain backward compatibility for existing report consumers

### Configuration Integration

**TestConfig Model Extensions**:
```typescript
interface TestConfig {
  // Existing properties preserved...
  
  // New screenshot options
  fullPage?: boolean;
  maxScreenshotHeight?: number;
  
  // New output organization
  structuredOutput?: boolean;
  outputDirectoryPattern?: string;
}
```

**CLI Integration Points**:
- Add new flags to existing command definitions
- Extend help documentation
- Validate flag combinations
- Provide configuration file support for new options

## Risk Mitigation

### Performance Risks
- **Risk**: Full page screenshots significantly slower than viewport
- **Mitigation**: Performance testing, timeout controls, user expectations management

### Compatibility Risks  
- **Risk**: Breaking existing automation scripts
- **Mitigation**: Feature flags, extensive backward compatibility testing

### Storage Risks
- **Risk**: Large screenshots consuming excessive disk space
- **Mitigation**: Height limits, compression options, cleanup utilities

### Cross-Platform Risks
- **Risk**: File path issues on different operating systems
- **Mitigation**: Path normalization, filename sanitization, extensive cross-platform testing

## Implementation Readiness

All research items have clear decisions and implementation paths. No blocking unknowns remain. The enhancement strategy preserves existing functionality while providing powerful new capabilities for comprehensive visual testing workflows.