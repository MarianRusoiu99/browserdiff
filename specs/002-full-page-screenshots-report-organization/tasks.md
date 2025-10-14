# Tasks: Full Page Screenshots and Report Organization

**Input**: - [x] T019 [P] Extend ScreenshotService with full page capture in src/services/screenshot-service.tsesign documents from `/specs/002-full-page-screenshots-report-organization/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: TypeScript 5.0+, Node.js 18+, Playwright 1.40.0, CLI structure
2. Load optional design documents:
   → data-model.md: Extract 7 entities → model/interface tasks
   → contracts/: cli-interface.md → contract test task
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract 3 user stories → integration test tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: file system operations, error handling
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize TypeScript project with Playwright dependencies
- [x] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test CLI interface extensions in tests/contract/test_cli_interface_extensions.test.ts
- [x] T005 [P] Contract test ScreenshotConfig model in tests/contract/test_screenshot_config.test.ts
- [x] T006 [P] Contract test ReportConfig model in tests/contract/test_report_config.test.ts
- [x] T007 [P] Integration test full page screenshots in tests/integration/test_full_page_screenshots.test.ts
- [x] T008 [P] Integration test structured output in tests/integration/test_structured_output.test.ts
- [x] T009 [P] Integration test combined features in tests/integration/test_combined_features.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T010 [P] ScreenshotConfig interface in src/models/screenshot-config.ts
- [x] T011 [P] ReportConfig interface in src/models/report-config.ts
- [x] T012 [P] UrlSanitizationConfig interface in src/models/url-sanitization-config.ts
- [x] T013 [P] ReportStructure interface in src/models/report-structure.ts
- [x] T014 [P] Enhanced ScreenshotResult interface in src/models/screenshot-result.ts
- [x] T015 [P] Enhanced DiffResult interface in src/models/diff-result.ts
- [x] T016 [P] Enhanced TestConfig interface in src/models/test-config.ts
- [x] T017 [P] URL sanitization utility in src/utils/url-sanitization.ts
- [x] T018 [P] Directory management utility in src/utils/directory-utils.ts
- [x] T019 Extend ScreenshotService with full page capture in src/services/screenshot-service.ts
- [x] T020 Extend ReportService with structured output in src/services/report-service.ts
- [x] T021 [P] DirectoryService implementation in src/services/directory-service.ts
- [x] T022 Extend CLI diff command with new options in src/cli/diff-command.ts
- [x] T023 Update configuration parsing in src/services/config-service.ts

## Phase 3.4: Integration
- [x] T024 Connect DirectoryService to filesystem operations
- [x] T025 URL sanitization integration
- [x] T026 Error handling and logging for new features

## Phase 3.5: Polish
- [x] T027 [P] Unit tests for URL sanitization in tests/unit/test_url_sanitization.test.ts
- [x] T028 [P] Unit tests for directory utilities in tests/unit/test_directory_utils.test.ts
- [x] T029 Performance tests for full page screenshots (<2x viewport time)
- [x] T030 [P] Update README.md with new features
- [x] T031 Remove code duplication
- [x] T032 Run quickstart.md validation steps

## Dependencies
- Tests (T004-T009) before implementation (T010-T023)
- T010-T016 blocks T017-T023 (models before services)
- T017-T021 blocks T022-T023 (services before CLI)
- T022 blocks T023 (CLI before config parsing)
- Implementation before polish (T027-T032)

## Parallel Execution Examples
```
# Launch T004-T006 together (contract tests for different models):
Task: "Contract test CLI interface extensions in tests/contract/test_cli_interface_extensions.test.ts"
Task: "Contract test ScreenshotConfig model in tests/contract/test_screenshot_config.test.ts"
Task: "Contract test ReportConfig model in tests/contract/test_report_config.test.ts"

# Launch T007-T009 together (integration tests for different scenarios):
Task: "Integration test full page screenshots in tests/integration/test_full_page_screenshots.test.ts"
Task: "Integration test structured output in tests/integration/test_structured_output.test.ts"
Task: "Integration test combined features in tests/integration/test_combined_features.test.ts"

# Launch T010-T016 together (model interfaces - different files):
Task: "ScreenshotConfig interface in src/models/screenshot-config.ts"
Task: "ReportConfig interface in src/models/report-config.ts"
Task: "UrlSanitizationConfig interface in src/models/url-sanitization-config.ts"
Task: "ReportStructure interface in src/models/report-structure.ts"
Task: "Enhanced ScreenshotResult interface in src/models/screenshot-result.ts"
Task: "Enhanced DiffResult interface in src/models/diff-result.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules Applied
- Each contract file → contract test task marked [P]
- Each entity in data-model.md → model creation task marked [P]
- Each user story in quickstart.md → integration test marked [P]
- Different files = can be parallel [P]
- Same file = sequential (no [P])
- Tests before implementation (TDD)
- Models before services
- Services before CLI
- CLI before configuration
- Everything before polish</content>
<parameter name="filePath">/home/vali/Apps/BrowserDiff/BrowserDiff/specs/002-full-page-screenshots-report-organization/tasks.md