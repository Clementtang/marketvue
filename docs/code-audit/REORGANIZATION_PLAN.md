# Code Audit Directory Reorganization Plan

**Date**: 2025-11-20
**Purpose**: Establish consistent naming conventions and organize documents logically

---

## Issues Identified

### 1. Inconsistent Work Log Naming
- ❌ `work-log-day5-2025-11-17.md` (missing phase number)
- ❌ `work-log-day6-2025-11-17.md` (missing phase number)
- ❌ `work-log-day7-2025-11-20.md` (missing phase number)
- ✅ `work-log-day1-phase3-2025-11-20.md` (correct format)
- ✅ `work-log-day2-phase3-2025-11-20.md` (correct format)

**Standard Format**: `work-log-phase{N}-day{N}-YYYY-MM-DD.md`

### 2. Duplicate/Overlapping Documents
- Multiple "day1" documents for Phase 1:
  - `day1-completion-report.md`
  - `day1-plan-a-completion.md`
  - `day1-plan-a-tasks.md`

### 3. Generic Names Without Context
- `session-log.md` (which session?)
- `refactoring-plan.md` (which phase?)

---

## Proposed Naming Convention

### Work Logs (Daily Execution Records)
**Format**: `work-log-phase{N}-day{N}-YYYY-MM-DD.md`

**Purpose**: Record of actual work completed each day

**Examples**:
- `work-log-phase1-day1-2025-11-10.md`
- `work-log-phase2-day5-2025-11-17.md`
- `work-log-phase3-day1-2025-11-20.md`

### Planning Documents
**Format**: `plan-phase{N}-{description}.md`

**Purpose**: Execution plans, roadmaps, task breakdowns

**Examples**:
- `plan-phase1-execution.md`
- `plan-phase1-7day-final.md`
- `plan-phase3-execution.md`

### Completion Reports
**Format**: `report-phase{N}-{scope}-completion.md`

**Purpose**: Summary reports after completing a phase or milestone

**Examples**:
- `report-phase1-completion.md`
- `report-phase2-completion.md`
- `report-phase1-day1-completion.md` (for daily summaries)

### Analysis Documents
**Format**: `analysis-{topic}-YYYY-MM-DD.md`

**Purpose**: Gap analysis, assessments, investigations

**Examples**:
- `analysis-phase1-2-gap-2025-11-20.md`
- `analysis-7day-intensive-2025-11-14.md`
- `analysis-branch-integration-2025-11-14.md`

### Session Logs
**Format**: `session-{topic}-YYYY-MM-DD.md`

**Purpose**: Meeting notes, decision logs, discussions

**Examples**:
- `session-decision-log-2025-11-12.md`
- `session-summary-2025-11-11.md`

---

## Reorganization Mapping

### ✅ Work Logs (Rename for Consistency)

| Current Name | New Name | Phase | Day |
|--------------|----------|-------|-----|
| `day1-completion-report.md` | `work-log-phase1-day1-2025-11-10.md` | P1 | D1 |
| `day2-completion-report.md` | `work-log-phase1-day2-2025-11-11.md` | P1 | D2 |
| `work-log-day5-2025-11-17.md` | `work-log-phase2-day5-2025-11-17.md` | P2 | D5 |
| `work-log-day6-2025-11-17.md` | `work-log-phase2-day6-2025-11-17.md` | P2 | D6 |
| `work-log-day7-2025-11-20.md` | `work-log-phase2-day7-2025-11-20.md` | P2 | D7 |
| ✅ `work-log-day1-phase3-2025-11-20.md` | (already correct - but reorder) → `work-log-phase3-day1-2025-11-20.md` | P3 | D1 |
| ✅ `work-log-day2-phase3-2025-11-20.md` | (already correct - but reorder) → `work-log-phase3-day2-2025-11-20.md` | P3 | D2 |

### ✅ Planning Documents (Rename for Clarity)

