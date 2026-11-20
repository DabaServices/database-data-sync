import type { ConnectionConfig } from './database.ts'

export function isSameDatabase(a: ConnectionConfig, b: ConnectionConfig): boolean {
  return a.host.toLowerCase() === b.host.toLowerCase() && a.database === b.database
}
