import type { DbConfig } from '../config/env.ts'
import type { ConnectionConfig, ManagedDatabase } from '../db/database.ts'
import type { Logger } from '../log.ts'
import { syncTarget } from './syncTarget.ts'

export interface SyncResult {
  target: string
  ok: boolean
  rows?: number
  error?: string
}

export interface RunSyncOptions {
  config: DbConfig
  tables: readonly string[]
  open: (connection: ConnectionConfig) => Promise<ManagedDatabase>
  logger: Logger
}

export async function runSync({
  config,
  tables,
  open,
  logger,
}: RunSyncOptions): Promise<SyncResult[]> {
  const results: SyncResult[] = []

  for (const target of config.targets) {
    const startedAt = Date.now()
    let source: ManagedDatabase | undefined
    let sink: ManagedDatabase | undefined
    try {
      // A fresh source connection per target gives each target its own consistent snapshot.
      source = await open(config.source)
      sink = await open(target.connection)
      const rows = await syncTarget({
        source,
        target: sink,
        tables,
        logger,
        targetName: target.name,
      })
      logger.info('target synced', {
        target: target.name,
        rows,
        durationMs: Date.now() - startedAt,
      })
      results.push({ target: target.name, ok: true, rows })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error('target failed', { target: target.name, error: message })
      results.push({ target: target.name, ok: false, error: message })
    } finally {
      await Promise.allSettled([source?.close(), sink?.close()])
    }
  }

  return results
}
