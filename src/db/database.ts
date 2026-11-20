import type { Readable, Writable } from 'node:stream'

export interface ConnectionConfig {
  host: string
  user: string
  database: string
  password?: string
  ssl?: { rejectUnauthorized: true; ca: string; key: string; cert: string }
  options: string
}

export interface Database {
  query(sql: string): Promise<void>
  copyTo(sql: string): Readable
  copyFrom(sql: string): Writable & { rowCount?: number }
}

export interface ManagedDatabase extends Database {
  close(): Promise<void>
}
