#!/usr/bin/env node
/**
 * Runs the repo checks in parallel and prints only the failing ones.
 * Usage: node scripts/check.mjs <changed|all>
 */

import { spawn } from 'node:child_process'

const mode = process.argv[2]
if (mode !== 'changed' && mode !== 'all') {
  console.error('Usage: node scripts/check.mjs <changed|all>')
  process.exit(2)
}

const tasks = [
  'typecheck',
  'format:check',
  'lint:check',
  'lint:css',
  'knowledge:validate:run',
  mode === 'changed' ? 'test:changed' : 'test:quiet',
]

const TAIL_LINES = 80

function run(script) {
  return new Promise((resolve) => {
    const child = spawn('pnpm', ['run', '--silent', script], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk))
    child.stderr.on('data', (chunk) => (output += chunk))
    child.on('error', (error) => resolve({ script, code: 1, output: String(error) }))
    child.on('close', (code) => resolve({ script, code: code ?? 1, output }))
  })
}

const results = await Promise.all(tasks.map(run))
const failures = results.filter((result) => result.code !== 0)

for (const { script, output } of failures) {
  const tail = output.trimEnd().split('\n').slice(-TAIL_LINES).join('\n')
  console.error(`\n✗ ${script}\n${tail}`)
}

if (failures.length > 0) {
  console.error(
    `\n${failures.length}/${tasks.length} checks failed: ${failures.map((f) => f.script).join(', ')}`,
  )
  process.exit(1)
}
console.log(`All ${tasks.length} checks passed (${mode}).`)
