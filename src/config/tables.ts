import { assertValidTables } from '../db/identifiers.ts'

/** `SYNC_TABLES` is a comma or newline separated list of `schema.table` names in load order. */
export function loadTables(env: NodeJS.ProcessEnv): string[] {
  const tables = (env.SYNC_TABLES ?? '')
    .split(/[,\n]/)
    .map((name) => name.trim())
    .filter((name) => name !== '')

  assertValidTables(tables)
  return tables
}
