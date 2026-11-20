import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

try {
  const input = JSON.parse(readFileSync(0, 'utf-8'))
  const filePath = input?.tool_input?.file_path
  if (typeof filePath === 'string' && filePath) {
    const isWindows = process.platform === 'win32'
    spawnSync(
      'pnpm',
      [
        'exec',
        'prettier',
        '--write',
        '--ignore-unknown',
        '--log-level',
        'silent',
        isWindows ? `"${filePath}"` : filePath,
      ],
      { cwd: projectDir, stdio: 'ignore', shell: isWindows },
    )
  }
} catch {
  // Formatting is best-effort; never block the edit.
}
