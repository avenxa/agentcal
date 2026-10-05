# AgentCal Technical Handoff — Current

## Protocol State / Command

**Human Gate — Design Approved** — Definition Ready was approved; User Flow / IA and Figma Design Truth are complete. No implementation is authorized until Product Owner approval.

## Objective

Approve the completed **SELL Scenario Foundation v1** Design Truth before Technical Definition / Builder work.

## Product Truth

- Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Current Project Checkpoint: https://app.notion.com/p/3f0eca0675e381c5992bf73ff76e5a15
- Current Design Definition: https://app.notion.com/p/3f0eca0675e3818ea370de8257f8523e
- Project Instructions: https://app.notion.com/p/3daeca0675e381c4b7c3cbb1cc527a36
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08

## Completed

- Product Owner authorized AgentCal reactivation and proactive ADS progression until Human Gate.
- Notion portfolio status changed from Closed to Building / In Progress / On Track.
- Prior Superseded / Closed direction retired from Product Truth.
- Project Instructions refreshed to current ADS.
- SELL Scenario Foundation v1 Design Definition created.
- Existing repository and Vercel project retained; no project infrastructure recreated.

## Execution Truth

- Repository: https://github.com/avenxa/agentcal
- Reactivation baseline before governance sync: `d566e24621fa63000589676dfe429960cc4d5acd`.
- Accepted SELL Feature 01 merge: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- Production URL: https://agentcal-five.vercel.app/
- Production deployment was verified READY from reactivation baseline `d566e246...`.
- No open PRs were found at reactivation review.
- Preserved Feature 02 branch: `feature/02-tier2-export-share` at `25ffeea2e52b652b1345dc6c5978a328349c9d32`; preserved, unfinished, unaccepted.
- At review time Feature 02 was 4 commits ahead and 20 commits behind the then-current main.

## Scope Now

In scope:
- SELL Scenario identity/lifecycle.
- Progressive essential vs optional SELL inputs.
- Hero Result hierarchy.
- Build / Results responsibilities.
- deterministic recalculation.
- readiness/completeness.
- save/reopen product contract.
- jurisdiction/rule-version provenance.
- mobile-first states and accessibility requirements.

Out of scope:
- BUY.
- MOVE.
- Feature 02 continuation/merge.
- runtime AI guidance.
- CRM / AgentConsult workflow.
- second jurisdiction.
- formula or rounding changes.
- premature persistence/auth implementation.

## Verification State

Verified during reactivation:
- actual repository branch state;
- Feature 02 branch preservation;
- no open PRs;
- Vercel production deployment READY and sourced from the reactivation baseline main commit.

Not re-run in this documentation/definition cycle:
- local lint;
- type-check;
- unit tests;
- Playwright E2E.

Historical test evidence remains history only and must be rerun by Builder when implementation begins.

## Human Gate Status

**HUMAN GATE: Design Approved.**

Definition Ready was approved. Design Truth is complete and has passed the current visual QA scope. Implementation remains blocked until Product Owner approval.

## Design Evidence

- User Flow / IA: https://app.notion.com/p/3f0eca0675e3810abbfbd12dcd4db1bc
- Figma Design Truth: https://www.figma.com/design/5MQ4tslEDHs26UTTbV0JBg
- Frames: Mobile Build, Mobile Results, Desktop Build, Desktop Results, exception / continuity states.
- QA: desktop composition passed; mobile header clipping was detected and corrected; final mobile recheck passed.

## ONE NEXT ACTION

**HUMAN GATE: Design Approved — approve or reject the current Figma Design Truth.**

If approved, continue automatically to Technical Definition → Builder handoff → implementation / verification under ADS.

## Stop / Escalation Conditions

Stop if:
- Product Truth conflicts with accepted SELL calculation behavior;
- scope expands into BUY/MOVE/Feature 02/CRM/runtime AI;
- authoritative formulas, rounding, jurisdiction rules or disclosures would change;
- persistence/auth choice becomes a consequential architecture decision before Design approval;
- a destructive production/data action or release boundary is reached.
