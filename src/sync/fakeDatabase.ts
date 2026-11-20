import { Readable, Writable } from 'node:stream'
import type { ManagedDatabase } from '../db/database.ts'

export interface FakeDatabase extends ManagedDatabase {
  readonly statements: string[]
  closed: boolean
}

export function createFakeDatabase(
  options: { failCopyFor?: string; rowsPerCopy?: number; stallsAfterAbortedCopy?: boolean } = {},
): FakeDatabase {
  const statements: string[] = []
  const rowsPerCopy = options.rowsPerCopy ?? 2
  // Like a real connection, it cannot run new statements while a COPY OUT is left unfinished.
  let copyOutUnfinished = false

  const db: FakeDatabase = {
    statements,
    closed: false,
    query: (sql) => {
      statements.push(sql)
      return options.stallsAfterAbortedCopy && copyOutUnfinished
        ? new Promise<void>(() => undefined)
        : Promise.resolve()
    },
    copyTo: (sql) => {
      statements.push(sql)
      const stream = Readable.from([`rows of ${sql}`, 'more rows'])
      copyOutUnfinished = true
      stream.once('end', () => {
        copyOutUnfinished = false
      })
      return stream
    },
    copyFrom: (sql) => {
      statements.push(sql)
      const shouldFail = options.failCopyFor !== undefined && sql.includes(options.failCopyFor)
      const sink: Writable & { rowCount?: number } = new Writable({
        write: (_chunk, _encoding, done) => done(shouldFail ? new Error('copy failed') : null),
      })
      sink.rowCount = rowsPerCopy
      return sink
    },
    close: async () => {
      db.closed = true
    },
  }
  return db
}
