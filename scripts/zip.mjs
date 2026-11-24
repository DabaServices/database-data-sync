// Packs only what is needed to run the job elsewhere:
//   pnpm install --prod --frozen-lockfile && node --env-file=.env dist/index.js
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { crc32, deflateRawSync } from 'node:zlib'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const output = join(root, 'build', 'database-data-sync.zip')
const rootFiles = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', '.env.example']

// A clean build keeps stale output from deleted sources out of the archive.
rmSync(join(root, 'dist'), { recursive: true, force: true })
const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc')
execFileSync(process.execPath, [tsc, '-p', 'tsconfig.build.json'], { cwd: root, stdio: 'inherit' })

const distFiles = readdirSync(join(root, 'dist'), { recursive: true })
  .map((name) => `dist/${String(name).replaceAll('\\', '/')}`)
  .filter((name) => name.endsWith('.js'))
  .sort()

const entries = [...rootFiles, ...distFiles].map((name) => ({
  name,
  data: readFileSync(join(root, name)),
}))

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, createZip(entries))
console.log(`Wrote ${output} (${entries.length} files):`)
for (const { name } of entries) console.log(`  ${name}`)

function createZip(files) {
  const UTF8_NAMES = 0x0800
  const DEFLATE = 8
  // Fixed 1980-01-01 timestamp so identical inputs produce an identical archive.
  const DOS_DATE = (1 << 5) | 1

  const locals = []
  const centrals = []
  let offset = 0
  for (const { name, data } of files) {
    const nameBytes = Buffer.from(name, 'utf8')
    const compressed = deflateRawSync(data)
    const crc = crc32(data)

    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(UTF8_NAMES, 6)
    local.writeUInt16LE(DEFLATE, 8)
    local.writeUInt16LE(0, 10)
    local.writeUInt16LE(DOS_DATE, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBytes.length, 26)
    local.writeUInt16LE(0, 28)
    locals.push(local, nameBytes, compressed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(UTF8_NAMES, 8)
    central.writeUInt16LE(DEFLATE, 10)
    central.writeUInt16LE(0, 12)
    central.writeUInt16LE(DOS_DATE, 14)
    central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(compressed.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(nameBytes.length, 28)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBytes)

    offset += local.length + nameBytes.length + compressed.length
  }

  const centralSize = centrals.reduce((size, part) => size + part.length, 0)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(centralSize, 12)
  end.writeUInt32LE(offset, 16)

  return Buffer.concat([...locals, ...centrals, end])
}
