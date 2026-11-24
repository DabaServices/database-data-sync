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

const prodSchema = z.object({
  PROD_DB_HOST: nonEmpty,
  PROD_DB_USER: nonEmpty,
  PROD_DB_NAME: nonEmpty,
  PROD_DB_SCHEMA: schemaName,
  CERTIFICATE_CA: nonEmpty,
  CERTIFICATE_KEY: nonEmpty,
  CERTIFICATE_CSR: nonEmpty,
})
const preprodSchema = z.object({
  PREPROD_DB_HOST: nonEmpty,
  PREPROD_DB_USER: nonEmpty,
  PREPROD_DB_NAME: nonEmpty,
  PREPROD_DB_SCHEMA: schemaName,
})
const nonprodSchema = z.object({
  NONPROD_DB_HOST: nonEmpty,
  NONPROD_DB_USER: nonEmpty,
  NONPROD_DB_PASSWORD: nonEmpty,
  NONPROD_DB_NAME: nonEmpty,
  NONPROD_DB_SCHEMA: schemaName,
})

// A schema variable alone does not enable a target, so leftover defaults stay harmless.
function isConfigured(schema: z.ZodObject, env: NodeJS.ProcessEnv): boolean {
  return Object.keys(schema.shape).some(
    (key) => !key.endsWith('_SCHEMA') && (env[key] ?? '') !== '',
  )
}

export interface Target {
  name: 'preprod' | 'nonprod'
  connection: ConnectionConfig
}

export interface DbConfig {
  source: ConnectionConfig
  targets: Target[]
}

export function loadDbConfig(env: NodeJS.ProcessEnv): DbConfig {
  const problems: string[] = []
  const parse = <T extends z.ZodObject>(schema: T): z.infer<T> | undefined => {
    const parsed = schema.safeParse(env)
    if (parsed.success) return parsed.data
    problems.push(
      ...parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    )
    return undefined
  }

  const prod = parse(prodSchema)
  const hasPreprod = isConfigured(preprodSchema, env)
  const hasNonprod = isConfigured(nonprodSchema, env)
  const preprod = hasPreprod ? parse(preprodSchema) : undefined
  const nonprod = hasNonprod ? parse(nonprodSchema) : undefined
  if (!hasPreprod && !hasNonprod) {
    problems.push('configure at least one target (PREPROD_DB_* or NONPROD_DB_*)')
  }
  if (prod === undefined || problems.length > 0) {
    throw new Error(`Invalid environment: ${problems.join('; ')}`)
  }

  const ssl = {
    rejectUnauthorized: true,
    ca: prod.CERTIFICATE_CA,
    key: prod.CERTIFICATE_KEY,
    cert: prod.CERTIFICATE_CSR,
  } as const
  const options = (schema: string | undefined) => `-c search_path=${schema ?? DEFAULT_SCHEMA}`

  const targets: Target[] = []
  if (preprod) {
    targets.push({
      name: 'preprod',
      connection: {
        host: preprod.PREPROD_DB_HOST,
        user: preprod.PREPROD_DB_USER,
        database: preprod.PREPROD_DB_NAME,
        ssl,
        options: options(preprod.PREPROD_DB_SCHEMA),
      },
    })
  }
  if (nonprod) {
    targets.push({
      name: 'nonprod',
      connection: {
        host: nonprod.NONPROD_DB_HOST,
        user: nonprod.NONPROD_DB_USER,
        password: nonprod.NONPROD_DB_PASSWORD,
        database: nonprod.NONPROD_DB_NAME,
        options: options(nonprod.NONPROD_DB_SCHEMA),
      },
    })
  }

  const config: DbConfig = {
    source: {
      host: prod.PROD_DB_HOST,
      user: prod.PROD_DB_USER,
      database: prod.PROD_DB_NAME,
      ssl,
      options: options(prod.PROD_DB_SCHEMA),
    },
    targets,
  }

  for (const target of config.targets) {
    if (isSameDatabase(config.source, target.connection)) {
      throw new Error(`Target ${target.name} points at the production database`)
    }
  }
  return config
}
