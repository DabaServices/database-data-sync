import { describe, expect, it } from 'vitest'
import { createLogger } from '../log.ts'
import { createFakeDatabase } from './fakeDatabase.ts'
import { syncTarget } from './syncTarget.ts'

const tables = ['public.parents', 'public.children']
const silent = createLogger(() => undefined)

describe('syncTarget', () => {
  it('truncates all tables once, copies in order inside one transaction, then commits', async () => {
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
      'COPY "public"."parents" FROM STDIN',
      'COPY "public"."children" FROM STDIN',
      'COMMIT',
    ])
    expect(source.statements).toEqual([
      'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
      'COPY (SELECT * FROM "public"."parents") TO STDOUT',
      'COPY (SELECT * FROM "public"."children") TO STDOUT',
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

  it('logs rows per table', async () => {
    const lines: string[] = []
    const logger = createLogger((line) => lines.push(line))

    await syncTarget({
      source: createFakeDatabase(),
      target: createFakeDatabase({ rowsPerCopy: 7 }),
      tables: ['public.parents'],
      logger,
      targetName: 'nonprod',
    })

    expect(JSON.parse(lines[0] ?? '{}')).toMatchObject({
      message: 'table copied',
      target: 'nonprod',
      table: 'public.parents',
      rows: 7,
    })
  })
})
