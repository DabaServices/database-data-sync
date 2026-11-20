import { describe, expect, it } from 'vitest'
import { loadTables } from './tables.ts'

describe('loadTables', () => {
  it('splits SYNC_TABLES on commas, keeping the order', () => {
    expect(loadTables({ SYNC_TABLES: 'shoval.parents,shoval.children' })).toEqual([
      'shoval.parents',
      'shoval.children',
    ])
  })

  it('accepts newlines, surrounding spaces and a trailing separator', () => {
    expect(loadTables({ SYNC_TABLES: ' shoval.a ,\n shoval.b\n,' })).toEqual([
      'shoval.a',
      'shoval.b',
    ])
  })

  it('rejects a missing or blank list', () => {
    expect(() => loadTables({})).toThrow(/SYNC_TABLES/)
    expect(() => loadTables({ SYNC_TABLES: ' , \n' })).toThrow(/SYNC_TABLES/)
  })

  it('rejects malformed and duplicate names', () => {
    expect(() => loadTables({ SYNC_TABLES: 'shoval.a,orders' })).toThrow(/Invalid table name/)
    expect(() => loadTables({ SYNC_TABLES: 'shoval.a,shoval.a' })).toThrow(/Duplicate table/)
  })
})
