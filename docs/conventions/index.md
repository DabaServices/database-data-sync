# Conventions index

For agents without native rules support (Claude Code and VS Code Copilot attach these automatically). Open only files whose scope matches the files you edit. Changing conventions: see [CONVENTIONS_GUIDE.md](../CONVENTIONS_GUIDE.md).

| File                                                               | Scope                                          | Status  |
| ------------------------------------------------------------------ | ---------------------------------------------- | ------- |
| [repository.md](../../.claude/rules/conventions/repository.md)     | all files (imports, naming, comments, Remeda)  | adopted |
| [typescript.md](../../.claude/rules/conventions/typescript.md)     | `src/**/*.{ts,tsx}`                            | adopted |
| [architecture.md](../../.claude/rules/conventions/architecture.md) | `src/**` (feature slices, `ui/` boundary, RTL) | adopted |
| [queries.md](../../.claude/rules/conventions/queries.md)           | `queries.ts`, `src/queries/`, features, routes | adopted |
| [ui.md](../../.claude/rules/conventions/ui.md)                     | `src/components/`, `src/theme/`, SCSS, TSX     | adopted |
| [testing.md](../../.claude/rules/conventions/testing.md)           | `src/**/*.{spec,test}.{ts,tsx}`                | adopted |
