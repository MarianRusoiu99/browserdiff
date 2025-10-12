# Feature Specification: Full Page Screenshots and Report Organization

## Overview

Enhance the BrowserDiff CLI tool to capture full page screenshots (instead of just the viewport) and organize reports into individual folders with improved naming conventions.

## User Stories

### As a developer testing full page layouts
- I want to capture the entire page content in screenshots
- So that I can detect visual differences beyond the initial viewport
- And identify layout issues in content that requires scrolling

### As a QA engineer managing test reports
- I want each test report in its own timestamped folder
- So that I can easily organize and archive test results
- And quickly identify when tests were run and what URL was tested

### As a team member sharing test results
- I want report folders with clear, descriptive names
- So that I can easily communicate test results with colleagues
- And maintain organized test artifact history

## Functional Requirements

### FR1: Full Page Screenshot Capture
- **Requirement**: Capture full page screenshots including content below the fold
- **Behavior**: Screenshot should include entire page height, not just viewport
- **Configuration**: Option to toggle between viewport-only and full-page capture
- **Performance**: Full page capture should complete within reasonable time limits

### FR2: Organized Report Structure
- **Requirement**: Each test run creates a dedicated report folder
- **Structure**: 
  ```
  browserdiff-output/
  └── 2025-10-12_14-30-45_example-com/
      ├── report.html
      ├── report.json
      ├── screenshots/
      │   ├── chromium-fullpage.png
      │   ├── firefox-fullpage.png
      │   └── webkit-fullpage.png
      └── diffs/
          └── chromium-vs-firefox.png
  ```

### FR3: Improved File Naming Convention
- **Format**: `YYYY-MM-DD_HH-mm-ss_sanitized-url`
- **URL Sanitization**: Replace invalid filename characters with safe alternatives
- **Uniqueness**: Timestamp ensures no collisions for same URL tested at different times
- **Readability**: Clear indication of test date/time and target URL

### FR4: Backward Compatibility
- **Legacy Support**: Existing CLI options and behavior remain unchanged by default
- **Migration Path**: Clear upgrade path for existing users
- **Configuration**: New features enabled via CLI flags or config options

## Non-Functional Requirements

### NFR1: Performance
- Full page screenshot capture should not exceed 2x viewport capture time
- Report generation should complete within 10 seconds for typical pages
- Memory usage should remain under 1GB for pages up to 10,000px height

### NFR2: Reliability
- Handle extremely long pages gracefully (max height limit)
- Recover from screenshot failures without corrupting reports
- Maintain data integrity during folder/file operations

### NFR3: Usability
- Clear CLI options with intuitive names
- Helpful error messages for edge cases
- Progressive enhancement (works with existing workflows)

### NFR4: Maintainability
- Clean separation between viewport and full-page capture logic
- Reusable folder/naming utilities
- Comprehensive test coverage for new functionality

## Technical Requirements

### TR1: Screenshot Enhancement
- Extend ScreenshotService to support full-page capture
- Use Playwright's full page screenshot capabilities
- Add configuration options for capture mode

### TR2: Report Organization
- Enhance ReportService to create structured output directories  
- Implement URL sanitization utility
- Add timestamp-based folder naming

### TR3: Configuration Extension
- Add CLI flags: `--full-page`, `--output-structure`
- Extend TestConfig model to include new options
- Update help documentation

### TR4: File Management
- Create organized directory structure
- Handle file path length limitations
- Ensure cross-platform compatibility

## Acceptance Criteria

### AC1: Full Page Screenshots
- [ ] CLI accepts `--full-page` flag
- [ ] Screenshots capture entire page height
- [ ] Option works with all supported browsers (Chromium, Firefox, WebKit)
- [ ] Gracefully handles pages that are too long (>20,000px)
- [ ] Performance remains acceptable (within 2x viewport time)

### AC2: Organized Report Structure  
- [ ] Each test creates timestamped folder
- [ ] Folder name includes sanitized URL
- [ ] Screenshots organized in subfolder
- [ ] Diff images organized in subfolder
- [ ] Report files (HTML/JSON) in root of test folder

### AC3: File Naming
- [ ] Timestamp format: YYYY-MM-DD_HH-mm-ss
- [ ] URL sanitization replaces invalid characters
- [ ] No filename collisions for concurrent tests
- [ ] Cross-platform compatible paths

