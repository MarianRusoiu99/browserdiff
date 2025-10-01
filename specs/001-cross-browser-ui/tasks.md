# Tasks: Cross-Browser UI Diff CLI Tool

**Input**: Design documents from `/specs/001-cross-browser-ui/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
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
- Paths shown below follow single CLI project structure

## Phase 3.1: Setup
- [ ] T001 Create project structure with src/, tests/, and config directories
- [ ] T002 Initialize Node.js project with TypeScript, Playwright, Pixelmatch, Commander.js, EJS dependencies in package.json
- [ ] T003 [P] Configure ESLint and Prettier in .eslintrc.json and .prettierrc
- [ ] T004 [P] Configure TypeScript compiler in tsconfig.json
- [ ] T005 [P] Configure Jest for testing in jest.config.js
- [ ] T006 [P] Create GitHub Actions workflow in .github/workflows/ci.yml

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T007 [P] Contract test for CLI primary command interface in tests/contract/test-cli-primary.test.ts
- [ ] T008 [P] Contract test for CLI config commands in tests/contract/test-cli-config.test.ts
- [ ] T009 [P] Contract test for CLI baseline commands in tests/contract/test-cli-baseline.test.ts
- [ ] T010 [P] Contract test for CLI report commands in tests/contract/test-cli-report.test.ts
- [ ] T011 [P] Contract test for HTML report format in tests/contract/test-report-format.test.ts

### Integration Tests
- [ ] T012 [P] Integration test for basic cross-browser diff execution in tests/integration/test-basic-diff.test.ts
- [ ] T013 [P] Integration test for baseline creation workflow in tests/integration/test-baseline-workflow.test.ts
- [ ] T014 [P] Integration test for configuration file handling in tests/integration/test-config-handling.test.ts
- [ ] T015 [P] Integration test for report generation in tests/integration/test-report-generation.test.ts
- [ ] T016 [P] Integration test for error handling scenarios in tests/integration/test-error-handling.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models
- [ ] T017 [P] TestSession model with UUID generation and validation in src/models/TestSession.ts
- [ ] T018 [P] BrowserResult model with screenshot metadata in src/models/BrowserResult.ts
- [ ] T019 [P] BaselineReference model with image hashing in src/models/BaselineReference.ts
- [ ] T020 [P] DifferenceReport model with pixelmatch integration in src/models/DifferenceReport.ts
- [ ] T021 [P] HTMLReport model with EJS template handling in src/models/HTMLReport.ts
- [ ] T022 [P] Configuration types and validation in src/models/Config.ts

### Core Services
- [ ] T023 [P] BrowserService for Playwright browser management in src/services/BrowserService.ts
- [ ] T024 [P] ScreenshotService for image capture and caching in src/services/ScreenshotService.ts
- [ ] T025 [P] DiffService for Pixelmatch comparison logic in src/services/DiffService.ts
- [ ] T026 [P] BaselineService for baseline management in src/services/BaselineService.ts
- [ ] T027 [P] ReportService for HTML report generation in src/services/ReportService.ts
- [ ] T028 [P] ConfigService for configuration file handling in src/services/ConfigService.ts

### CLI Implementation
- [ ] T029 Main CLI entry point with Commander.js setup in src/cli/index.ts
- [ ] T030 Primary diff command implementation in src/cli/commands/diff.ts
- [ ] T031 Config command implementation in src/cli/commands/config.ts
- [ ] T032 Baseline command implementation in src/cli/commands/baseline.ts
- [ ] T033 Report command implementation in src/cli/commands/report.ts
- [ ] T034 CLI option validation and error handling in src/cli/validation.ts

## Phase 3.4: Integration
- [ ] T035 Orchestrate services in main execution flow in src/core/Executor.ts
- [ ] T036 Parallel browser execution with Promise.all coordination in src/core/ParallelExecutor.ts
- [ ] T037 File system operations and cleanup in src/utils/FileSystem.ts
- [ ] T038 Logging and verbose output implementation in src/utils/Logger.ts
- [ ] T039 Error handling and user-friendly messages in src/utils/ErrorHandler.ts
- [ ] T040 Performance monitoring and timeout handling in src/utils/Performance.ts

## Phase 3.5: Polish
- [ ] T041 [P] Unit tests for TestSession model in tests/unit/models/TestSession.test.ts
- [ ] T042 [P] Unit tests for BrowserService in tests/unit/services/BrowserService.test.ts
- [ ] T043 [P] Unit tests for DiffService in tests/unit/services/DiffService.test.ts
- [ ] T044 [P] Unit tests for configuration validation in tests/unit/models/Config.test.ts
- [ ] T045 [P] Unit tests for CLI option parsing in tests/unit/cli/validation.test.ts
- [ ] T046 [P] Performance tests for parallel execution <10s in tests/performance/parallel-execution.test.ts
- [ ] T047 [P] Memory usage tests <512MB per browser in tests/performance/memory-usage.test.ts
- [ ] T048 [P] Update README.md with installation and usage instructions
- [ ] T049 [P] Create CLI help documentation in src/cli/help.ts
- [ ] T050 [P] Add TypeScript declaration files and exports in src/index.ts

## Dependencies

### Setup Dependencies
- T001 → T002 → T003-T006 (project structure before configuration)

### Test Dependencies
- T003-T006 → T007-T016 (setup before tests)
- All tests (T007-T016) → All implementation (T017-T040)

### Implementation Dependencies
- **Models first**: T017-T022 → T023-T028 (models before services)
- **Services before CLI**: T023-T028 → T029-T034 (services before CLI)
- **Core before Integration**: T029-T034 → T035-T040 (core before integration)
- **Implementation before Polish**: T035-T040 → T041-T050 (implementation before polish)

### Specific Dependencies
- T017 (TestSession) → T023 (BrowserService), T035 (Executor)
- T018 (BrowserResult) → T024 (ScreenshotService)
- T019 (BaselineReference) → T026 (BaselineService)
- T020 (DifferenceReport) → T025 (DiffService)
- T021 (HTMLReport) → T027 (ReportService)
- T022 (Config) → T028 (ConfigService), T034 (CLI validation)

## Parallel Execution Examples

### Phase 3.1 Setup (after T002)
```bash
# Run T003-T006 in parallel (different config files)
Task: "Configure ESLint and Prettier in .eslintrc.json and .prettierrc"
Task: "Configure TypeScript compiler in tsconfig.json"
Task: "Configure Jest for testing in jest.config.js"
Task: "Create GitHub Actions workflow in .github/workflows/ci.yml"
```

### Phase 3.2 Contract Tests
```bash
# Run T007-T011 in parallel (different test files)
Task: "Contract test for CLI primary command interface in tests/contract/test-cli-primary.test.ts"
Task: "Contract test for CLI config commands in tests/contract/test-cli-config.test.ts"
Task: "Contract test for CLI baseline commands in tests/contract/test-cli-baseline.test.ts"
Task: "Contract test for CLI report commands in tests/contract/test-cli-report.test.ts"
Task: "Contract test for HTML report format in tests/contract/test-report-format.test.ts"
```

### Phase 3.2 Integration Tests
```bash
# Run T012-T016 in parallel (different test files)
Task: "Integration test for basic cross-browser diff execution in tests/integration/test-basic-diff.test.ts"
Task: "Integration test for baseline creation workflow in tests/integration/test-baseline-workflow.test.ts"
Task: "Integration test for configuration file handling in tests/integration/test-config-handling.test.ts"
Task: "Integration test for report generation in tests/integration/test-report-generation.test.ts"
Task: "Integration test for error handling scenarios in tests/integration/test-error-handling.test.ts"
```

### Phase 3.3 Data Models
```bash
# Run T017-T022 in parallel (different model files)
Task: "TestSession model with UUID generation and validation in src/models/TestSession.ts"
Task: "BrowserResult model with screenshot metadata in src/models/BrowserResult.ts"
Task: "BaselineReference model with image hashing in src/models/BaselineReference.ts"
Task: "DifferenceReport model with pixelmatch integration in src/models/DifferenceReport.ts"
Task: "HTMLReport model with EJS template handling in src/models/HTMLReport.ts"
Task: "Configuration types and validation in src/models/Config.ts"
```

### Phase 3.3 Core Services
```bash
# Run T023-T028 in parallel (different service files)
Task: "BrowserService for Playwright browser management in src/services/BrowserService.ts"
Task: "ScreenshotService for image capture and caching in src/services/ScreenshotService.ts"
Task: "DiffService for Pixelmatch comparison logic in src/services/DiffService.ts"
Task: "BaselineService for baseline management in src/services/BaselineService.ts"
Task: "ReportService for HTML report generation in src/services/ReportService.ts"
Task: "ConfigService for configuration file handling in src/services/ConfigService.ts"
```

### Phase 3.5 Unit Tests
```bash
# Run T041-T045 in parallel (different unit test files)
Task: "Unit tests for TestSession model in tests/unit/models/TestSession.test.ts"
Task: "Unit tests for BrowserService in tests/unit/services/BrowserService.test.ts"
Task: "Unit tests for DiffService in tests/unit/services/DiffService.test.ts"
Task: "Unit tests for configuration validation in tests/unit/models/Config.test.ts"
Task: "Unit tests for CLI option parsing in tests/unit/cli/validation.test.ts"
```

## Validation Checklist

### Contract Coverage
- [x] CLI primary command → T007
- [x] CLI config commands → T008
- [x] CLI baseline commands → T009  
- [x] CLI report commands → T010
- [x] HTML report format → T011

### Model Coverage
- [x] TestSession → T017
- [x] BrowserResult → T018
- [x] BaselineReference → T019
- [x] DifferenceReport → T020
- [x] HTMLReport → T021
- [x] Configuration → T022

### Service Coverage
- [x] Browser management → T023
- [x] Screenshot capture → T024
- [x] Image comparison → T025
- [x] Baseline management → T026
- [x] Report generation → T027
- [x] Configuration handling → T028

### Integration Coverage
- [x] Basic diff workflow → T012
- [x] Baseline workflow → T013
- [x] Configuration handling → T014
- [x] Report generation → T015
- [x] Error scenarios → T016

## Notes
- All [P] tasks target different files and can run in parallel
- Sequential tasks (no [P]) modify the same files or have dependencies
- Tests MUST fail before implementation begins (TDD requirement)
- Commit after each task completion
- Each task is specific enough for autonomous completion
- File paths follow single CLI project structure from plan.md

## Task Generation Rules Applied
- ✅ Contract files → Contract test tasks (T007-T011)
- ✅ Entities → Model tasks (T017-T022)
- ✅ CLI commands → Implementation tasks (T029-T034)
- ✅ User stories → Integration tests (T012-T016)
- ✅ Different files → Parallel [P] marking
- ✅ Dependencies → Proper ordering
- ✅ TDD → Tests before implementation