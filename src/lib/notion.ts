import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID!;

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  author: string;
  cover: string;
  excerpt: string;
  body: string;
}

export async function getPublishedArticles(): Promise<BlogArticle[]> {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
  });

  const articles: BlogArticle[] = [];

  for (const page of response.results) {
    if (!('properties' in page)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = page.properties as Record<string, any>;

    const title =
      props.Title?.type === 'title'
        ? props.Title.title.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const slug =
      props.Slug?.type === 'rich_text'
        ? props.Slug.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const category =
      props.Category?.type === 'select'
        ? props.Category.select?.name || ''
        : '';

    const date =
      props.Date?.type === 'date'
        ? props.Date.date?.start || ''
        : '';

    const author =
      props.Author?.type === 'rich_text'
        ? props.Author.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const cover =
      props.Cover?.type === 'url'
        ? props.Cover.url || ''
        : '';

    // Fetch page content as body
    const blocks = await notion.blocks.children.list({ block_id: page.id });
    let body = '';
    let excerpt = '';

    const getText = (richText: { plain_text: string }[]) =>
      richText.map((t) => t.plain_text).join('');

    for (const block of blocks.results) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const b = block as any;
      if (!b.type) continue;

      if (b.type === 'paragraph' && b.paragraph?.rich_text?.length > 0) {
        body += getText(b.paragraph.rich_text) + '\n\n';
      } else if (b.type === 'heading_1' && b.heading_1?.rich_text?.length > 0) {
        body += `# ${getText(b.heading_1.rich_text)}\n\n`;
      } else if (b.type === 'heading_2' && b.heading_2?.rich_text?.length > 0) {
        body += `## ${getText(b.heading_2.rich_text)}\n\n`;
      } else if (b.type === 'heading_3' && b.heading_3?.rich_text?.length > 0) {
        body += `### ${getText(b.heading_3.rich_text)}\n\n`;
      } else if (b.type === 'bulleted_list_item' && b.bulleted_list_item?.rich_text?.length > 0) {
        body += `- ${getText(b.bulleted_list_item.rich_text)}\n`;
      } else if (b.type === 'numbered_list_item' && b.numbered_list_item?.rich_text?.length > 0) {
        body += `1. ${getText(b.numbered_list_item.rich_text)}\n`;
      }
    }

    body = body.trim();
    excerpt = body.slice(0, 120).replace(/\n/g, ' ');
    if (body.length > 120) excerpt += '…';

    if (title && slug) {
      articles.push({ id: page.id, title, slug, category, date, author, cover, excerpt, body });
    }
  }

  return articles;
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const articles = await getPublishedArticles();
  return articles.find((a) => a.slug === slug) || null;
}

// --- Job Positions ---

const positionsDbId = process.env.NOTION_POSITIONS_DB_ID!;

export interface JobPosition {
  id: string;
  title: string;
  slug: string;
  type: string;
  department: string;
  summary: string;
  tags: string[];
}

export async function getPublishedPositions(): Promise<JobPosition[]> {
  const response = await notion.databases.query({
    database_id: positionsDbId,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
  });

  const positions: JobPosition[] = [];

  for (const page of response.results) {
    if (!('properties' in page)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = page.properties as Record<string, any>;

    // Title column may be named "Title" or "Job title"
    const titleProp = props.Title || props['Job title'];
    const title =
      titleProp?.type === 'title'
        ? titleProp.title.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const slug =
      props.Slug?.type === 'rich_text'
        ? props.Slug.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const type =
      props.Type?.type === 'select'
        ? props.Type.select?.name || ''
        : '';

    const department =
      props.Department?.type === 'select'
        ? props.Department.select?.name || ''
        : '';

    const summary =
      props.Summary?.type === 'rich_text'
        ? props.Summary.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const tags =
      props.Tags?.type === 'multi_select'
        ? props.Tags.multi_select.map((t: { name: string }) => t.name)
        : [];

    if (title && slug) {
      positions.push({ id: page.id, title, slug, type, department, summary, tags });
    }
  }

  return positions;
}
