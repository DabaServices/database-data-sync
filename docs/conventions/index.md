# Conventions index

For agents without native rules support (Claude Code and VS Code Copilot attach these automatically). Open only files whose scope matches the files you edit. Changing conventions: see [CONVENTIONS_GUIDE.md](../CONVENTIONS_GUIDE.md).

| File                                                               | Scope                                          | Status  |
| ------------------------------------------------------------------ | ---------------------------------------------- | ------- |
| [repository.md](../../.claude/rules/conventions/repository.md)     | all files (imports, naming, comments, secrets) | adopted |
| [typescript.md](../../.claude/rules/conventions/typescript.md)     | `src/**/*.ts`, `*.ts`                          | adopted |
| [architecture.md](../../.claude/rules/conventions/architecture.md) | `src/**/*.ts` (sync flow, read-only prod, SQL) | adopted |
| [testing.md](../../.claude/rules/conventions/testing.md)           | `src/**/*.test.ts`                             | adopted |
