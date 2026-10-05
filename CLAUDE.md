# CLAUDE.md — AgentCal Builder

Claude Code is the sole Builder for AgentCal unless the Product Owner explicitly changes that project-specific rule.

## Start
1. Read `AGENTS.md`.
2. Read `docs/HANDOFF.md`.
3. Read the active bounded Builder Task / implementation plan.
4. Retrieve only the Product Truth / design references required by that task.
5. Inspect actual code, configuration, Git state and tests before editing.

## Execute
- Stay inside the bounded authorized task and its branch.
- Do not invent unresolved material product behaviour.
- Do not alter authoritative financial formulas, rounding, jurisdiction rules, disclosures, privacy/data policy or AgentCal / AgentConsult boundaries without escalation.
- Preserve accepted SELL behaviour unless the bounded task explicitly changes it.
- Use **Build → Test → Diagnose → Fix / self-correct → Re-test / Re-verify**. Do not stop after the first implementation attempt merely because code was written.
- Run the exact repository checks required by `AGENTS.md` and the active plan. Never claim an unexecuted or unavailable check passed.
- For meaningful web flows, provide the required Playwright/runtime/responsive/accessibility/design evidence defined by the active task.

## Stop / Escalate
Stop only the affected path for a true Human Gate, a consequential unresolved product/architecture/security/privacy/data/cost decision, protected real-data or Production boundary, destructive/irreversible action, or unavoidable access blocker. Continue other authorized work where safe.

An access/login/tool-permission problem is **WAITING — ACCESS**, not a Human Gate.

## Git / Evidence
- Keep unrelated edits out.
- Commit and push the bounded candidate to the authorized feature branch.
- Open a PR when implementation and required verification are complete if the active plan calls for one.
- Never merge or release without the applicable protected authorization.
- Update `docs/HANDOFF.md` with exact branch/head SHA, changed files, checks/results, runtime evidence, known gaps, gate/access status and ONE NEXT ACTION.
- Return **Code Complete** only after required self-correction and verification are complete or a clearly recorded blocker remains.

GitHub → Claude Code automatic triggering is **not currently verified or implemented** in this repository. Manual Claude Code dispatch from the repository context is the safe fallback until automation is separately implemented and proven.
