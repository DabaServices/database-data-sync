# database-data-sync

A CronJob (run once or twice a day) that copies data from selected **production** PostgreSQL tables into the **pre-prod** and **non-prod** databases. Data only: the table structure (DDL) must already exist in the targets.

## How it works

For each configured target (pre-prod, then non-prod), independently:

1. Open production in a `READ ONLY REPEATABLE READ` transaction (one consistent snapshot).
2. In a single target transaction, run one `TRUNCATE` of all configured tables.
3. For each table, in the configured order, stream `COPY (SELECT * FROM t) TO STDOUT WITH (FORMAT binary)` from production into `COPY t FROM STDIN WITH (FORMAT binary)` on the target. Rows stream through with backpressure, so memory stays flat regardless of table size; binary format avoids text conversion on both servers but requires identical column types.
4. `COMMIT`. On any error the target is rolled back and keeps its previous data.

A failure on one target does not stop the other. The process exits with code 1 if any target failed. Logs are JSON lines on stdout: run start (targets, table count), target start, truncate, each table copied (rows, duration), each target's result, and a final summary (succeeded and failed targets).

## Configuration

Each database has its own prefixed variables (`PROD_`, `PREPROD_`, `NONPROD_`). Prod is required; configure at least one of pre-prod and non-prod. A target is skipped when none of its connection variables are set (`*_DB_SCHEMA` alone does not count), and the run fails if a target is only partly configured:

| Variable                                               | Description                                                          |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `<PREFIX>_DB_HOST`, `<PREFIX>_DB_USER`                 | Host and user (use a read-only user for prod)                        |
| `<PREFIX>_DB_NAME`                                     | Database name                                                        |
| `<PREFIX>_DB_SCHEMA`                                   | Optional; sets `search_path` (default `shoval`)                      |
| `NONPROD_DB_PASSWORD`                                  | Non-prod only: password auth, no SSL                                 |
| `CERTIFICATE_CA`, `CERTIFICATE_KEY`, `CERTIFICATE_CSR` | Prod and pre-prod: SSL with client certificate (`CSR` is the `cert`) |

Prod and pre-prod connect over SSL (`rejectUnauthorized: true`) without a password; non-prod connects with a password and no SSL. Targets need `TRUNCATE` and `INSERT`; prod needs `SELECT`. See [`.env.example`](.env.example). The job refuses to run if a target has the same host and database name as production.

**Tables:** set `SYNC_TABLES` to a comma- or newline-separated list of the tables to copy (all rows and columns; every other table in the schema is left alone), e.g. `shoval.parents,shoval.children`. Write `schema.table` names exactly as they appear in the catalog (names are case-sensitive), with referenced (parent) tables before the tables that reference them. The job fails before connecting if the list is empty, malformed or has duplicates.

## Assumptions

- Target tables have the same columns in the same order as production.
- Sequences are not reset after the copy.
- The default port (5432) is used for every database.
- The same-database guard cannot detect DNS aliases that point at production.

## Run locally

```bash
pnpm install
pnpm build
node --env-file=.env dist/index.js
```

## Deploy

```bash
docker build -t <registry>/database-data-sync:<tag> .
docker push <registry>/database-data-sync:<tag>
```

Then in [`k8s/cronjob.yaml`](k8s/cronjob.yaml) set the image, `schedule` (default `0 2,14 * * *`) and `timeZone`, create a Secret named `database-data-sync` with the password and certificate keys (`NONPROD_DB_PASSWORD`, `CERTIFICATE_CA`, `CERTIFICATE_KEY`, `CERTIFICATE_CSR`; the password is only needed when non-prod is configured), adjust the plain `*_DB_*` values in the manifest (delete a target's lines to skip it), and apply it. `concurrencyPolicy: Forbid` prevents overlapping runs.

## Scripts

| Command              | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `pnpm build`         | Compile TypeScript to `dist/`                                  |
| `pnpm start`         | Run the compiled job                                           |
| `pnpm zip`           | Clean build and pack a runnable `build/database-data-sync.zip` |
| `pnpm test`          | Run unit tests                                                 |
| `pnpm typecheck`     | Type-check without emitting                                    |
| `pnpm lint`          | Lint with ESLint                                               |
| `pnpm format`        | Format and auto-fix with Prettier + ESLint                     |
| `pnpm check`         | Run format check, lint, and typecheck                          |
| `pnpm check:changed` | Quiet checks + tests for changed files (use after each change) |
| `pnpm check:all`     | Quiet checks + all tests                                       |

`pnpm zip` (or `npm run zip`) contains only `dist/*.js`, `package.json`, the lockfile, `pnpm-workspace.yaml` and `.env.example`. To run it elsewhere (Node 24 + pnpm): unzip, copy `.env.example` to `.env` and fill it in, then `pnpm install --prod --frozen-lockfile` and `node --env-file=.env dist/index.js`.

## Conventions and AI agents

Rules live in [`.claude/rules/conventions/`](.claude/rules/conventions/) (index: [`docs/conventions/index.md`](docs/conventions/index.md)); domain and stack facts in [`knowledge/`](knowledge/). [`AGENTS.md`](AGENTS.md) is the single entrypoint for Claude Code, Copilot, and Kiro. Skills live in `.agents/skills/` and are symlinked into `.claude/skills/` and `.kiro/skills/`.

**Windows:** symlinks need Developer Mode (or an elevated shell) and `git config core.symlinks true` set before cloning; otherwise git writes them as text files. Install ripgrep (`winget install BurntSushi.ripgrep.MSVC`) and run `corepack enable`. macOS: `brew install ripgrep`.
