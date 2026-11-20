import { describe, expect, it } from 'vitest'
import { assertValidTables, quoteTable } from './identifiers.ts'

describe('quoteTable', () => {
  it('quotes schema and table', () => {
    expect(quoteTable('public.users')).toBe('"public"."users"')
    expect(quoteTable('Sales.Order_Items')).toBe('"Sales"."Order_Items"')
  })

  it.each(['users', 'public.users.extra', 'public.us"ers', 'public.users; DROP TABLE x', ''])(
    'rejects %j',
    (name) => {
      expect(() => quoteTable(name)).toThrow(/Invalid table name/)
    },
  )
})

describe('assertValidTables', () => {
  it('accepts a valid list', () => {
    expect(() => assertValidTables(['public.a', 'public.b'])).not.toThrow()
  })

  it('rejects an empty list', () => {
    expect(() => assertValidTables([])).toThrow(/No tables configured/)
  })

  it('rejects duplicates', () => {
    expect(() => assertValidTables(['public.a', 'public.a'])).toThrow(/Duplicate table/)
  })

  it('rejects malformed names', () => {
    expect(() => assertValidTables(['nope'])).toThrow(/Invalid table name/)
  })
})
