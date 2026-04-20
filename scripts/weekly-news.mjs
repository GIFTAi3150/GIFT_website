#!/usr/bin/env node
/**
 * Weekly news automation.
 * - Fetches headlines from verified RSS feeds (IT Media + Nikkei xTech + MarkeZine).
 * - Picks the newest item not already in the Notion news DB (dedupe by Source URL).
 * - Creates a Notion page as a DRAFT with title + short summary + source link.
 *
 * Runs via GitHub Actions weekly, or locally:
 *   node scripts/weekly-news.mjs
 *
 * Env vars required:
 *   NOTION_API_KEY
 *   NOTION_DATABASE_ID (news DB)
 */

import { Client } from '@notionhq/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// --- Load .env.local if running locally (GitHub Actions sets env directly) ---
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

const { NOTION_API_KEY, NOTION_DATABASE_ID } = process.env;
if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
  console.error('Missing NOTION_API_KEY or NOTION_DATABASE_ID');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });

// --- Feeds we've verified work, grouped by category so we can tag intelligently. ---
const FEEDS = [
  { url: 'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml',     category: 'AI活用',       source: 'IT media AI+' },
  { url: 'https://rss.itmedia.co.jp/rss/2.0/enterprise.xml', category: 'DXコンサル',   source: 'IT media Enterprise' },
  { url: 'https://rss.itmedia.co.jp/rss/2.0/topstory.xml',   category: 'DXコンサル',   source: 'IT media' },
  { url: 'https://markezine.jp/rss/new/20/index.xml',         category: 'LINE・Lステップ', source: 'MarkeZine' },
  { url: 'https://xtech.nikkei.com/rss/xtech-it.rdf',         category: 'AI活用',       source: '日経xTech IT' },
];

const COVER_BY_CATEGORY = {
  'DXコンサル':       'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
  'LINE・Lステップ':  'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=1200&q=80',
  'RPA・自動化':      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
  'AI活用':           'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  '財務コンサル':     'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80',
  'コールセンター':   'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
};

// --- Very small XML item parser (RSS 2.0 + RDF) ---
// Extracts title/link/description from <item>...</item> blocks.
function parseFeed(xml) {
  const items = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = unescapeXml(firstMatch(block, /<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i));
    const link  = unescapeXml(firstMatch(block, /<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i));
    const desc  = unescapeXml(firstMatch(block, /<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i));
    const date  = firstMatch(block, /<(?:pubDate|dc:date)[^>]*>([\s\S]*?)<\/(?:pubDate|dc:date)>/i);
    if (title && link) items.push({ title: title.trim(), link: link.trim(), description: (desc || '').trim(), date: date?.trim() || '' });
  }
  return items;
}
function firstMatch(s, re) { const m = s.match(re); return m ? m[1] : ''; }
function unescapeXml(s) {
  return (s || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// --- Fetch all feeds in parallel; return flat item list with category/source attached ---
async function fetchAllItems() {
  const results = await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, { signal: AbortSignal.timeout(10_000) });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseFeed(xml).map(item => ({ ...item, category: feed.category, source: feed.source }));
      } catch (err) {
        console.warn(`[warn] fetch failed for ${feed.url}: ${err.message}`);
        return [];
      }
    })
  );
  return results.flat();
}

// --- Look up all Source URLs already in the Notion DB so we don't re-post ---
async function fetchExistingSourceUrls() {
  const seen = new Set();
  let cursor = undefined;
  do {
    const resp = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const page of resp.results) {
      const url = page.properties?.['Source URL']?.url;
      if (url) seen.add(url);
    }
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return seen;
}

// --- Build a URL-safe slug from the source URL + date ---
function slugify(url, date) {
  const last = url.replace(/\/$/, '').split('/').pop() || '';
  const stem = last.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase().slice(0, 40);
  return `${date}-${stem || 'news'}`;
}

