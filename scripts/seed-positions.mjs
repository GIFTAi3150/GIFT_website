#!/usr/bin/env node
/**
 * Seeds the GIFT Positions Notion database with the 4 confirmed roles from the
 * manager's hearing sheet (2026-04-21).
 *
 * Run locally:
 *   node scripts/seed-positions.mjs            # warns if existing rows found
 *   node scripts/seed-positions.mjs --clean    # archives all existing rows first, then seeds
 *
 * Env vars required:
 *   NOTION_API_KEY
 *   NOTION_POSITIONS_DB_ID
 *
 * Required Notion DB columns (case-sensitive):
 *   Job title               — Title
 *   Slug                    — Rich text
 *   Type                    — Select
 *   Department              — Select
 *   Summary                 — Rich text
 *   Tags                    — Multi-select
 *   URL                     — URL
 *   Published               — Checkbox
 *   Location                — Rich text  (new — call center detail)
 *   Wage                    — Rich text  (new — call center detail)
 *   Duties                  — Rich text  (new — call center detail)
 *   Support                 — Rich text  (new — call center detail)
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

const { NOTION_API_KEY, NOTION_POSITIONS_DB_ID } = process.env;
if (!NOTION_API_KEY || !NOTION_POSITIONS_DB_ID) {
  console.error('❌ Missing NOTION_API_KEY or NOTION_POSITIONS_DB_ID in .env.local');
  process.exit(1);
}

const clean = process.argv.includes('--clean');
const notion = new Client({ auth: NOTION_API_KEY });

const positions = [
  {
    title: 'コールセンタースタッフ',
    slug: 'call-center',
    type: 'アルバイト・パート',
    department: 'コールセンター事業部',
    summary:
      '光回線・法人営業のアウトバウンドコール業務。研修制度が充実しており、3名に社員1名の専属サポート体制で、未経験の方も安心して挑戦できます。',
    tags: ['未経験歓迎', '服装自由', '髪型自由', '日払い・週払い可', '週1日3h〜OK', '交通費全額支給'],
    url: 'https://liff.line.me/2007127169-4a6eZq1z/landing?follow=%40375ocpik&lp=5PKgQN&liff_id=2007127169-4a6eZq1z',
    location: '札幌市中央区南一条西9丁目',
    wage: '1,700〜3,000円',
    duties: 'アウトバウンドコール業務',
    support: '3名に社員1名の専属サポート',
  },
  {
    title: 'ITエンジニア',
    slug: 'it-engineer',
    type: 'ポジション単位募集（中途／新卒）',
    department: 'DXAI事業部',
    summary:
      '社内システム・自社プロダクトの開発、AI活用・DX推進を担うポジション。雇用形態は応募者の希望に合わせて個別に検討します。詳細は面談にてご案内します。',
    tags: ['AI活用', 'DX推進', '自社開発', '個別相談'],
    url: 'https://liff.line.me/2007127169-4a6eZq1z/landing?follow=%40375ocpik&lp=VxQDVD&liff_id=2007127169-4a6eZq1z',
  },
  {
    title: 'プロジェクトマネージャー',
    slug: 'project-manager',
    type: 'ポジション単位募集（中途／新卒）',
    department: 'DXAI事業部',
    summary:
      'DXAI事業部のプロジェクト推進を担うポジション。複数案件の進行管理とクライアント対応をリードします。詳細は面談にてご案内します。',
    tags: ['プロジェクト推進', '個別相談'],
    url: 'https://liff.line.me/2007127169-4a6eZq1z/landing?follow=%40375ocpik&lp=VxQDVD&liff_id=2007127169-4a6eZq1z',
  },
  {
    title: '法人営業 商談クローザー',
    slug: 'sales-closer',
    type: 'ポジション単位募集（中途／新卒）',
    department: '営業',
    summary:
      'オンライン対面営業を中心とした法人営業ポジション。商談クロージングを担っていただきます。詳細は面談にてご案内します。',
    tags: ['オンライン営業', '法人営業', '個別相談'],
    url: 'https://liff.line.me/2007127169-4a6eZq1z/landing?follow=%40375ocpik&lp=VxQDVD&liff_id=2007127169-4a6eZq1z',
  },
];

const richText = (s) => (s ? [{ text: { content: s } }] : []);

async function fetchAllRows() {
  const all = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: NOTION_POSITIONS_DB_ID,
      start_cursor: cursor,
    });
    all.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return all;
}

async function archiveAll(rows) {
  for (const row of rows) {
    await notion.pages.update({ page_id: row.id, archived: true });
    console.log(`  🗑  archived ${row.id}`);
  }
}

async function main() {
  const existing = await fetchAllRows();
  if (existing.length > 0) {
    if (clean) {
      console.log(`Found ${existing.length} existing row(s). Archiving with --clean...`);
      await archiveAll(existing);
    } else {
      console.warn(
        `⚠  Found ${existing.length} existing row(s) in the Notion positions DB.\n` +
          `   Re-running without --clean will create duplicates.\n` +
          `   Either delete those rows manually in Notion, or re-run with:\n` +
          `       node scripts/seed-positions.mjs --clean\n`,
      );
      process.exit(1);
    }
  }

  console.log(`Seeding ${positions.length} positions into Notion DB ${NOTION_POSITIONS_DB_ID}...`);

  for (const p of positions) {
    try {
      await notion.pages.create({
        parent: { database_id: NOTION_POSITIONS_DB_ID },
        properties: {
          'Job title': { title: [{ text: { content: p.title } }] },
          Slug: { rich_text: richText(p.slug) },
          Type: { select: { name: p.type } },
          Department: { select: { name: p.department } },
          Summary: { rich_text: richText(p.summary) },
          Tags: { multi_select: p.tags.map((name) => ({ name })) },
          URL: { url: p.url },
          Published: { checkbox: true },
          Location: { rich_text: richText(p.location || '') },
          Wage: { rich_text: richText(p.wage || '') },
          Duties: { rich_text: richText(p.duties || '') },
          Support: { rich_text: richText(p.support || '') },
        },
      });
      console.log(`  ✓ ${p.title} (${p.department})`);
    } catch (err) {
      console.error(`  ✗ ${p.title} — ${err.message}`);
      console.error(
        '     Hint: check that your column names exactly match:',
        'Job title (Title), Slug (rich_text), Type (Select), Department (Select), Summary (rich_text), Tags (multi_select), URL (url), Published (checkbox), Location (rich_text), Wage (rich_text), Duties (rich_text), Support (rich_text)',
      );
      console.error('     Also confirm Type and Department Select options exist:', p.type, '/', p.department);
    }
  }

  console.log('Done. Open Notion to verify.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
