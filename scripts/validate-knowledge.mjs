#!/usr/bin/env node
/**
 * Validates knowledge/domain YAML files against knowledge/schema.json and checks
 * that knowledge/index.yaml and the domain files agree.
 * Exit 0 = valid, exit 1 = errors. Pass --quiet to print only failures.
 */

import Ajv from 'ajv'
import * as yaml from 'js-yaml'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const KNOWLEDGE_DIR = resolve(ROOT, 'knowledge')
const quiet = process.argv.includes('--quiet')

function collectYamlFiles(dir) {
  if (!existsSync(dir)) return []
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...collectYamlFiles(full))
    } else if (entry.endsWith('.yaml') || entry.endsWith('.yml')) {
      files.push(full)
    }
  }
  return files
}

const errors = []
const log = (message) => {
  if (!quiet) console.log(message)
}

function loadYaml(file) {
  try {
    return yaml.load(readFileSync(file, 'utf-8'), { filename: file })
  } catch {
    errors.push(`${relative(ROOT, file)} — YAML parse error`)
    return undefined
  }
}

const schema = JSON.parse(readFileSync(resolve(KNOWLEDGE_DIR, 'schema.json'), 'utf-8'))
const validate = new Ajv({ allErrors: false }).compile(schema)

const domainFiles = collectYamlFiles(resolve(KNOWLEDGE_DIR, 'domain'))
for (const file of domainFiles) {
  const parsed = loadYaml(file)
  if (parsed === undefined) continue
  if (validate(parsed)) {
    log(`✓ ${relative(ROOT, file)}`)
  } else {
    for (const error of validate.errors) {
      errors.push(`${relative(ROOT, file)} ${error.instancePath || '/'} — ${error.message}`)
    }
  }
}

const index = loadYaml(resolve(KNOWLEDGE_DIR, 'index.yaml'))
const sections = index?.sections ?? []
const indexed = new Set()
for (const section of sections) {
  const target = resolve(KNOWLEDGE_DIR, section.file ?? '')
  indexed.add(target)
  if (!section.id || !section.file) {
    errors.push(`knowledge/index.yaml — section needs "id" and "file": ${JSON.stringify(section)}`)
  } else if (!existsSync(target)) {
    errors.push(`knowledge/index.yaml — "${section.id}" points to missing file ${section.file}`)
  } else if (!section.always_load && !section.relevant_when && !section.description) {
    errors.push(
      `knowledge/index.yaml — "${section.id}" needs relevant_when, description, or always_load`,
    )
  }
}
for (const file of domainFiles) {
  if (!indexed.has(file))
    errors.push(`${relative(ROOT, file)} — not listed in knowledge/index.yaml`)
}

if (errors.length > 0) {
  for (const error of errors) console.error(`✗ ${error}`)
  console.error('\nKnowledge validation failed.')
  process.exit(1)
}
log('\nKnowledge files are valid.')