### AC4: CLI Integration
- [ ] New options documented in help
- [ ] Backward compatibility maintained
- [ ] Works with existing config files
- [ ] Clear error messages for invalid options

### AC5: Quality Assurance
- [ ] Unit tests for new utilities
- [ ] Integration tests for full workflow
- [ ] Performance tests validate timing requirements
- [ ] Cross-browser compatibility verified

## Implementation Notes

### Playwright Full Page Screenshots
- Use `page.screenshot({ fullPage: true })` for complete capture
- Handle pages with infinite scroll or dynamic loading
- Set reasonable height limits to prevent memory issues

### URL Sanitization Strategy
```typescript
function sanitizeUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')  // Remove protocol
    .replace(/[^a-zA-Z0-9-_.]/g, '-')  // Replace invalid chars
    .replace(/-+/g, '-')  // Collapse multiple dashes
    .replace(/^-|-$/g, '');  // Remove leading/trailing dashes
}
```

### Output Structure Migration
- Provide CLI flag to use new structure: `--structured-output`
- Default maintains current behavior for backward compatibility
- Future major version can make structured output the default

## Success Metrics

### User Experience
- Reduced time to identify full-page layout issues
- Improved test artifact organization
- Easier report sharing and archival

### Technical Performance  
- Full page screenshot time < 2x viewport time
- Memory usage < 1GB for long pages
- 100% backward compatibility with existing CLI usage

## Clarifications

### Session 1: Full Page Screenshot Implementation (October 12, 2025)

**Q1: Should full page screenshots replace viewport screenshots or be an additional option?**
- **Decision**: Make it an additional option via `--full-page` flag
- **Rationale**: Maintains backward compatibility and allows users to choose based on testing needs
- **Implementation**: Default behavior unchanged, new flag enables full-page capture

**Q2: How should we handle extremely long pages that could cause memory issues?**
- **Decision**: Implement a maximum height limit of 20,000px with configuration option
- **Rationale**: Prevents memory exhaustion while covering vast majority of real-world pages
- **Implementation**: Add `maxScreenshotHeight` to configuration, log warning when limit reached

**Q3: What URL sanitization rules should be applied for folder names?**  
- **Decision**: Use the sanitization strategy shown in Implementation Notes
- **Rationale**: Balances readability with cross-platform filename compatibility
- **Implementation**: Create utility function with comprehensive character replacement rules

**Q4: Should the new folder structure be the default or opt-in?**
- **Decision**: Make it opt-in via `--structured-output` flag initially
- **Rationale**: Prevents breaking existing user workflows and automated scripts
- **Implementation**: Future major version can make structured output the default

**Q5: How should we handle concurrent test runs to prevent folder name collisions?**
- **Decision**: Include milliseconds in timestamp and add random suffix if needed
- **Rationale**: Timestamp to millisecond precision should handle most cases, fallback ensures no collisions
- **Implementation**: Format `YYYY-MM-DD_HH-mm-ss-SSS` with collision detection

## Dependencies

### External Dependencies
- Playwright (existing): Full page screenshot support
- Node.js fs/path modules: Directory and file operations
- Existing BrowserDiff architecture: ScreenshotService, ReportService, ConfigService

### Internal Dependencies
- Extend TestConfig interface
- Enhance ScreenshotService class
- Modify ReportService for structured output
- Update CLI command definitions

## Risk Assessment

### Technical Risks
- **Memory usage with very long pages**: Mitigated by height limits
- **Performance impact on screenshot capture**: Acceptable 2x slowdown for full pages
- **File system path length limits**: Mitigated by URL sanitization and length checks

### User Experience Risks
- **Learning curve for new options**: Mitigated by clear documentation and examples
- **Existing workflow disruption**: Mitigated by backward compatibility
- **Configuration complexity**: Mitigated by sensible defaults

## Future Enhancements

### Phase 2 Possibilities
- Smart screenshot cropping to exclude empty space
- Responsive screenshot capture at multiple viewports
- Screenshot diff highlighting with scroll position context
- Report template customization for structured output
- Integration with CI/CD systems for artifact archival

### Configuration Evolution
- Migrate to structured output as default in v2.0
- Add preset configurations for common use cases
- Enhanced diff visualization for full-page screenshots