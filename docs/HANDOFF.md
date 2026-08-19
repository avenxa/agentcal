# AgentCal Technical Handoff

## Completed
Cursor moved Feature 01 calculation modules under `lib/engine/` on `feature/01-sell-net-proceeds-v2` at `C:\dev\agentcal-v2`. `C:\dev\agentcal` was not edited. This is a file-location / import-path / `AGENTS.md` sync only — no calculation, rounding, field-contract, or UI behaviour change. Work remains uncommitted (same uncommitted cycle as Items A/B/C and the sticky-bar inset fix).

This closes the Product-Truth-vs-Execution-Truth gap from Decision Log 2026-08-10 (“Lock calculation-engine module location: `lib/engine/`, ahead of Feature 01 implementation”). That convention was committed as `a46dc86` on the unmerged `feature/01-sell-net-proceeds` branch and was missing from this `-v2` worktree because `-v2` branched from `main`.

## File-location fix (this round)

Confirmed before the move: `lib/` contained seven modules and none imported React, DOM, browser storage, or Supabase.

### Moved into `lib/engine/`

| Before | After |
| --- | --- |
| `lib/sell-calculator.ts` | `lib/engine/sell.ts` |
| `lib/sell-calculator.test.ts` | `lib/engine/sell.test.ts` |
| `lib/sell-bc-rules.ts` | `lib/engine/sell-bc-rules.ts` |
| `lib/currency.ts` | `lib/engine/currency.ts` |
| `lib/sell-calculator-form.ts` | `lib/engine/sell-calculator-form.ts` |

### Left in `lib/` (not engine)

| Path | Why |
| --- | --- |
| `lib/sell-copy.ts` | UI-facing string constants (disclaimer, errors, commission labels). Not calculation logic. |
| `lib/sell-consultation.ts` | Topic-rail IDs/labels, consultation navigation state, display summaries. Interaction/presentation helper; it now imports from `lib/engine/`. |

### Naming: `lib/engine/sell.ts`

Used the Decision Log’s literal example `lib/engine/sell.ts` rather than `lib/engine/sell-calculator.ts`. No strong reason to keep the longer name: this is the SELL scenario entry module (`calculateSellerNetProceeds` plus input/result types), and BUY/MOVE are specified as `lib/engine/buy.ts` / `lib/engine/move.ts`. The unit test moved with the subject to `lib/engine/sell.test.ts`.

Did **not** create `lib/engine/types.ts`. Shared cross-scenario types do not exist yet; money helpers stay in `lib/engine/currency.ts` until a second scenario needs a shared types module.

`currency.ts` is mixed (parse/round plus `en-CA` formatters). It moved with the engine because splitting parse vs format would be more than a location fix, and nothing under `lib/engine/` imports React/DOM/storage/Supabase.

### Import / script updates
- `app/currency-field.tsx`, `app/seller-net-proceeds.tsx`, `app/view-calculation.tsx` now import engine modules from `../lib/engine/…`.
- `e2e/sell-consultation.spec.ts` had no `lib/` imports.
- `package.json` `"test"` is now `node --test lib/engine/sell.test.ts`.
- Relative imports inside moved files updated (`./sell.ts`; consultation tests import `../sell-consultation.ts`).

### `AGENTS.md`
Now documents the `lib/engine/` convention (brought forward from `a46dc86` / Decision Log Impact, adapted to this worktree’s current `AGENTS.md` structure and the actual export name `calculateSellerNetProceeds`). Repository Map distinguishes `lib/engine/` from remaining non-engine `lib/` modules.

## Changed
- New `lib/engine/` tree as listed above; old `lib/sell-calculator*.ts`, `lib/sell-bc-rules.ts`, `lib/currency.ts`, `lib/sell-calculator-form.ts` removed.
- `app/currency-field.tsx`, `app/seller-net-proceeds.tsx`, `app/view-calculation.tsx` — import paths only.
- `lib/sell-consultation.ts` — import paths only.
- `package.json` — test script path.
- `AGENTS.md` — architecture line, repository map, Calculation Engine Module Convention section.

Prior uncommitted UI work (Items A/B/C, sticky-bar inset) is unchanged by this round.

## Verified
Exact commands in `C:\dev\agentcal-v2` on 2026-08-19:

1. `node --test lib/engine/sell.test.ts` — **26 passed**, 0 failed.
2. `pnpm test` (same script) — **26 passed**, 0 failed.
3. `pnpm lint` — success (exit 0).
4. `pnpm type-check` — success (exit 0).
5. `pnpm build` — success (Next.js 16.3.0). Routes: `/`, `/_not-found`.
6. `pnpm test:e2e` — **19 passed**, 0 failed.
7. Repo grep for leftover `lib/sell-calculator`, `lib/currency`, `lib/sell-bc-rules`, `lib/sell-calculator-form` paths — only the previous handoff’s old test command remained, now replaced by this file. `lib/sell-copy` and `lib/sell-consultation` references are intentional.

## Open
- Work is **uncommitted and unpushed**. Commit/push/PR remain human gates. Commit sequencing is being planned separately.
- Claude independent review of this location/import diff (and the still-uncommitted Items A/B/C + sticky-bar inset) is required next.
- `C:\dev\agentcal` remains on dirty `feature/01-sell-net-proceeds` with stale v3.3 UI WIP. Reviewers must inspect `C:\dev\agentcal-v2` / `feature/01-sell-net-proceeds-v2`.
- M1 still requires the separate Tier-2 export/share artifact.
- Managing-broker / BC counsel disclaimer review remains required before real-client use.

## Current Tool Arrangement
Cursor has **stopped editing**. Control is handed back to Claude for independent review of the actual diff and evidence. Do not have Claude and Cursor edit the same working tree concurrently.

## Next
1. Claude independently reviews this `lib/engine/` location/import/`AGENTS.md` sync on `feature/01-sell-net-proceeds-v2` at `C:\dev\agentcal-v2`.
2. Human gate: commit, push, and PR when WT wants the work recorded remotely (sequencing planned separately).

## Stop / Escalation Conditions
Stop if Product Truth conflicts with this implementation, another coding agent starts editing `C:\dev\agentcal-v2` or `C:\dev\agentcal`, or a merge/release is requested without WT acceptance.