| Current Name | New Name | Notes |
|--------------|----------|-------|
| `phase1-execution-plan.md` | `plan-phase1-execution.md` | Main P1 plan |
| `phase1-final-7day-plan.md` | `plan-phase1-7day-final.md` | P1 revised 7-day plan |
| `phase1-revised-plan.md` | `plan-phase1-revised.md` | P1 revision |
| `day1-plan-a-tasks.md` | `plan-phase1-day1-tasks.md` | P1 D1 task breakdown |
| `day2-work-plan.md` | `plan-phase1-day2-work.md` | P1 D2 work plan |
| `day2-revised-plan.md` | `plan-phase1-day2-revised.md` | P1 D2 revised |
| `day3-work-plan.md` | `plan-phase1-day3-work.md` | P1 D3 work plan |
| `day4-integrated-plan.md` | `plan-phase1-day4-integrated.md` | P1 D4 integrated plan |
| `phase3-execution-plan.md` | `plan-phase3-execution.md` | Main P3 plan |
| `refactoring-plan.md` | `plan-phase1-refactoring.md` | P1 refactoring plan |
| `plan-a-execution.md` | `plan-phase1-plan-a-execution.md` | P1 Plan A execution |

### ✅ Completion Reports (Rename for Consistency)

| Current Name | New Name | Notes |
|--------------|----------|-------|
| `phase1-completion-report.md` | `report-phase1-completion.md` | P1 overall completion |
| `phase2-completion-report.md` | `report-phase2-completion.md` | P2 overall completion |
| `day1-plan-a-completion.md` | `report-phase1-day1-completion.md` | P1 D1 completion |
| `progress-summary-2025-11-17.md` | `report-progress-summary-2025-11-17.md` | Progress summary |

### ✅ Analysis Documents (Rename for Clarity)

| Current Name | New Name | Notes |
|--------------|----------|-------|
| `phase1-2-gap-analysis.md` | `analysis-phase1-2-gap-2025-11-20.md` | Gap between P1 and P2 |
| `intensive-7day-analysis.md` | `analysis-7day-intensive-2025-11-14.md` | 7-day intensive analysis |
| `branch-integration-analysis.md` | `analysis-branch-integration-2025-11-14.md` | Branch integration |
| `continuation-assessment-2025-11-13.md` | `analysis-continuation-2025-11-13.md` | Continuation assessment |
| `timeline-assessment-2025-11-12.md` | `analysis-timeline-2025-11-12.md` | Timeline assessment |

### ✅ Session Logs (Already Consistent)

| Current Name | New Name | Notes |
|--------------|----------|-------|
| `session-2025-11-11-summary.md` | `session-summary-2025-11-11.md` | Reorder date |
| `session-decision-log-2025-11-12.md` | ✅ (keep as is) | Already correct |
| `session-log.md` | `session-initial-planning-2025-11-10.md` | Add context & date |

---

## Files Needing Review

### Potential Duplicates/Merges
1. **Phase 1 Day 1 Records**:
   - `day1-completion-report.md` → Work log
   - `day1-plan-a-completion.md` → Could be merged into work log
   - `day1-plan-a-tasks.md` → Planning doc

**Decision**: Keep as separate files but rename for clarity

2. **Multiple Phase 1 Plans**:
   - `phase1-execution-plan.md` (main plan)
   - `phase1-final-7day-plan.md` (revised 7-day)
   - `phase1-revised-plan.md` (general revision)
   - `refactoring-plan.md` (refactoring specific)

**Decision**: Keep all - they represent evolution of planning

---

## Missing Work Logs

Based on the pattern, we should have work logs for:
- Phase 1: Day 1, Day 2, (Day 3?, Day 4?)
- Phase 2: Day 1?, Day 2?, Day 3?, Day 4?, Day 5 ✅, Day 6 ✅, Day 7 ✅
- Phase 3: Day 1 ✅, Day 2 ✅

**Note**: Earlier days may have completion reports instead of work logs.

---

## Execution Steps

### Step 1: Rename Work Logs (Priority 1)
```bash
# Phase 1
mv day1-completion-report.md work-log-phase1-day1-2025-11-10.md
mv day2-completion-report.md work-log-phase1-day2-2025-11-11.md

# Phase 2
mv work-log-day5-2025-11-17.md work-log-phase2-day5-2025-11-17.md
mv work-log-day6-2025-11-17.md work-log-phase2-day6-2025-11-17.md
mv work-log-day7-2025-11-20.md work-log-phase2-day7-2025-11-20.md

# Phase 3 (reorder naming)
mv work-log-day1-phase3-2025-11-20.md work-log-phase3-day1-2025-11-20.md
mv work-log-day2-phase3-2025-11-20.md work-log-phase3-day2-2025-11-20.md
```

