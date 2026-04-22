#!/usr/bin/env node
/**
 * Seeds the GIFT Members Notion database with the 8 confirmed members from the
 * manager's hearing sheet (2026-04-21).
 *
 * SAFE TO RUN ONCE — re-running will create duplicate rows. To re-seed cleanly,
 * delete all rows from the Notion DB first.
 *
 * Run locally:
 *   node scripts/seed-members.mjs
 *
 * Env vars required:
 *   NOTION_API_KEY
 *   NOTION_MEMBERS_DB_ID
 */

import { Client } from '@notionhq/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Load .env.local ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath) && !process.env.NOTION_API_KEY) {
  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const { NOTION_API_KEY, NOTION_MEMBERS_DB_ID } = process.env;
if (!NOTION_API_KEY || !NOTION_MEMBERS_DB_ID) {
  console.error('❌ Missing NOTION_API_KEY or NOTION_MEMBERS_DB_ID in .env.local');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

const members = [
  { name: '川瀬 正悟', nameEn: 'Shogo Kawase', role: '代表取締役', department: '代表取締役', order: 1 },
  { name: '山口', nameEn: 'Yamaguchi', role: '取締役', department: '取締役', order: 2 },
  { name: '青山', nameEn: 'Aoyama', role: '取締役', department: '取締役', order: 3 },
  { name: '大橋', nameEn: 'Ohashi', role: 'プロジェクトマネージャー', department: 'DXAI事業部', order: 4 },
  { name: '大坂', nameEn: 'Osaka', role: 'プロジェクトマネージャー', department: 'DXAI事業部', order: 5 },
  { name: '中川', nameEn: 'Nakagawa', role: '事業部長', department: 'コールセンター事業部', order: 6 },
  { name: '伊藤', nameEn: 'Ito', role: '事業部長', department: 'コールセンター事業部', order: 7 },
  { name: '太田', nameEn: 'Ota', role: '事業部長', department: 'コールセンター事業部', order: 8 },
];

const BIO_PLACEHOLDER =
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

async function main() {
  console.log(`Seeding ${members.length} members into Notion DB ${NOTION_MEMBERS_DB_ID}...`);

  for (const m of members) {
    try {
      await notion.pages.create({
        parent: { database_id: NOTION_MEMBERS_DB_ID },
        properties: {
          Name: { title: [{ text: { content: m.name } }] },
          NameEn: { rich_text: [{ text: { content: m.nameEn } }] },
          Role: { rich_text: [{ text: { content: m.role } }] },
          Department: { select: { name: m.department } },
          Bio: { rich_text: [{ text: { content: BIO_PLACEHOLDER } }] },
          Order: { number: m.order },
          Published: { checkbox: true },
        },
      });
      console.log(`  ✓ ${m.name} (${m.department})`);
    } catch (err) {
      console.error(`  ✗ ${m.name} — ${err.message}`);
      console.error('     Hint: check that your column names exactly match: Name (Title), NameEn, Role, Department (Select), Bio, Order, Published');
      console.error('     And that Department has the Select option:', m.department);
    }
  }

  console.log('Done. Open Notion to verify.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
