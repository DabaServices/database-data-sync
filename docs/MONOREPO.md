# Converting this template into a pnpm + Turbo monorepo

**Audience: an AI agent.** Do this only when the user asks. This template is a single frontend app at the repo root. The target layout puts it in `frontend/` and adds more apps (e.g. `backend/`) beside it. Ask the user for the app list, the package scope (`<scope>`, e.g. `acme`), and the default branch before starting. Work on a new branch; do not commit unless asked.

Keep the existing agent workflow (tiers, lazy context, token discipline in [AGENTS.md](../AGENTS.md)) and keep everything working on both Windows and macOS: Node scripts instead of shell, forward slashes in globs, LF line endings. This file lists what changes when moving from one app to many. Derive conventions from real code; do not invent them.

## 1. Move the app

1. `git mv` app files into `frontend/`: `src/`, `public/`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsr.config.json`, `components.json`, `eslint.config.js`, `stylelint.config.js`, `.env.example`, `.nwabaprc` (if used), and the current `package.json`. Use `git mv` so history follows.
2. Rename the app package to `<scope>-frontend`. Keep `@/` → `frontend/src/`.
3. Keep at the root: `.agents/`, `.claude/`, `.kiro/`, `.github/`, `.vscode/`, `docs/`, `knowledge/`, `scripts/`, `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `.gitattributes`, `.ignore`, `.nvmrc`, `prettier.config.js`, lockfile, `pnpm-workspace.yaml`.

## 2. Workspace and Turbo

- `pnpm-workspace.yaml`: `packages: [frontend, backend]` (keep the existing `allowBuilds` and `settings`; remove `ignoreWorkspaceRootCheck` if no longer needed).
- New root `package.json` (private, `packageManager` pinned, `turbo` as devDependency) with scripts all via turbo: `build`, `dev`, `lint`, `test`, `typecheck`, `format`, `format:check`, `test:<app>`, plus `format:check:root` = `prettier --check --log-level warn --cache . "!frontend/**" "!backend/**"`.
- `turbo.json`: `globalDependencies: [tsconfig.base.json, prettier.config.js]`; cache `test:*` with `inputs` including `.env*` and `env` listing `TZ, LANG, LC_ALL, VITE_*`; `dev` is `cache: false, persistent: true`; `build` outputs `dist/**` and depends on `^build`.
- Add `tsconfig.base.json` with the shared strict options; each app's `tsconfig.json` extends it.
- Each app keeps identical script names so turbo fans out: `typecheck`, `format:check`, `lint:check`, `lint:css` (frontend), `test:quiet`, `test:changed`, `knowledge:validate` stays at the root.
- Replace `scripts/check.mjs` usage with turbo: `check:changed` = `turbo run typecheck format:check format:check:root lint:check lint:css knowledge:validate:run test:changed --output-logs=errors-only --log-prefix=none --no-update-notifier --continue`; `check:all` = same with `test:quiet`. Delete `scripts/check.mjs` once both work.
- Move `knowledge:validate:run` to the root and extend `scripts/validate-knowledge.mjs` to also walk `<app>/knowledge/domain` and `<app>/knowledge/index.yaml`.

## 3. Agent files

- Root `AGENTS.md`: retitle (`# <Project> Monorepo Guidelines`), list apps and stacks, say "read the nested `AGENTS.md` of the app you work in", and update: commands (`pnpm --filter <scope>-<app> exec vitest run <path> --reporter=agent`), tier table (add "second app" and "API contract/migration" to Full), knowledge lookup (root index, then the owning app's index), common searches, and layout. Add the DB/migration safety rules if a backend with a database is added.
- Per-app `AGENTS.md` (~30 lines) + one-line `CLAUDE.md` (`@AGENTS.md`): move stack summary, app commands, project structure, and learnings out of the root file. Link to the root for workflow and safety; never duplicate rules.
- Conventions: stay in `.claude/rules/conventions/`. Prefix app-specific files (`architecture.md` → `frontend-architecture.md`, likewise `queries`, `ui`, `testing`) and update their `paths` globs to `frontend/src/**`. Keep `repository.md` and `typescript.md` repo-wide. Add `backend-*.md` files only from real backend patterns. Update `docs/conventions/index.md` in the same change; never reuse rule IDs.
- Knowledge: move `knowledge/tech-stack.yaml` to `frontend/knowledge/tech-stack.yaml` and create `frontend/knowledge/index.yaml` (`tech-stack` with `always_load: true`). The root `knowledge/` keeps only cross-app contracts (`index.yaml`, `schema.json`, `domain/`).
- `.claude/settings.json`: update deny paths (`./frontend/src/routeTree.gen.ts`, generated backend dirs) and allow `pnpm --filter <scope>-<app> exec vitest run *` per app. `.claude/agents/`, the format hook, and skill symlinks are unchanged. Update `.ignore`, `.prettierignore`, and the `finder` agent paths.

## 4. CI and tooling

- `.github/workflows/ci.yml`: frozen-lockfile install, restore the Turbo cache, run `pnpm check`, tests per app, `pnpm build`, knowledge validate. Add deploy workflows per app only if asked. Fix `nwabap` and other root-relative paths.
- `.vscode/extensions.json`: add `prisma.prisma` only if Prisma is introduced.
- `.github/dependabot.yml`: add a directory entry per app.

## 5. Verify

1. `pnpm install`, then `pnpm check:all` and `pnpm build`; report baseline failures separately from your changes.
2. `rg -n "src/" AGENTS.md .claude docs knowledge` must show no stale root-relative `src/` paths.
3. `git ls-files -s .github/copilot-instructions.md` shows mode `120000`; `.claude/skills/<any>/SKILL.md` is readable.
4. Do not commit; show the user the staged list and open questions.