### Step 2: Rename Planning Documents (Priority 2)
```bash
mv phase1-execution-plan.md plan-phase1-execution.md
mv phase1-final-7day-plan.md plan-phase1-7day-final.md
mv phase1-revised-plan.md plan-phase1-revised.md
mv day1-plan-a-tasks.md plan-phase1-day1-tasks.md
mv day2-work-plan.md plan-phase1-day2-work.md
mv day2-revised-plan.md plan-phase1-day2-revised.md
mv day3-work-plan.md plan-phase1-day3-work.md
mv day4-integrated-plan.md plan-phase1-day4-integrated.md
mv phase3-execution-plan.md plan-phase3-execution.md
mv refactoring-plan.md plan-phase1-refactoring.md
mv plan-a-execution.md plan-phase1-plan-a-execution.md
```

### Step 3: Rename Completion Reports (Priority 3)
```bash
mv phase1-completion-report.md report-phase1-completion.md
mv phase2-completion-report.md report-phase2-completion.md
mv day1-plan-a-completion.md report-phase1-day1-plan-a-completion.md
mv progress-summary-2025-11-17.md report-progress-summary-2025-11-17.md
```

### Step 4: Rename Analysis Documents (Priority 4)
```bash
mv phase1-2-gap-analysis.md analysis-phase1-2-gap-2025-11-20.md
mv intensive-7day-analysis.md analysis-7day-intensive-2025-11-14.md
mv branch-integration-analysis.md analysis-branch-integration-2025-11-14.md
mv continuation-assessment-2025-11-13.md analysis-continuation-2025-11-13.md
mv timeline-assessment-2025-11-12.md analysis-timeline-2025-11-12.md
```

### Step 5: Rename Session Logs (Priority 5)
```bash
mv session-2025-11-11-summary.md session-summary-2025-11-11.md
mv session-log.md session-initial-planning-2025-11-10.md
# session-decision-log-2025-11-12.md already correct
```

---

## Final Directory Structure (Organized View)

```
docs/code-audit/
├── Work Logs (Daily Records)
│   ├── work-log-phase1-day1-2025-11-10.md
│   ├── work-log-phase1-day2-2025-11-11.md
│   ├── work-log-phase2-day5-2025-11-17.md
│   ├── work-log-phase2-day6-2025-11-17.md
│   ├── work-log-phase2-day7-2025-11-20.md
│   ├── work-log-phase3-day1-2025-11-20.md
│   └── work-log-phase3-day2-2025-11-20.md
│
├── Planning Documents
│   ├── plan-phase1-execution.md
│   ├── plan-phase1-7day-final.md
│   ├── plan-phase1-revised.md
│   ├── plan-phase1-refactoring.md
│   ├── plan-phase1-plan-a-execution.md
│   ├── plan-phase1-day1-tasks.md
│   ├── plan-phase1-day2-work.md
│   ├── plan-phase1-day2-revised.md
│   ├── plan-phase1-day3-work.md
│   ├── plan-phase1-day4-integrated.md
│   └── plan-phase3-execution.md
│
├── Completion Reports
│   ├── report-phase1-completion.md
│   ├── report-phase1-day1-plan-a-completion.md
│   ├── report-phase2-completion.md
│   └── report-progress-summary-2025-11-17.md
│
├── Analysis Documents
│   ├── analysis-phase1-2-gap-2025-11-20.md
│   ├── analysis-7day-intensive-2025-11-14.md
│   ├── analysis-branch-integration-2025-11-14.md
│   ├── analysis-continuation-2025-11-13.md
│   └── analysis-timeline-2025-11-12.md
│
└── Session Logs
    ├── session-initial-planning-2025-11-10.md
    ├── session-summary-2025-11-11.md
    └── session-decision-log-2025-11-12.md
```

---

## Benefits of This Reorganization

1. **Consistent Naming**: All files follow clear, predictable patterns
2. **Easy Navigation**: Files grouped by type and chronologically ordered
3. **Phase Clarity**: Phase numbers clearly visible in all work logs
4. **Searchability**: Prefixes (work-log-, plan-, report-, analysis-, session-) enable easy filtering
5. **Maintainability**: Future additions follow established patterns

---

## Status

- [ ] Step 1: Rename Work Logs
- [ ] Step 2: Rename Planning Documents
- [ ] Step 3: Rename Completion Reports
- [ ] Step 4: Rename Analysis Documents
- [ ] Step 5: Rename Session Logs
- [ ] Verify all renames completed
- [ ] Update any internal references
- [ ] Commit changes to Git

---

**Last Updated**: 2025-11-20
**Created By**: Claude (芙莉蓮)
