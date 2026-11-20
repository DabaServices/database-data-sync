import { loadDbConfig } from './config/env.ts'
import { loadTables } from './config/tables.ts'
import { openDatabase } from './db/pgDatabase.ts'
import { createLogger } from './log.ts'
import { runSync } from './sync/runSync.ts'

const logger = createLogger()

try {
  const tables = loadTables(process.env)
  const config = loadDbConfig(process.env)
  const results = await runSync({ config, tables, open: openDatabase, logger })
  if (results.some((result) => !result.ok)) {
    process.exitCode = 1
  }
} catch (error) {
  logger.error('sync aborted', { error: error instanceof Error ? error.message : String(error) })
  process.exitCode = 1
}
