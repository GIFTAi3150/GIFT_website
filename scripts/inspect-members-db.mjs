#!/usr/bin/env node
/**
 * Prints the column structure of the Notion Members DB so we can match
 * the seed script to the actual property names.
 *
 * Run:
 *   node scripts/inspect-members-db.mjs
 */

import { Client } from '@notionhq/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  console.error('Missing NOTION_API_KEY or NOTION_MEMBERS_DB_ID');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

const db = await notion.databases.retrieve({ database_id: NOTION_MEMBERS_DB_ID });

console.log('\n📋 Members DB columns:\n');
for (const [name, prop] of Object.entries(db.properties)) {
  console.log(`  • "${name}"  →  ${prop.type}`);
  if (prop.type === 'select' && prop.select?.options) {
    for (const opt of prop.select.options) {
      console.log(`        - ${opt.name}`);
    }
  }
}
console.log('');
