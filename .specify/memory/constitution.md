<!--
Sync Impact Report:
- Version change: 1.0.0 → 2.0.0 (major rewrite for UI Cross-Browser CLI Tool)
- Modified principles: 
  * I. Provider Defaults → I. Code Quality (renamed and redefined)
  * II. Code Quality Principles → II. Testing Standards (expanded scope)
  * III. Testing Standards → III. User Experience Consistency (redefined)
  * IV. User Experience Consistency → IV. Performance Requirements (focused on browser optimization)
  * V. Performance Requirements → V. Reporting Principles (new focus area)
- Added sections: VI. Contribution Guidelines
- Removed sections: Provider Defaults principle
- Templates requiring updates: 
  ✅ plan-template.md (Constitution Check section will reference new principles)
  ✅ spec-template.md (aligned with new testing and UX requirements)
  ✅ tasks-template.md (aligned with new contribution guidelines)
  ✅ agent-file-template.md (no updates needed)
- Follow-up TODOs: None - all principles clearly defined
-->

# UI Cross-Browser CLI Tool Constitution

This document defines the guiding principles and development guidelines for the **UI Cross-Browser CLI Tool** project.  
All contributors must adhere to these principles to ensure long-term maintainability, consistency, and quality.

## Core Principles

### I. Code Quality
All code MUST follow a consistent linting and formatting standard (ESLint + Prettier).

Functions MUST remain small, composable, and testable.

Type safety MUST be enforced with TypeScript.

**Rationale**: Consistent code quality standards ensure maintainability, reduce bugs, and enable effective collaboration across team members.

### II. Testing Standards
Unit tests MUST be required for core logic (Jest or Vitest).

Integration tests MUST be required for Playwright CLI workflows.

Visual regression tests MUST be used for browser rendering comparisons.

Every pull request MUST include or update relevant tests.

**Rationale**: Comprehensive testing prevents regressions and ensures reliability across different browser environments and CLI operations.

### III. User Experience Consistency
CLI commands MUST be intuitive and follow common UX patterns (`--help`, `--version`, `--browsers`, etc.).

Error messages MUST be clear, actionable, and consistent.

HTML reports MUST be readable, well-structured, and accessible.

**Rationale**: Consistent UX reduces learning curve and increases tool adoption by providing predictable, professional interactions.

### IV. Performance Requirements
CLI execution MUST minimize unnecessary browser launches (parallel execution where possible).

HTML report generation MUST handle large test suites without freezing.

Screenshots and diffs MUST be cached where possible to avoid redundant work.

**Rationale**: Performance optimization is critical for developer productivity and CI/CD pipeline efficiency, especially with multiple browser testing.

### V. Reporting Principles
The HTML report MUST show:
- Baseline screenshot
- Browser-specific results
- Difference highlights

Reports MUST be exportable and portable (single folder with HTML + images).

**Rationale**: Clear, portable reporting enables effective debugging, collaboration, and integration into various workflows and environments.

### VI. Contribution Guidelines
Branch naming convention MUST follow: `feature/*`, `fix/*`, `chore/*`.

PRs MUST pass lint, type check, and tests before merge.

Documentation (README + CLI help) MUST stay up to date with every release.

**Rationale**: Consistent contribution practices maintain code quality and ensure project documentation remains current and useful.

## Governance

- Any change to core principles MUST be updated in this constitution.  
- The constitution itself MAY only be modified through consensus review.  
- Violations of principles REQUIRE justification in PR descriptions.  
- All PRs/reviews MUST verify compliance with these principles.  
- Complexity beyond these standards MUST be justified or refactored.

**Version**: 2.0.0 | **Ratified**: 2025-10-01 | **Last Amended**: 2025-10-01