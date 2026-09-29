// Builds public/fukushi-kaigo-lp/assets/skills-2026-09.json from the AI skills catalogue's
// `window.SKILLS = [{ n, p, c, s, no, i, g, tc }, …]` data file (n=name, p=does, c=when,
// i=industry, g=group). Keeps only the 介護 / 障がい福祉 / 保育 groups, in that order, and in
// catalogue order inside each group.
//
// Usage: node scripts/fukushi-kaigo-lp/build-skills.mjs <path to the catalogue's search-data.js>
import { readFile, writeFile } from 'node:fs/promises';

const GROUPS = ['介護', '障がい福祉', '保育'];
const EXPECTED_COUNTS = { 介護: 368, 障がい福祉: 311, 保育: 172 };
const EXPECTED_TOTAL = 851;
const EXPECTED_INDUSTRIES = 12;

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error('Usage: node scripts/fukushi-kaigo-lp/build-skills.mjs <path to search-data.js>');
  process.exit(1);
}

const raw = await readFile(sourcePath, 'utf8');
const jsonText = raw.replace(/^\s*window\.SKILLS\s*=\s*/, '').replace(/;\s*$/, '');
const skills = JSON.parse(jsonText);

const byGroup = new Map(GROUPS.map((group) => [group, []]));
for (const row of skills) {
  const rows = byGroup.get(row.g);
  if (rows) rows.push([row.g, row.i, row.n, row.p, row.c]);
}

const rows = GROUPS.flatMap((group) => byGroup.get(group));

for (const group of GROUPS) {
  const count = byGroup.get(group).length;
  if (count !== EXPECTED_COUNTS[group]) {
    throw new Error(`${group}: expected ${EXPECTED_COUNTS[group]} rows, got ${count}`);
  }
}
if (rows.length !== EXPECTED_TOTAL) {
  throw new Error(`expected ${EXPECTED_TOTAL} rows total, got ${rows.length}`);
}
const industries = new Set(rows.map((row) => row[1]));
if (industries.size !== EXPECTED_INDUSTRIES) {
  throw new Error(`expected ${EXPECTED_INDUSTRIES} distinct industries, got ${industries.size}`);
}

const outputPath = new URL('../../public/fukushi-kaigo-lp/assets/skills-2026-09.json', import.meta.url);
await writeFile(outputPath, JSON.stringify(rows));
console.log(
  `wrote ${rows.length} rows (${GROUPS.map((group) => `${group} ${byGroup.get(group).length}`).join(' / ')}), ${industries.size} industries`,
);
