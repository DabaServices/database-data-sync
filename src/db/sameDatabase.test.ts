import { describe, expect, it } from 'vitest'
import type { ConnectionConfig } from './database.ts'
import { isSameDatabase } from './sameDatabase.ts'

const base: ConnectionConfig = { host: 'db.local', user: 'a', database: 'app', options: '' }

describe('isSameDatabase', () => {
  it('is true for the same host and database regardless of case, user or schema', () => {
    expect(
      isSameDatabase(base, {
        host: 'DB.Local',
        user: 'b',
        password: 'x',
        database: 'app',
        options: '-c search_path=other',
      }),
    ).toBe(true)
  })

  it('is false when the host or database differ', () => {
    expect(isSameDatabase(base, { ...base, host: 'other.local' })).toBe(false)
    expect(isSameDatabase(base, { ...base, database: 'other' })).toBe(false)
  })
})
