import pg from 'pg'
import { from as copyFrom, to as copyTo } from 'pg-copy-streams'
import type { ConnectionConfig, ManagedDatabase } from './database.ts'

export async function openDatabase(connection: ConnectionConfig): Promise<ManagedDatabase> {
  const client = new pg.Client(connection)
  await client.connect()

  return {
    query: async (sql) => {
      await client.query(sql)
    },
    copyTo: (sql) => client.query(copyTo(sql)),
    copyFrom: (sql) => client.query(copyFrom(sql)),
    close: () => client.end(),
  }
}
