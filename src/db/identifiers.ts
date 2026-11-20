const TABLE_NAME = /^[A-Za-z_][A-Za-z0-9_$]*\.[A-Za-z_][A-Za-z0-9_$]*$/

// Names are quoted verbatim, so they must match the real (case-sensitive) catalog names.
export function quoteTable(name: string): string {
  if (!TABLE_NAME.test(name)) {
    throw new Error(`Invalid table name "${name}": expected schema.table`)
  }
  return name
    .split('.')
    .map((part) => `"${part}"`)
    .join('.')
}

export function assertValidTables(tables: readonly string[]): void {
  if (tables.length === 0) {
    throw new Error('No tables configured: set SYNC_TABLES (comma-separated schema.table names)')
  }
  const seen = new Set<string>()
  for (const table of tables) {
    quoteTable(table)
    if (seen.has(table)) {
      throw new Error(`Duplicate table "${table}"`)
    }
    seen.add(table)
  }
}
