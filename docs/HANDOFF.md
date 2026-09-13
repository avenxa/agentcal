# AgentCal Technical Handoff — Current

## Protocol State / Command

**Hold Work** — AgentCal remains intentionally paused. No feature implementation is active.

Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490

## Authority

- Product Truth / AgentCal Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Active product-split decision: https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
- Approved UX/product planning reference: https://app.notion.com/p/3daeca0675e3817d9af9d2b66d047446
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490
- Repository entrypoint: `AGENTS.md`
- Completed SELL reference plan: `plans/features/01-sell-net-proceeds.md`

This file is the current durable repository handoff. The UX Rebaseline is planning authority only while AgentCal remains On Hold; it does not authorize implementation.

## Objective

Preserve AgentCal in **On Hold / Paused** state while keeping future product/UX direction restart-ready. The approved UX Rebaseline defines ten future priority capabilities but does not activate Feature 02, BUY, MOVE, UX implementation, schema/persistence work, or AgentCal ↔ AgentConsult integration.

## Completed

- SELL Feature 01 merged and accepted. Implementation merge commit: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- AgentCal / AgentConsult split aligned: **AgentCal = Calculate; AgentConsult = Clarify & Decide.**
- PR #4 (product-boundary documentation alignment) merged.
- PR #5 (stage closeout / hold-state documentation) merged.
- Current `main` at the last verified checkpoint is `6092b8d2cd38bc5818cdbab6d2bf1d6fcc93cca9`.
- The Product Owner approved a future UX/product planning record while keeping AgentCal On Hold: **AgentCal UX Rebaseline — 10 Priority Capabilities & Reactivation Plan**.

## Approved Future UX/Product Planning — Not Implementation

The reactivation-ready priority sequence is:

1. **Scenario-first Architecture**
2. **Progressive Input Flow**
3. **Hero Result First**
4. **Build / Results Mode**
5. **Contextual Next Actions**
6. **Completion / Readiness Status**
7. **Persistent `+ Add` Menu**
8. **Inline Recalculation**
9. **AI Gap Detection & Guidance**
10. **Client-ready Share / Report**

These items are future planning only. They must preserve deterministic calculation authority, transparent assumptions, and the AgentCal / AgentConsult boundary. They must not be used to expand AgentCal into CRM, full consultation workflow, transaction management, property search, social features, complex collaboration, or AI-generated authoritative financial amounts.

## Preserved Unfinished Execution Work

- A Feature 02 implementation candidate is preserved on remote branch `feature/02-tier2-export-share`, tip `25ffeea2e52b652b1345dc6c5978a328349c9d32`.
- That branch contains the Feature 02 Technical Plan, an Estimate Summary implementation, narration/handoff code, and tests. No PR was ever opened from it.
- Feature 02 is **not** simply "unstarted" — it has a substantive, preserved, unmerged candidate implementation.
- It must **not** be treated as accepted or production-ready.
- It must **not** be deleted or automatically merged.
- On resume, inspect and reconcile it against current Product Truth and the UX Rebaseline before deciding whether to review/finish, defer, redesign, or abandon it.

## Open / Deferred

1. **AgentCal remains On Hold.** No product implementation is authorized until the Product Owner issues `Resume Work`.
2. **Feature 02 acceptance/review/merge remains deferred.** The preserved candidate has not been independently accepted or merged.
3. **BUY is not implemented and has no currently authorized implementation plan.** No `lib/engine/buy.ts` exists on `main`.
4. **MOVE is not implemented.**
5. **UX Rebaseline implementation is not authorized.** The ten capabilities are future sequencing guidance only.
6. **AgentCal ↔ AgentConsult integration remains deferred.**
7. **Managing-broker / BC counsel review remains relevant** for client-facing disclaimer wording where applicable.

## Resume Sequence

A future agent must reconstruct state in this order:

1. Current AgentCal Hub Product Truth: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
2. `AGENTS.md`.
3. `docs/HANDOFF.md` (this file).
4. AgentCal UX Rebaseline: https://app.notion.com/p/3daeca0675e3817d9af9d2b66d047446
5. Actual `main`, branch, and PR state.
6. Inspect `feature/02-tier2-export-share` at the preserved tip.
7. Inspect current tests/runtime evidence.
8. Reconcile the UX Rebaseline with current Product Truth and preserved Feature 02 work.
9. Reopen the Product Owner sequencing decision: finish/review Feature 02, formally defer Feature 02 and authorize BUY, or approve a separately bounded UX-foundation objective that does not violate engine sequencing.
10. Only then create or refresh a bounded Technical Plan and Builder handoff.

## Verified

Documentation-state inspection for this sync confirmed:

- live `main` resolved to `6092b8d2cd38bc5818cdbab6d2bf1d6fcc93cca9` before this documentation branch was created;
- that commit is PR #5's merged stage-closeout checkpoint;
- AgentCal Hub Product Truth records Status = **On Hold** and Lifecycle = **Paused**;
- the UX Rebaseline exists in the AgentCal Hub as a planning-only record and explicitly retains the On Hold gate;
- the preserved Feature 02 branch remains the known unfinished execution candidate at `25ffeea2e52b652b1345dc6c5978a328349c9d32`;
- this documentation sync changes repository guidance only; no application code, financial logic, package configuration, schema, BUY/MOVE implementation, or runtime behavior is intentionally changed.

No application test rerun is claimed for this documentation-only sync.

## Next

**None while AgentCal remains paused.** Product/UX documentation may be refined only when explicitly requested by the Product Owner. The first future implementation action is `Resume Work` and reconstruction, not coding.

## Authority / Gate

- A future agent may read Product Truth, `AGENTS.md`, this handoff, the UX Rebaseline, and repository/branch state autonomously.
- A future agent may perform Product Owner-requested planning/documentation refinement without treating that as product reactivation.
- A future agent may **not** merge or delete `feature/02-tier2-export-share`, start Feature 02 continuation, BUY/MOVE work, implement the UX Rebaseline, create a new feature Technical Plan, or begin AgentCal ↔ AgentConsult integration until the Product Owner issues `Resume Work` and resolves the relevant sequencing Human Gate.
- Authoritative formulas, rounding, disclosures, privacy/data handling, jurisdiction/locale boundaries, and AgentCal/AgentConsult ownership remain Human Gates.

## Stop / Escalation Conditions

Stop and escalate if:

- Product Truth and repository state materially conflict;
- UX simplification would hide material assumptions or weaken deterministic calculation authority;
- work would alter authoritative formulas, rounding, jurisdiction, disclosures, or privacy boundaries without approval;
- work would blur the AgentCal / AgentConsult responsibility boundary;
- a feature implementation is requested before `Resume Work`, reconstruction, and sequencing are resolved;
- a consequential merge/release or other Human Gate is reached.
