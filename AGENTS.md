# AGENTS.md — AgentCal Development Rules

## Status Authority
This repository does not track progress status. Current milestone, status, and next action are maintained on the Notion project page:
https://app.notion.com/p/3b6eca0675e38046b68ee8f1675ad0b9

## Development Process Authority
All development process rules follow Avenxa Dev SOP as the sole authority. This file does not copy or restate them:
https://app.notion.com/p/3a4eca0675e380219c60d69b3352ab97

## Architecture at a Glance
- Mobile-first Next.js app (App Router, TypeScript, Tailwind), pnpm package manager.
- Core data model: a pure, side-effect-free calculation engine, independent of the UI. A "scenario" (SELL / BUY / MOVE) is a named, versioned assumption set that can be serialized and consumed as input by another scenario (MOVE consumes SELL's and BUY's structured output). Every result is stamped with the rate/rule version used.
- External dependencies: Supabase (if/when persistence is needed — not required for M1), Vercel (deploy), GitHub (avenxa/agentcal).
- Known hard constraints: BUY must never recommend a specific mortgage product, rate, term, or lender (BC Mortgage Services Act, in force 2026-10-13 — see Charter §4.2/§12/§15 on the Notion page). No AI-performed financial calculation — calculations are deterministic code only.
- Model usage policy: default model for routine build/scaffolding tasks; escalate to a stronger model for calculation-engine logic, financial rule accuracy, and anything touching the regulatory boundary in §15 — don't trial-run unverified frontier models on untested code paths without a reason.

## Decision Record
No dedicated Decision Log exists yet for this project. Decisions are currently tracked in the "Recent Decisions" section of the Notion project page (link above). Promote to a dedicated Decision Log only if that list grows past ~5 entries and older history needs to be archived out (per Avenxa Project Template usage rule 2) — don't build it speculatively before that's true.

## Product Definition
The full Charter (product scope, milestones, success criteria, regulatory notes) lives on the Notion project page above, §1–§16. This file does not duplicate it — read the Notion page for "what are we building and why."

## UI/UX Quality Floor (Avenxa Dev SOP Rule 7)
Every shipped feature meets: button hierarchy, spacing/control consistency, focus/hover states, correct at mobile width (this product is mobile-first), designed empty/error states. Checked on every feature, not re-litigated each time.

## Database Constraint Mirroring (Avenxa Dev SOP Rule 8)
If/when persistence is added: any "must not" validation (e.g. required fields, value ranges) must be mirrored at the database level, not just the app/form layer.

---

## Multi-Tool Support (LLM-agnostic)
This file is the single source. If a tool you use defaults to reading a different filename (e.g. some tools read `CLAUDE.md`, `.cursor/rules`), create a one-line redirect file for that tool in the repo root — do not copy the content:

See AGENTS.md for development rules.

---

## Tech Stack

- Framework: Next.js (TypeScript)
- Styling: Tailwind CSS
- Package manager: pnpm
- Backend / database: Supabase
- Hosting / deployment: Vercel
- Version control: GitHub (avenxa/agentcal)

Confirmed 2026-08-09 — see Decision Log for rationale. Do not duplicate decision
narrative here; this file only states the current stack for AI coding agents.