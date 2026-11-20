import { describe, expect, it } from 'vitest'
import { createLogger } from './log.ts'

describe('createLogger', () => {
  it('writes one JSON line per entry with level, message and fields', () => {
    const lines: string[] = []
    const logger = createLogger((line) => lines.push(line))

    logger.info('table copied', { table: 'public.users', rows: 3 })
    logger.error('target failed', { target: 'preprod' })

    expect(lines.map((line) => JSON.parse(line))).toMatchObject([
      { level: 'info', message: 'table copied', table: 'public.users', rows: 3 },
      { level: 'error', message: 'target failed', target: 'preprod' },
    ])
  })
})
