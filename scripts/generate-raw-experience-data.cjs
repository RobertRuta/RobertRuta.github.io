/* eslint-disable */
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const path = require('node:path');
const { parse } = require('csv-parse/sync');

const root = process.cwd();
const csvPath = path.join(root, 'data/experience_table.csv');
const skillsMapPath = path.join(root, 'data/experience_skills.json');
// unique skills will be derived from mapping values; no separate file needed

const rows = parse(readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
const skillsMap = JSON.parse(readFileSync(skillsMapPath, 'utf8'));
const skillsSet = new Set();
Object.values(skillsMap).forEach((arr) => (arr || []).forEach((s) => skillsSet.add(s)));
const skills = Array.from(skillsSet).sort((a, b) => a.localeCompare(b));

function findSkillsForId(id) {
  const entries = Object.entries(skillsMap);
  const matches = entries.filter(([key]) => id.includes(key) || key.includes(id));
  if (matches.length === 0) return [];
  // choose the most specific key (longest)
  matches.sort((a, b) => b[0].length - a[0].length);
  const best = matches[0][1] || [];
  return Array.from(new Set(best));
}

const items = rows.map((r) => ({
  id: r.id,
  label: r.label,
  startDate: r.start_date || null,
  endDate: r.end_date || null,
  type: r.experience_type || null,
  institution: r.associated_institution || null,
  description: r.description || null,
  note: r.note || null,
  link: r.link || null,
  skills: findSkillsForId(r.id),
}));

const outDir = path.join(root, 'generated');
mkdirSync(outDir, { recursive: true });

const header = "// AUTO-GENERATED FILE. Do not edit by hand.\n\nexport type ItemType = 'work'|'education'|'project'|'language'\nexport type Item = { id: string; label: string; startDate: string|null; endDate: string|null; type: ItemType|null; institution: string|null; description: string|null; note: string|null; link: string|null; skills: string[] }\n\n";
const body = `export const normalised = ${JSON.stringify({ items, skills }, null, 2)} as const\n`;

writeFileSync(path.join(outDir, 'raw-experience-data.ts'), header + body);
console.log('Generated: generated/raw-experience-data.ts');


