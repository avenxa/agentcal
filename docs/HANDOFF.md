# AgentCal Technical Handoff — Current

## Protocol State / Command

**Hold Work** — AgentCal is intentionally paused after the current SELL milestone and governance alignment. No feature implementation is active.

Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490

## Authority

- Product Truth / AgentCal Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Active product-split decision: https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490
- Repository entrypoint: `AGENTS.md`
- Completed SELL reference plan: `plans/features/01-sell-net-proceeds.md`

This file is the current durable repository handoff.

## Objective

AgentCal is intentionally paused after the current SELL milestone and governance alignment. No feature implementation is active. AgentCal Status = On Hold; Lifecycle = Paused (per current AgentCal Hub Product Truth, 2026-09-11).

## Completed

- SELL Feature 01 merged and accepted. Merge commit: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- AgentCal / AgentConsult split aligned: **AgentCal = Calculate; AgentConsult = Clarify & Decide.**
- PR #4 (documentation alignment) merged.
- `main` is at `1743207ad6705dc97d01b71affa342e2139d92d7`.
- There are currently no open PRs.

## Preserved Unfinished Execution Work

- A Feature 02 implementation candidate is preserved on remote branch `feature/02-tier2-export-share`, tip `25ffeea2e52b652b1345dc6c5978a328349c9d32`.
- That branch contains the Feature 02 Technical Plan, an Estimate Summary implementation, narration/handoff code, and tests. No PR was ever opened from it.
- Feature 02 is **not** simply "unstarted" — it has a substantive, preserved, unmerged candidate implementation.
- It must **not** be treated as accepted or production-ready.
- It must **not** be deleted or automatically merged.
- On resume, inspect and reconcile it against current Product Truth before deciding whether to review/finish or abandon it.

## Open / Deferred

1. **Feature 02 acceptance/review/merge remains deferred.** The preserved candidate on `feature/02-tier2-export-share` has not been independently accepted or merged.
2. **BUY is not implemented and has no currently authorized implementation plan.** No `lib/engine/buy.ts` exists on `main`.
3. **MOVE is not implemented.**
4. **AgentCal ↔ AgentConsult integration remains deferred.**
5. **Managing-broker / BC counsel review remains relevant** for client-facing disclaimer wording where applicable.

## Resume Sequence

A future agent must reconstruct state in this order:

1. Current AgentCal Hub Product Truth: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
2. `AGENTS.md`.
3. `docs/HANDOFF.md` (this file).
4. Actual `main`, branch, and PR state.
5. Inspect `feature/02-tier2-export-share` at the preserved tip.
6. Inspect current tests/runtime evidence.
7. Reopen the Product Owner sequencing decision: finish/review Feature 02 vs. formally defer Feature 02 and authorize BUY.
8. Only then create or refresh a bounded Technical Plan and Builder handoff.

## Verified

Repository inspection on 2026-09-12 (documentation-only closeout) confirmed:

- `main` and this branch both resolve to `1743207ad6705dc97d01b71affa342e2139d92d7`.
- No open PRs exist.
- `feature/02-tier2-export-share` exists on the remote at tip `25ffeea2e52b652b1345dc6c5978a328349c9d32` and was neither merged nor deleted.
- `git status` reported a clean working tree aside from this documentation edit; no `app/`, `lib/`, `e2e/`, test, or package files were changed.

No application test rerun was performed for this documentation-only closeout; no product code changed, so no new runtime evidence is claimed.

## Next

None while AgentCal remains paused. The first future action is **Resume Work**, not implementation.

## Authority / Gate

- A future agent may read Product Truth, `AGENTS.md`, this handoff, and repository/branch state autonomously.
- A future agent may **not** merge or delete `feature/02-tier2-export-share`, start BUY/MOVE implementation, or create a new feature Technical Plan without the Product Owner first resolving the Feature 02 vs. BUY sequencing decision (Human Gate).

## Stop / Escalation Conditions

Stop and escalate if:

- Product Truth and repository state materially conflict;
- work would alter authoritative formulas, rounding, jurisdiction, disclosures, or privacy boundaries without approval;
- work would blur the AgentCal / AgentConsult responsibility boundary;
- a feature implementation is requested before the current sequencing gate and bounded plan are resolved;
- a consequential merge/release or other Human Gate is reached.