// --- Relevance scoring — higher = more aligned with GIFT's audience (SMBs, DX, AI). ---
const KEYWORDS_HIGH = [
  'AI', '生成AI', 'ChatGPT', 'Claude', 'Copilot', 'Gemini', 'エージェント',
  'DX', 'デジタル', 'デジタル化', '中小企業', 'スタートアップ',
  '業務', '業務効率', '業務改革', '経営', '経営者', '生産性',
  '自動化', 'RPA', 'ノーコード', 'ローコード',
  'LINE', 'Lステップ', 'コンサル',
];
const KEYWORDS_MEDIUM = [
  'セキュリティ', 'サイバー', 'テレワーク', 'リモート',
  '融資', '資金調達', '財務', 'データ分析', '効率化',
  'クラウド', 'SaaS', 'マーケティング',
];
const KEYWORDS_NEGATIVE = [
  'ロボット', 'マラソン', 'ゲーム', 'エンタメ', 'スポーツ',
  '漫画', 'アニメ', '芸能', '映画', '音楽',
];

function scoreItem(item) {
  const text = `${item.title} ${item.description}`;
  let score = 0;
  for (const kw of KEYWORDS_HIGH)     if (text.includes(kw)) score += 3;
  for (const kw of KEYWORDS_MEDIUM)   if (text.includes(kw)) score += 1;
  for (const kw of KEYWORDS_NEGATIVE) if (text.includes(kw)) score -= 5;
  return score;
}

// --- Main ---
async function main() {
  console.log('Fetching feeds...');
  const items = await fetchAllItems();
  console.log(`Total items fetched: ${items.length}`);
  if (items.length === 0) {
    console.error('ABORT: no items from any feed');
    process.exit(2);
  }

  console.log('Checking existing Notion entries...');
  const seen = await fetchExistingSourceUrls();
  console.log(`Existing Source URLs in DB: ${seen.size}`);

  const fresh = items.filter(item => !seen.has(item.link));
  console.log(`Fresh items (not yet in DB): ${fresh.length}`);
  if (fresh.length === 0) {
    console.log('No new items to post this week.');
    return;
  }

  // Score each fresh item for relevance to GIFT's audience (SMBs, DX, AI).
  // Pick the highest-scoring item. On ties, earliest feed wins (stable sort).
  const ranked = fresh
    .map((item, idx) => ({ item, score: scoreItem(item), idx }))
    .sort((a, b) => b.score - a.score || a.idx - b.idx);

  console.log('\nTop 3 candidates:');
  for (const r of ranked.slice(0, 3)) {
    console.log(`  [score=${r.score}] ${r.item.title.slice(0, 60)}`);
  }

  const chosen = ranked[0].item;
  const today = new Date().toISOString().slice(0, 10);
  const slug = slugify(chosen.link, today);
  const cover = COVER_BY_CATEGORY[chosen.category] || COVER_BY_CATEGORY['DXコンサル'];
  const summary = chosen.description || `${chosen.source}が報じた最新ニュースです。詳細はリンクからご確認ください。`;

  console.log('\nChosen item:');
  console.log('  title:   ', chosen.title);
  console.log('  source:  ', chosen.source);
  console.log('  category:', chosen.category);
  console.log('  link:    ', chosen.link);

  const para = (text) => ({
    object: 'block', type: 'paragraph',
    paragraph: { rich_text: [{ type: 'text', text: { content: text } }] },
  });

  const blocks = [
    para(`${chosen.source}の最新ニュースをピックアップしました。`),
    para(summary.slice(0, 1800)),
    para('詳しい内容は下記のリンクからご確認ください。'),
    para(`出典: ${chosen.link}`),
  ];

  const res = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      Title:         { title: [{ text: { content: chosen.title.slice(0, 200) } }] },
      Slug:          { rich_text: [{ text: { content: slug } }] },
      Category:      { select: { name: chosen.category } },
      Date:          { date: { start: today } },
      Author:        { rich_text: [{ text: { content: 'GIFT' } }] },
      Cover:         { url: cover },
      'Source URL':  { url: chosen.link },
      Published:     { checkbox: false },
    },
    children: blocks,
  });

  console.log(`\nCREATED: ${res.id}`);
  console.log(`Draft saved in Notion for ${today}. Review it and flip Published to publish.`);
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
