import { describe, expect, it } from 'vitest'
import type { DbConfig } from '../config/env.ts'
import type { ConnectionConfig } from '../db/database.ts'
import { createLogger } from '../log.ts'
import { createFakeDatabase, type FakeDatabase } from './fakeDatabase.ts'
import { runSync } from './runSync.ts'

const connection = (host: string): ConnectionConfig => ({
  host,
  user: 'u',
  database: 'app',
  options: '',
})

const config: DbConfig = {
  source: connection('prod.db'),
  targets: [
    { name: 'preprod', connection: connection('preprod.db') },
    { name: 'nonprod', connection: connection('nonprod.db') },
  ],
}
const tables = ['public.parents', 'public.children']
const logger = createLogger(() => undefined)

function openFrom(databases: Record<string, FakeDatabase | Error>) {
  return async ({ host }: ConnectionConfig) => {
    const entry = databases[host]
    if (entry === undefined) throw new Error(`unexpected host ${host}`)
    if (entry instanceof Error) throw entry
    return entry
  }
}

describe('runSync', () => {
  it('syncs every target and reports rows', async () => {
    const open = openFrom({
      'prod.db': createFakeDatabase(),
      'preprod.db': createFakeDatabase(),
      'nonprod.db': createFakeDatabase(),
    })

    const results = await runSync({ config, tables, open, logger })

    expect(results).toEqual([
      { target: 'preprod', ok: true, rows: 4 },
      { target: 'nonprod', ok: true, rows: 4 },
    ])
  })

  it('keeps going after a target fails and closes every connection', async () => {
    const source = createFakeDatabase()
    const preprod = createFakeDatabase({ failCopyFor: 'children' })
    const nonprod = createFakeDatabase()
    const open = openFrom({ 'prod.db': source, 'preprod.db': preprod, 'nonprod.db': nonprod })

    const results = await runSync({ config, tables, open, logger })

    expect(results).toMatchObject([
      { target: 'preprod', ok: false, error: 'copy failed' },
      { target: 'nonprod', ok: true },
    ])
    expect(preprod.statements).not.toContain('COMMIT')
    expect(nonprod.statements).toContain('COMMIT')
    expect([source, preprod, nonprod].every((db) => db.closed)).toBe(true)
  })

  it('reports a connection failure instead of throwing', async () => {
    const open = openFrom({
      'prod.db': createFakeDatabase(),
      'preprod.db': new Error('connect failed'),
      'nonprod.db': createFakeDatabase(),
    })

    const results = await runSync({ config, tables, open, logger })

    expect(results).toMatchObject([
      { target: 'preprod', ok: false, error: 'connect failed' },
      { target: 'nonprod', ok: true },
    ])
  })

  it('logs the run start, each target start, and a summary', async () => {
    const lines: Record<string, unknown>[] = []
    const recorder = createLogger((line) => lines.push(JSON.parse(line) as Record<string, unknown>))
    const open = openFrom({
      'prod.db': createFakeDatabase(),
      'preprod.db': new Error('connect failed'),
      'nonprod.db': createFakeDatabase(),
    })

    await runSync({ config, tables, open, logger: recorder })

    expect(lines[0]).toMatchObject({
      message: 'sync started',
      targets: ['preprod', 'nonprod'],
      tables: 2,
    })
    expect(lines).toContainEqual(
      expect.objectContaining({ message: 'target started', target: 'nonprod' }),
    )
    expect(lines.at(-1)).toMatchObject({
      message: 'sync finished',
      succeeded: ['nonprod'],
      failed: ['preprod'],
    })
  })
})
