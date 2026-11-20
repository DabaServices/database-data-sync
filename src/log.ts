export type LogFields = Record<string, unknown>

export interface Logger {
  info(message: string, fields?: LogFields): void
  error(message: string, fields?: LogFields): void
}

export function createLogger(
  write: (line: string) => void = (line) => process.stdout.write(`${line}\n`),
): Logger {
  const emit =
    (level: 'info' | 'error') =>
    (message: string, fields: LogFields = {}) =>
      write(JSON.stringify({ time: new Date().toISOString(), level, message, ...fields }))

  return { info: emit('info'), error: emit('error') }
}
