# AgentCal Technical Handoff

## Completed
- ADS migration Steps 1–3 were completed in Product Truth: AgentCal Hub cleanup, Charter authority cleanup, and Feature 01 process-authority cleanup.
- Repository reality inspection confirmed `main` still contains the default Next.js app shell and no implemented SELL calculator UI.
- Step 4 remediation aligned repository routing with ADS on branch `agent/ads-step4-remediation`.

## Changed
- `AGENTS.md` now points to the Avenxa Agentic Development System, separates Product Truth from repository Execution Truth, identifies the active Technical Plan/handoff, and records the current Feature 01 UI gate.
- `PROJECT_BRIEFING.md` is now a lightweight routing document to AgentCal Product Truth, ADS, `AGENTS.md`, the active Technical Plan, and this handoff.
- `plans/features/01-sell-net-proceeds.md` is now a bounded repository Technical Plan rather than a duplicate Product Spec.
- `docs/HANDOFF.md` now exists as the durable current technical checkpoint.

## Verified
Repository inspection before remediation established:
- default branch: `main`;
- `main` head before remediation: `1de454847d51b27a335fcdf40eab541635b03af2`;
- `app/page.tsx` is still the default create-next-app screen;
- `package.json` has `dev`, `build`, `start`, and `lint` scripts only;
- no automated test runner or E2E/UI harness is configured;
- no Feature 01 SELL implementation was found on `main`;
- no open PR existed at inspection time.

Step 4 remediation branch verification:
- comparison against `main` shows only `AGENTS.md`, `PROJECT_BRIEFING.md`, `plans/features/01-sell-net-proceeds.md`, and `docs/HANDOFF.md` changed;
- no application code, dependency, lockfile, package script, schema, or production state changed;
- `AGENTS.md`, the active Technical Plan, and this handoff were re-read from the remediation branch after writing and match the intended ADS routing/gate boundary;
- no product calculation, field, formula, rounding, UX acceptance, or Product Truth content was changed in the repository.

## Open
- **Product blocker:** Feature 01 UI implementation remains paused until WT approves the revised consultation-first responsive interaction direction and the affected Feature 01 UI/interaction Product Truth is re-frozen.
- **Verification gap:** automated tests are not configured yet. The later implementation cycle must add a minimal executable harness that covers calculation, boundary, rounding, and required UI-state behaviour.
- **Design dependency:** older Feature 01 visual rules may conflict with AgentCal Brand Kit v1.0; affected Product Truth must be resolved before UI coding resumes.
- **M1 dependency:** the Tier-2 export/share estimate artifact remains separately required before M1 closure and is not part of the current calculator Technical Plan.

## Next
1. Complete ADS Step 5 fresh-agent validation against the AgentCal Hub + remediated repository context.
2. Do not resume Feature 01 UI coding until the Product Truth interaction-direction gate is closed.
3. Once that gate closes, re-inspect repository reality, update the active Technical Plan only as needed, configure the verification harness, then implement and verify Feature 01 within the approved boundary.

## Stop / Escalation Conditions
Stop the affected work if Product Truth conflicts with repository reality, scope materially expands, another coding agent is editing the same working tree, required verification cannot run, or a consequential architecture/security/privacy/data/compliance/cost decision is unresolved. Do not perform destructive or production-sensitive actions without explicit authority.