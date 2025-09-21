/* eslint-disable */
const fs = require('fs')
const path = require('path')

function main() {
  const root = path.resolve(__dirname, '..')
  const srcFile = path.join(root, 'data', 'highlighted_experiences.txt')
  const outDir = path.join(root, 'generated')
  const outFile = path.join(outDir, 'highlighted.ts')

  let list = []
  try {
    console.log(`[generate-highlighted] Source: ${srcFile} exists=${fs.existsSync(srcFile)}`)
    const raw = fs.readFileSync(srcFile, 'utf8')
    console.log(`[generate-highlighted] Raw length: ${raw.length}`)
    list = raw
      .split(/\r?\n/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    console.log(`[generate-highlighted] Parsed IDs:`, list)
  } catch (err) {
    console.warn(`[generate-highlighted] Could not read ${srcFile}:`, err && err.message)
    // If file missing, emit empty list to keep imports valid
    list = []
  }

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const banner = `// AUTO-GENERATED FILE. Do not edit by hand.\n\n`;
  const body = `export const highlightedIds = ${JSON.stringify(list, null, 2)} as const\n`;
  fs.writeFileSync(outFile, banner + body, 'utf8')
  console.log(`[generate-highlighted] IDs: ${list.length} → ${outFile}`)
}

main()


