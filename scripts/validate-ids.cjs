const fs = require('fs');
const path = require('path');

const repoRoot = __dirname ? path.join(__dirname, '..') : path.resolve('..');
const skillsPath = path.join(repoRoot, 'data', 'experience_skills.json');
const tablePath = path.join(repoRoot, 'data', 'experience_table.csv');

function exitWith(message) {
  console.error(message);
  process.exitCode = 1;
}

function parseCsvIds(csvContent) {
  const lines = csvContent.split(/\r?\n/).filter(Boolean);
  // Skip header
  const rows = lines.slice(1);
  const ids = new Set();
  for (const row of rows) {
    // ID is the first field before first comma; handle quoted fields elsewhere
    const firstComma = row.indexOf(',');
    if (firstComma === -1) continue;
    const id = row.slice(0, firstComma).trim();
    if (id) ids.add(id);
  }
  return ids;
}

(function main() {
  // Read files
  const skillsRaw = fs.readFileSync(skillsPath, 'utf8');
  const tableRaw = fs.readFileSync(tablePath, 'utf8');

  // Parse
  let skills;
  try {
    skills = JSON.parse(skillsRaw);
  } catch (e) {
    exitWith(`Invalid JSON at ${skillsPath}: ${e.message}`);
    return;
  }

  const skillsIds = new Set(Object.keys(skills));
  const tableIds = parseCsvIds(tableRaw);

  // Compute differences
  const missingInTable = [...skillsIds].filter((k) => !tableIds.has(k));
  const missingInSkills = [...tableIds].filter((k) => !skillsIds.has(k));

  const hasAny = missingInTable.length || missingInSkills.length;

  if (!hasAny) {
    console.log('OK: ids are consistent across experience_skills.json and experience_table.csv');
    return;
  }

  if (missingInTable.length) {
    console.error('Ids present in skills but missing from table:');
    for (const id of missingInTable) console.error(`  - ${id}`);
  }
  if (missingInSkills.length) {
    console.error('Ids present in table but missing from skills:');
    for (const id of missingInSkills) console.error(`  - ${id}`);
  }
  process.exitCode = 2;
})();
