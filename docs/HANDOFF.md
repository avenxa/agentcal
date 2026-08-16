# AgentCal Technical Handoff

## Completed
- ADS migration Steps 1–4 are complete and merged to `main`.
- WT approved Feature 01 interaction direction **A — Guided Topic Rail with Living Statement elements**.
- WT subsequently accepted the visual direction with an explicit tablet/laptop spacing refinement.
- Feature 01 UI/interaction Product Truth was re-frozen on 2026-08-16.
- Repository reality was re-checked after re-freeze: `main` still contains the default Next.js shell, no SELL UI, no automated test runner, and no browser/E2E harness.
- The execution-document update from `agent/feature01-refreeze-plan` was merged to `main` via PR #2 on 2026-08-16.

## Changed
- `AGENTS.md` records the active re-frozen Guided Topic Rail / Living Statement contract, Brand Kit v1.0 authority for current UI implementation, the required tablet/laptop breathing-room/runtime-verification intent, and the durable single-editor rule for orchestrator/reviewer + coding-agent workflows.
- `plans/features/01-sell-net-proceeds.md` treats the product-design gate as closed, maps the approved responsive interaction into technical implementation/verification work, and makes the verification harness the first implementation prerequisite.
- `docs/HANDOFF.md` reflects the current post-re-freeze execution state and the current Claude → Cursor implementation arrangement.

## Verified
Current remote repository reality on 2026-08-16:
- default branch: `main`;
- `app/page.tsx` remains the default create-next-app screen;
- `package.json` has `dev`, `build`, `start`, and `lint` scripts only;
- no automated test runner or browser/E2E harness is configured;
- `lucide-react` is not installed;
- no Feature 01 SELL implementation is present on `main`;
- no persistence/schema work exists for M1.

Product Truth verification:
- Feature 01 Product Spec states the UI/interaction contract is re-frozen for implementation on 2026-08-16;
- current interaction is Guided Topic Rail with Living Statement elements;
- current visual authority is AgentCal Brand Kit v1.0, not superseded v3.3 Geist/navy/gold rules;
- Product Truth includes explicit tablet/laptop breathing-room requirements;
- the accepted Figma spacing refinement was written successfully.

Design evidence caveat:
- the spacing refinement was applied in Figma;
- the final laptop screenshot re-check could not be completed in the same session because the Figma Starter MCP limit was reached;
- therefore 1366px runtime/browser verification remains required before product acceptance.

No application code, dependency, lockfile, package script, schema, or calculation implementation has been changed in this handoff update.

## Open
- **Local working-tree safety check:** Cursor must verify `git status`, current branch, recent commits, uncommitted/unpushed work, and that no other coding agent is editing the same working tree before making implementation changes.
- **Verification prerequisite:** configure a minimal executable automated test runner compatible with the existing TypeScript/Next.js stack.
- **Browser/runtime verification:** add the minimum capability needed to prove required responsive/accessibility behaviour, including 320/390 phone, 768/834 tablet, and 1280/1366 laptop/desktop.
- **Runtime wide-layout evidence:** confirm the approved tablet/laptop spacing and persistent Living Statement do not crowd editing/material assumptions.
- **M1 dependency:** Tier-2 export/share estimate artifact remains separately required before M1 closure.
- **Compliance gate:** managing-broker / BC counsel review remains required before real-client use.

## Current Tool Arrangement
- **Claude:** orchestration and independent review for the current bounded Feature 01 implementation cycle. Claude may read Product Truth, issue bounded implementation instructions, review repository evidence/diffs, and identify WT gates. Claude must not edit the same working tree while Cursor is the active coding agent.
- **Cursor:** sole coding agent/editor of the active AgentCal working tree for this bounded cycle. Cursor owns repository inspection, implementation, verification, self-correction, and technical handoff updates until it explicitly stops editing and hands control back.

## Next
1. Cursor starts from the actual local AgentCal working tree and verifies `git status`, current branch, recent commits, uncommitted/unpushed work, and concurrent-agent state before editing.
2. Cursor re-reads Product Truth + `AGENTS.md` + the active Technical Plan + this handoff.
3. Configure the executable verification harness before treating Feature 01 implementation as acceptance-ready.
4. Implement the deterministic calculation layer and re-frozen UI within the approved boundary.
5. Run automated, build, accessibility, and responsive runtime verification; capture evidence for the required states/widths.
6. Cursor updates this handoff with actual implementation/verification evidence and explicitly hands control back for independent review.
7. Claude performs independent review of the actual diff and evidence.
8. Obtain WT final product acceptance before merge/release when required by ADS.

## Stop / Escalation Conditions
Stop the affected work if Product Truth conflicts with repository reality, scope materially expands, another coding agent is editing the same working tree, required verification cannot run, or a consequential architecture/security/privacy/data/compliance/cost decision is unresolved. Claude and Cursor must not edit the same working tree concurrently. Do not perform destructive or production-sensitive actions without explicit authority.