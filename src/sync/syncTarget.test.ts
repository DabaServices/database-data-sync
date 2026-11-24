import { describe, expect, it } from 'vitest'
import { createLogger } from '../log.ts'
import { createFakeDatabase } from './fakeDatabase.ts'
import { syncTarget } from './syncTarget.ts'

const tables = ['public.parents', 'public.children']
const silent = createLogger(() => undefined)

describe('syncTarget', () => {
  it('truncates all tables once, copies in binary in order inside one transaction, then commits', async () => {
    const source = createFakeDatabase()
    const target = createFakeDatabase({ rowsPerCopy: 2 })

    const total = await syncTarget({
      source,
      target,
      tables,
      logger: silent,
      targetName: 'preprod',
    })

    expect(total).toBe(4)
    expect(target.statements).toEqual([
      'BEGIN',
      'TRUNCATE "public"."parents", "public"."children"',
      'COPY "public"."parents" FROM STDIN WITH (FORMAT binary)',
      'COPY "public"."children" FROM STDIN WITH (FORMAT binary)',
      'COMMIT',
    ])
    expect(source.statements).toEqual([
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
      'COPY (SELECT * FROM "public"."parents") TO STDOUT WITH (FORMAT binary)',
      'COPY (SELECT * FROM "public"."children") TO STDOUT WITH (FORMAT binary)',
    ])
  })

  it('rolls back the target and rethrows when a copy fails', async () => {
    const source = createFakeDatabase()
    const target = createFakeDatabase({ failCopyFor: 'children' })

    await expect(
      syncTarget({ source, target, tables, logger: silent, targetName: 'preprod' }),
    ).rejects.toThrow('copy failed')

    expect(target.statements).not.toContain('COMMIT')
    expect(target.statements.at(-1)).toBe('ROLLBACK')
  })

  it('does not wait on the source connection after a failed copy', { timeout: 2000 }, async () => {
    const source = createFakeDatabase({ stallsAfterAbortedCopy: true })
    const target = createFakeDatabase({ failCopyFor: 'parents' })

    await expect(
      syncTarget({ source, target, tables, logger: silent, targetName: 'preprod' }),
    ).rejects.toThrow('copy failed')

    expect(target.statements.at(-1)).toBe('ROLLBACK')
  })

  it('logs the truncate, then rows per table', async () => {
    const lines: Record<string, unknown>[] = []
    const logger = createLogger((line) => lines.push(JSON.parse(line) as Record<string, unknown>))

    await syncTarget({
      source: createFakeDatabase(),
      target: createFakeDatabase({ rowsPerCopy: 7 }),
      tables: ['public.parents'],
      logger,
      targetName: 'nonprod',
    })

    expect(lines).toMatchObject([
      { message: 'tables truncated', target: 'nonprod', tables: 1 },
      { message: 'table copied', target: 'nonprod', table: 'public.parents', rows: 7 },
    ])
  })
})
