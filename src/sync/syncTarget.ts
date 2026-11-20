import { pipeline } from 'node:stream/promises'
import type { Database } from '../db/database.ts'
import { quoteTable } from '../db/identifiers.ts'
import type { Logger } from '../log.ts'

export interface SyncTargetOptions {
  source: Database
  target: Database
  tables: readonly string[]
  logger: Logger
  targetName: string
}

export async function syncTarget({
  source,
  target,
  tables,
  logger,
  targetName,
}: SyncTargetOptions): Promise<number> {
  const quoted = tables.map((name) => ({ name, sql: quoteTable(name) }))

  // The source transaction ends when its connection is closed by the caller. An explicit
  // ROLLBACK would queue forever behind a COPY OUT that was aborted by a failing target.
  await source.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY')
  await target.query('BEGIN')
  try {
    // One statement: Postgres only allows truncating FK-referenced tables together.
    await target.query(`TRUNCATE ${quoted.map((table) => table.sql).join(', ')}`)

    let total = 0
    for (const { name, sql } of quoted) {
      const startedAt = Date.now()
      const sink = target.copyFrom(`COPY ${sql} FROM STDIN`)
      await pipeline(source.copyTo(`COPY (SELECT * FROM ${sql}) TO STDOUT`), sink)
      const rows = sink.rowCount ?? 0
      total += rows
      logger.info('table copied', {
        target: targetName,
        table: name,
        rows,
        durationMs: Date.now() - startedAt,
      })
    }

    await target.query('COMMIT')
    return total
  } catch (error) {
    await target.query('ROLLBACK').catch(() => undefined)
    throw error
  }
}
