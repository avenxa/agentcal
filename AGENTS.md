# AGENTS.md — AgentCal

## Mission
AgentCal is a mobile-first financial consultation calculator suite for BC real-estate agents. The product is staged as SELL → BUY → MOVE; current implementation work is limited to M1 — SELL. Financial amounts are produced only by deterministic application code.

## Authority
- Product Truth: AgentCal Hub — https://app.notion.com/p/3b6eca0675e38046b68ee8f1675ad0b9
- Development process authority: Avenxa Agentic Development System — https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Execution Truth: this repository — code, configuration, technical decisions, active Technical Plan, tests, verification commands, Git history, and technical handoff.
- Runtime Evidence: preview/deployed behaviour when a runtime exists for the bounded task.

If Product Truth and repository reality materially conflict, stop the affected action and surface the conflict before changing product behaviour.

## Current Execution
- Active Technical Plan: `plans/features/01-sell-net-proceeds.md`
- Technical handoff: `docs/HANDOFF.md`
- Architecture: current code plus the active Technical Plan; no separate architecture document is required yet. Pure calculation logic lives under `lib/engine/`; `app/` owns presentation and must import from `lib/engine/`, never the reverse.
- Technical decisions: code/config/Git history unless a durable repository decision record is added for a real need.

Do not record product milestone/status, product priorities, or product decision history here. Those belong in the AgentCal Hub and linked Product Truth.

## Non-Negotiable Constraints
- AI must not calculate or alter financial amounts; calculation logic is deterministic application code.
- Scenario, Jurisdiction, and Locale remain separable. Current configured values are `CA-BC` and `en-CA`; locale must never change calculation cents.
- Feature 01 calculation inputs are session-only and must not be persisted or transmitted.
- BUY must not recommend or steer toward a particular mortgage product, rate, term, or lender.
- Feature 01 UI/interaction Product Truth was re-frozen on 2026-08-16. Implement the approved **Guided Topic Rail with Living Statement elements** and AgentCal Brand Kit v1.0; do not revive superseded v3.3 Geist/navy/gold presentation rules.
- Preserve the approved responsive breathing-room intent, especially on tablet and laptop/desktop. Runtime evidence must confirm the relevant Product Spec acceptance widths before product acceptance.

## Repository Map
- `app/` — Next.js App Router presentation and interaction.
- `lib/engine/` — pure calculation logic for every scenario (SELL now; BUY/MOVE later). Nothing here may import React, DOM, browser storage, or Supabase.
- `lib/` — non-engine shared modules that stay outside `app/`: consultation UI-state helpers and presentation copy.
- `e2e/` — Playwright browser checks for the Feature 01 consultation UI.
- `plans/features/01-sell-net-proceeds.md` — active bounded Technical Plan for Feature 01.
- `docs/HANDOFF.md` — current technical continuity checkpoint.
- `package.json` — installed dependencies and executable scripts.
- `CLAUDE.md` — redirect to this file.

## Calculation Engine Module Convention
Pure calculation logic for every scenario (SELL / BUY / MOVE) lives under
`lib/engine/`, never directly under `lib/` and never inside `app/`:
- `lib/engine/sell.ts` — SELL functions (e.g. `calculateSellerNetProceeds()`) plus
  its input/result types.
- Shared money-as-cents helpers currently live in `lib/engine/currency.ts`.
  A dedicated `lib/engine/types.ts` is deferred until a second scenario needs
  shared cross-scenario types (rule-version stamp, assumption-set shape).
- BUY and MOVE add `lib/engine/buy.ts` and `lib/engine/move.ts` on the same
  pattern when their milestones start. MOVE imports SELL's and BUY's
  exported result types as its own input rather than recomputing their
  logic.
- Nothing under `lib/engine/` may import React, DOM, browser-storage, or
  Supabase APIs. UI components import from `lib/engine/`, never the
  reverse.
This makes the Charter §6/§7 engine-separation principle concrete for
Feature 01 and every scenario after it, without changing Feature 01's
approved scope, fields, or calculation formulas.

## Canonical Commands
Install:   `pnpm install --frozen-lockfile`
Dev:       `pnpm dev`
Lint:      `pnpm lint`
Typecheck: `pnpm type-check`
Test:      `pnpm test`
E2E/UI:    `pnpm test:e2e`
Build:     `pnpm build`
Schema:    N/A — M1 has no persistence/schema work.

Run additional checks required by the active Technical Plan. Do not claim a missing check passed.

## Execution Rules
1. Work on one bounded objective at a time and keep unrelated edits out.
2. Inspect actual repository state before assuming a dependency, component, test harness, schema, or prior feature exists.
3. Confirm Product Truth acceptance and applicable human gates before meaningful implementation.
4. Build → verify → diagnose → fix → re-verify before reporting completion.
5. A required failing or unavailable check remains unresolved until fixed or explicitly escalated.
6. Update tests and durable technical documentation when implementation changes their truth.
7. Consequential work requires independent review of the actual diff and evidence; the builder is not the sole reviewer.
8. Never store secrets or credentials in committed files or documentation.
9. Stop the affected action if instructions conflict, scope materially expands, another coding agent is editing the same working tree, required verification cannot run, or a consequential human gate is reached.
10. When one AI/tool is acting as orchestrator or independent reviewer and another is the active coding agent, the coding agent is the sole editor of that working tree for the bounded cycle. The orchestrator/reviewer may issue bounded instructions and inspect repository evidence, but must not edit the same working tree concurrently. Editing authority transfers only through an explicit handoff after the active coding agent stops editing.

## Human Gates
Human approval is required for:
- product scope or acceptance changes;
- changes to the re-frozen Feature 01 formulas, rounding, disclosures, interaction direction, visual hierarchy, privacy/data handling, or jurisdiction/locale boundary;
- consequential architecture, security, privacy, compliance, or data-model decisions;
- new material external services or paid commitments;
- production data mutation, destructive operations, or production schema migration;
- final product acceptance and any merge/release gate required by ADS/project policy.

Routine reversible implementation mechanics inside the approved boundary — including compatible test-runner selection and ordinary UI implementation details — do not require repeated approval.

## Definition of Done
A bounded task is complete only when intended scope is implemented, required verification passes, self-correction is complete, independent review/runtime evidence exists where required, applicable human gates are satisfied, and `docs/HANDOFF.md` is current.

## Handoff
Before stopping after meaningful work, update `docs/HANDOFF.md` with current Completed / Changed / Verified / Open / Next state. Keep it current rather than appending chat transcripts or competing status documents.

## Tool-Specific Instructions
`AGENTS.md` is the common cross-agent repository authority. Tool-specific files should only redirect here or contain genuinely tool-specific scoped instructions; do not maintain duplicate full rule sets.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
