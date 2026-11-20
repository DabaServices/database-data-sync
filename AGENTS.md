# database-data-sync Guidelines

Node 24 + TypeScript CronJob (pg, zod, Vitest, pnpm) that copies selected production PostgreSQL tables into pre-prod and non-prod. Conventions and knowledge load lazily as described below.

## Workflow

- **Skills framework (required):** read the `using-superpowers` skill once per session (not once per task) through your agent's skill mechanism, then load only the skills the task tier below calls for. If it is unavailable, stop and tell the user. These rules take precedence over skill instructions.
- **Lean implementation** (during implementation only): reuse existing code, conventions, and `knowledge/` before adding code; keep diffs and replies short. It never licenses skipping a regression test, trust-boundary validation, security, accessibility, or any part of an approved plan.
- Do not fix unrelated failures, overwrite user changes, or reset/revert changes you did not make.
- Verify before claiming success; report baseline failures and unverified checks.
- Commit only when asked, and inspect staged paths first.

### Task tiers

Classify the task in one line before starting; the user can override. When unsure, pick the heavier tier. If a task grows (new dependency, contract change, new subsystem), stop and reclassify.

| Tier       | Scope                                                                    | Process                                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Light**  | Typos, docs, config, single-file fix with an obvious cause               | State intent in a sentence, implement. No brainstorming, spec, or plan.                                                                                                                      |
| **Medium** | Bounded change to an existing flow; no new dependency or routing rewrite | No brainstorming. Present a short design in chat (approach, files, tests); wait for an explicit yes. No spec or plan files.                                                                  |
| **Full**   | New subsystem, architectural change, new data contract, broad refactor   | brainstorming → spec → **Gate 1** (user approves design) → writing-plans → **Gate 2** (user approves plan) → implement → update `knowledge/`. Small plans: `executing-plans`, not subagents. |

- All tiers: behavior changes need a regression test first (test-driven-development); use verification-before-completion and systematic-debugging when they apply.
- Full: ask clarifying questions one at a time (prefer multiple choice), never for anything code or `knowledge/` answers. Spec ≈ one page: goal, requirements, approach (rejected alternatives in a line each), affected areas, test strategy. Plan: small ordered tasks, each naming files, the first test, and its verify command. If implementation forces a design change, stop and report.
- Specs and plans go in `docs/superpowers/{specs,plans}/` (gitignored). No approval points beyond Gates 1 and 2 and those the skills require.
- Use `requesting-code-review` after Full-tier work and `finishing-a-development-branch` when verified work is ready to integrate.

## Context: load lazily

- **Conventions:** live in `.claude/rules/conventions/`. Claude Code and VS Code Copilot attach matching files automatically, so do not open them. Other agents: read `docs/conventions/index.md` and open only files whose scope matches. Follow `adopted` and `migrating` rules in new code, never copy paths a rule lists as legacy, follow the rule when code contradicts it, and report ambiguous or missing rules instead of silently deviating. `docs/CONVENTIONS_GUIDE.md` is for changing conventions only.
- **Knowledge:** only when the task touches domain behavior or technology choices: read `knowledge/index.yaml` and open only sections whose `relevant_when` matches (`tech-stack` is always relevant). Update the canonical file in the same change when behavior or stack changes; add a schema-compliant domain file and index entry for concepts that need tracing across several files; remove orphaned ones. Specs and plans are not the source of truth.
- **Learnings:** record a new gotcha in the owning `knowledge/` file. Add it to "Learnings" below only if it affects most tasks, in one line (this file loads every session).
- Questions, reviews, and Light tasks usually need neither.

## Commands

Run these instead of hand-written invocations; they run in parallel and print only failing tasks.

- `pnpm check:changed`: typecheck, format, lint, knowledge validation, and only tests related to uncommitted changes. **Run after every change.**
- `pnpm check:all`: same with every test. Run before finishing Full or broad tasks.
- Autofix: `pnpm format`.
- One test file: `pnpm exec vitest run <path> --reporter=agent`.
- Full-output scripts (`pnpm test`, `pnpm check`, `pnpm build`) are for humans and CI; if you must run them, pipe through `tail -n 60` (macOS/Linux/Git Bash) or `Select-Object -Last 60` (PowerShell).

## Token discipline

- **Search narrow:** `rg` (respects `.gitignore` and `.ignore`) with a path and a literal symbol, e.g. `rg -n "Symbol" src/sync`; `rg -l` or `-m 20` for locations only. Never `grep -r` from the root.
- **Read narrow:** read line ranges of large files; batch independent reads and searches in one turn. Do not read `pnpm-lock.yaml` or `dist/` unless the task is about them (denied in `.claude/settings.json`).
- **Subagents:** each starts cold, so they cost more in total. Use `finder` only for broad exploration and `mechanical-editor` only for precisely specified mechanical edits (`.claude/agents/`). Never for a question a single `rg` answers. Ask for paths, line numbers, and a short summary, not file contents.
- **Stop** when verification passes; report briefly without restating the diff.

Common searches:

- Sync logic: `src/sync/`
- DB helpers (interfaces, quoting, guard, pg adapter): `src/db/`
- Env config: `src/config/env.ts` (databases), `src/config/tables.ts` (`SYNC_TABLES`)

## Layout

- `src/`: `index.ts` (entry), `config/`, `db/`, `sync/`, `log.ts`. Details are in the conventions.
- `Dockerfile`, `k8s/cronjob.yaml`: image and CronJob manifest.
- `knowledge/`: domain and stack facts. `.agents/skills/`: canonical skill store, symlinked into `.claude/skills/` and `.kiro/skills/`; skills load from the repo root.
- `.github/copilot-instructions.md` is a symlink to this file; `CLAUDE.md` imports it; Kiro loads it natively.

## Learnings

One-line, repo-wide gotchas only.

- _Learnings go here_
