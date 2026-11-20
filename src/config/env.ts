import { z } from 'zod'
import type { ConnectionConfig } from '../db/database.ts'
import { isSameDatabase } from '../db/sameDatabase.ts'

const DEFAULT_SCHEMA = 'shoval'

const nonEmpty = z.string().min(1)
// The schema is placed inside a libpq options string, so it must not contain spaces or flags.
const schemaName = z
  .string()
  .regex(/^[A-Za-z_][A-Za-z0-9_$]*$/, 'must be a valid schema name')
  .optional()

const envSchema = z.object({
  PROD_DB_HOST: nonEmpty,
  PROD_DB_USER: nonEmpty,
  PROD_DB_NAME: nonEmpty,
  PROD_DB_SCHEMA: schemaName,
  PREPROD_DB_HOST: nonEmpty,
  PREPROD_DB_USER: nonEmpty,
  PREPROD_DB_NAME: nonEmpty,
  PREPROD_DB_SCHEMA: schemaName,
  NONPROD_DB_HOST: nonEmpty,
  NONPROD_DB_USER: nonEmpty,
  NONPROD_DB_PASSWORD: nonEmpty,
  NONPROD_DB_NAME: nonEmpty,
  NONPROD_DB_SCHEMA: schemaName,
  CERTIFICATE_CA: nonEmpty,
  CERTIFICATE_KEY: nonEmpty,
  CERTIFICATE_CSR: nonEmpty,
})

export interface Target {
  name: 'preprod' | 'nonprod'
  connection: ConnectionConfig
}

export interface DbConfig {
  source: ConnectionConfig
  targets: Target[]
}

export function loadDbConfig(env: NodeJS.ProcessEnv): DbConfig {
  const parsed = envSchema.safeParse(env)
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`Invalid environment: ${problems}`)
  }
  const vars = parsed.data

  const ssl = {
    rejectUnauthorized: true,
    ca: vars.CERTIFICATE_CA,
    key: vars.CERTIFICATE_KEY,
    cert: vars.CERTIFICATE_CSR,
  } as const
  const options = (schema: string | undefined) => `-c search_path=${schema ?? DEFAULT_SCHEMA}`

  const config: DbConfig = {
    source: {
      host: vars.PROD_DB_HOST,
      user: vars.PROD_DB_USER,
      database: vars.PROD_DB_NAME,
      ssl,
      options: options(vars.PROD_DB_SCHEMA),
    },
    targets: [
      {
        name: 'preprod',
        connection: {
          host: vars.PREPROD_DB_HOST,
          user: vars.PREPROD_DB_USER,
          database: vars.PREPROD_DB_NAME,
          ssl,
          options: options(vars.PREPROD_DB_SCHEMA),
        },
      },
      {
        name: 'nonprod',
        connection: {
          host: vars.NONPROD_DB_HOST,
          user: vars.NONPROD_DB_USER,
          password: vars.NONPROD_DB_PASSWORD,
          database: vars.NONPROD_DB_NAME,
          options: options(vars.NONPROD_DB_SCHEMA),
        },
      },
    ],
  }

  for (const target of config.targets) {
    if (isSameDatabase(config.source, target.connection)) {
      throw new Error(`Target ${target.name} points at the production database`)
    }
  }
  return config
}
