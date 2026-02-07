# Snow-Town Blueprint

## Phase Tracking

### Phase 0: Cleanup Dead Code
- [x] Delete `idea-factory/` directory
- [x] Delete `idea-factory-dashboard/` directory
- [x] Delete `processor.py`
- [x] Verify UM MCP server still starts

### Phase 1: Snow-Town Umbrella Repo + Shared Contracts
- [x] Create directory structure
- [x] Define OutcomeRecord contract
- [x] Define ImprovementRecommendation contract
- [x] Define PersonaUpgradePatch contract
- [x] Implement ContractStore (JSONL + SQLite)
- [x] Generate JSON schemas
- [x] Write contract tests (33 passing)
- [x] Create project files (README, CLAUDE.md, pyproject.toml)

### Phase 2: Outcome Recording in Ultra Magnus
- [x] Add `_emit_outcome_record()` to repository.py
- [x] Hook into `update_stage()` for terminal states
- [x] Hook into `set_github_url()` for published state
- [x] Add `um_record_outcome` tool to server.py
- [x] Add `record_outcome_manual()` for retroactive recording

### Phase 3: Structured Recommendations in Sky-Lynx
- [x] Create `outcome_reader.py` with digest builder
- [x] Extend `claude_client.py` with outcome data section
- [x] Add target_system, target_persona, recommendation_type to Recommendation model
- [x] Update parse_recommendations() to extract new fields
- [x] Add JSON sidecar writer to `report_writer.py`
- [x] Write ImprovementRecommendations to snow-town JSONL store
- [x] Wire outcome reader in `analyzer.py`
- [x] All 28 existing tests still passing

### Phase 4: Persona Upgrade Engine
- [x] Create `persona_upgrader.py`
- [x] Implement Claude API patch generation with structured prompt
- [x] Add schema validation via Academy CLI
- [x] Add --dry-run, --auto-apply, --persona flags
- [x] JSON Pointer patch application logic

### Phase 5: Loop Orchestration
- [x] Create `run_loop.sh` (orchestrates SL -> upgrader -> status)
- [x] Create `loop_status.py` (reports all JSONL counts + health)
- [x] Create cron configuration
- [x] Dry-run test passes end-to-end

### Phase 6: Full Rename (Deferred)
- [ ] Present rename map for approval
- [ ] Execute renames

### Phase 7: Visualization (Deferred)
- [ ] Design dashboard
- [ ] Implement React app
