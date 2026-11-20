import { describe, expect, it } from 'vitest'
import { loadDbConfig } from './env.ts'

const valid = {
  PROD_DB_HOST: 'prod.db',
  PROD_DB_USER: 'ro',
  PROD_DB_NAME: 'app',
  PREPROD_DB_HOST: 'preprod.db',
  PREPROD_DB_USER: 'rw',
  PREPROD_DB_NAME: 'app',
  NONPROD_DB_HOST: 'nonprod.db',
  NONPROD_DB_USER: 'rw',
  NONPROD_DB_PASSWORD: 'secret-pw',
  NONPROD_DB_NAME: 'app',
  CERTIFICATE_CA: 'ca-pem',
  CERTIFICATE_KEY: 'key-pem',
  CERTIFICATE_CSR: 'cert-pem',
}

const ssl = { rejectUnauthorized: true, ca: 'ca-pem', key: 'key-pem', cert: 'cert-pem' }

describe('loadDbConfig', () => {
  it('connects to prod and pre-prod with certificates, no password, default schema', () => {
    const config = loadDbConfig(valid)

    expect(config.source).toEqual({
      host: 'prod.db',
      user: 'ro',
      database: 'app',
      ssl,
      options: '-c search_path=shoval',
    })
    expect(config.targets[0]).toEqual({
      name: 'preprod',
      connection: {
        host: 'preprod.db',
        user: 'rw',
        database: 'app',
        ssl,
        options: '-c search_path=shoval',
      },
    })
    expect(config.source).not.toHaveProperty('password')
  })

  it('connects to non-prod with a password and without SSL', () => {
    const nonprod = loadDbConfig(valid).targets[1]

    expect(nonprod).toEqual({
      name: 'nonprod',
      connection: {
        host: 'nonprod.db',
        user: 'rw',
        password: 'secret-pw',
        database: 'app',
        options: '-c search_path=shoval',
      },
    })
    expect(nonprod?.connection).not.toHaveProperty('ssl')
  })

  it('uses the configured schema for the search_path', () => {
    const config = loadDbConfig({ ...valid, PREPROD_DB_SCHEMA: 'sales' })

    expect(config.targets[0]?.connection.options).toBe('-c search_path=sales')
    expect(config.source.options).toBe('-c search_path=shoval')
  })

  it('names the missing variable', () => {
    const { NONPROD_DB_PASSWORD: _omitted, ...env } = valid
    expect(() => loadDbConfig(env)).toThrow(/NONPROD_DB_PASSWORD/)
  })

  it('requires the certificates', () => {
    const { CERTIFICATE_KEY: _omitted, ...env } = valid
    expect(() => loadDbConfig(env)).toThrow(/CERTIFICATE_KEY/)
  })

  it('rejects an unsafe schema without echoing it', () => {
    const env = { ...valid, PROD_DB_SCHEMA: 'x -c secret-leak=1' }
    expect(() => loadDbConfig(env)).toThrow(/PROD_DB_SCHEMA/)
    expect(() => loadDbConfig(env)).not.toThrow(/secret-leak/)
  })

  it('refuses a target that points at the production database', () => {
    const env = { ...valid, NONPROD_DB_HOST: 'PROD.db' }
    expect(() => loadDbConfig(env)).toThrow(/nonprod.*production/i)
  })
})
