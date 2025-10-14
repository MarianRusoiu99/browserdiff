
# Implementation Plan: Full Page Screenshots and Report Organization

**Branch**: `002-full-page-screenshots-report-organization` | **Date**: October 12, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-full-page-screenshots-report-organization/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Enhance browserdiff CLI to capture full page screenshots (instead of viewport-only) and organize reports into individual timestamped folders with sanitized URL naming. Primary requirements: Add `--full-page` CLI flag using Playwright's fullPage option, create structured output directories with format `YYYY-MM-DD_HH-mm-ss_sanitized-url`, maintain backward compatibility. Technical approach: Extend ScreenshotService for full-page capture, enhance ReportService for folder organization, add URL sanitization utilities.

## Technical Context
**Language/Version**: TypeScript 5.0+ with Node.js 18+  
**Primary Dependencies**: Playwright 1.40.0, Commander.js 11.1.0, pixelmatch 5.3.0, PNGJS 7.0.0  
**Storage**: File system for screenshots, reports, and diffs (JSON/HTML/PNG)  
**Testing**: Jest with contract tests and integration tests  
**Target Platform**: Cross-platform CLI (Linux, macOS, Windows)
**Project Type**: Single - CLI tool with src/ and tests/ structure  
**Performance Goals**: Full page screenshot <2x viewport time, report generation <10s  
**Constraints**: Memory usage <1GB for pages up to 10,000px height, backward compatibility  
**Scale/Scope**: CLI tool for individual developers and QA teams, handling pages up to 20,000px

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Code Quality (TypeScript Standards)**:
- ✅ Extends existing TypeScript codebase with proper typing
- ✅ Follows existing service-oriented architecture patterns
- ✅ Maintains separation of concerns (ScreenshotService, ReportService)
- ✅ Design artifacts include comprehensive data models and contracts
- ✅ Agent context file updated with new technologies

**Testing Standards**:
- ✅ Contract tests required for new CLI options and service methods
- ✅ Integration tests required for full workflow validation
- ✅ Performance tests specified for screenshot capture timing
- ✅ Quickstart includes validation steps and success criteria
- ✅ Data model includes validation rules and constraints

**User Experience Consistency**:
- ✅ Maintains backward compatibility with existing CLI interface
- ✅ Follows established CLI option patterns (--flag format)
- ✅ Provides clear error messages and help documentation
- ✅ Quickstart demonstrates progressive enhancement
- ✅ Configuration migration path clearly defined

**Performance Requirements**:
- ✅ Specific performance targets defined (2x viewport time, <10s reports)
- ✅ Memory limits specified (<1GB, height limits for safety)
- ✅ Graceful handling of edge cases (very long pages)
- ✅ Performance monitoring included in quickstart
- ✅ Timeout controls and memory monitoring designed into services

**Reporting Principles**:
- ✅ Enhances existing report structure without breaking changes
- ✅ Maintains JSON/HTML report format compatibility
- ✅ Improves organization through structured output directories
- ✅ Report contracts specify backward compatibility guarantees
- ✅ Enhanced HTML report features designed for better UX

**Contribution Guidelines**:
- ✅ Feature specification follows established documentation patterns
- ✅ Implementation plan follows constitutional planning workflow
- ✅ Clear acceptance criteria and success metrics defined
- ✅ Design artifacts created following established templates
- ✅ Agent context updated incrementally with new technologies

**Assessment**: PASS - Design phase completed successfully. All constitutional principles satisfied with comprehensive design artifacts including data models, contracts, quickstart guide, and updated agent context. Ready for Phase 2 task planning.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── models/              # TestConfig, DiffResult interfaces
├── services/            # ScreenshotService, ReportService, ConfigService  
├── cli/                 # Command definitions and CLI interface
├── core/                # Core diffing and comparison logic
├── utils/               # Utility functions and helpers
└── templates/           # HTML report templates

tests/
├── contract/            # Contract tests for services and CLI
└── integration/         # End-to-end integration tests

dist/                    # Compiled JavaScript output
package.json            # Dependencies: playwright, commander, pixelmatch
tsconfig.json           # TypeScript configuration
```

**Structure Decision**: Single project structure selected. This is a CLI tool with clear separation of concerns: models for configuration and data, services for business logic, CLI for user interface, and comprehensive testing. The existing structure is well-suited for adding full-page screenshot and report organization features.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**Key Task Categories for This Feature**:
1. **Configuration Extension Tasks** [P]: Extend TestConfig, add CLI flags, update help
2. **Screenshot Enhancement Tasks**: Extend ScreenshotService for full-page capture
3. **Report Organization Tasks**: Enhance ReportService, add DirectoryService
4. **URL Sanitization Tasks** [P]: Create utility functions and validation
5. **Contract Test Tasks** [P]: Tests for new CLI options and service methods
6. **Integration Test Tasks**: End-to-end tests for full workflow
7. **Performance Test Tasks**: Validation of timing and memory requirements
8. **Documentation Tasks**: Update README, help text, examples

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.0.0 - See `/memory/constitution.md`*
