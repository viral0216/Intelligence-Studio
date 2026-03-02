/**
 * Generate API catalog export files (Postman, OpenAPI, Insomnia) to disk.
 *
 * Usage:
 *   npx tsx scripts/generate-catalog-exports.ts [output-dir]
 *
 * Defaults to writing files in the current working directory.
 * Used by CI to attach export files to GitHub Releases.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { buildPostmanCollection, buildOpenAPISpec, buildInsomniaExport } from '../frontend/src/lib/catalogExport'

const outDir = process.argv[2] || '.'
mkdirSync(outDir, { recursive: true })

const files: [string, unknown][] = [
  ['databricks-api.postman_collection.json', buildPostmanCollection()],
  ['databricks-api.openapi.json', buildOpenAPISpec()],
  ['databricks-api.insomnia.json', buildInsomniaExport()],
]

for (const [name, data] of files) {
  const path = join(outDir, name)
  writeFileSync(path, JSON.stringify(data, null, 2))
  console.log(`  ✓ ${name}`)
}

console.log(`\nGenerated ${files.length} export files in ${outDir}`)
