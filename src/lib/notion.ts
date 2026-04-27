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
  giftView: string;
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

    const giftViewProp = props['GIFT View'] || props.GiftView || props.giftView;
    const giftView =
      giftViewProp?.type === 'rich_text'
        ? giftViewProp.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
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
      articles.push({ id: page.id, title, slug, category, date, author, cover, excerpt, body, giftView });
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
  url: string;
  details?: { label: string; value: string }[];
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

    const url =
      props.URL?.type === 'url'
        ? props.URL.url || ''
        : '';

    const readRichText = (key: string) =>
      props[key]?.type === 'rich_text'
        ? props[key].rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const detailFields: { key: string; label: string }[] = [
      { key: 'Location', label: '勤務地' },
      { key: 'Wage', label: '時給' },
      { key: 'Duties', label: '業務内容' },
      { key: 'Support', label: 'サポート体制' },
    ];

    const details = detailFields
      .map(({ key, label }) => ({ label, value: readRichText(key) }))
      .filter((d) => d.value);

    if (title && slug) {
      positions.push({
        id: page.id,
        title,
        slug,
        type,
        department,
        summary,
        tags,
        url,
        ...(details.length > 0 ? { details } : {}),
      });
    }
  }

  return positions;
}

// --- Members ---

const membersDbId = process.env.NOTION_MEMBERS_DB_ID!;

export interface Member {
  id: string; // url slug — derived from NameEn (last word lowercased), fallback to Notion page id
  notionId: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
  bio: string;
  order: number;
}

const slugify = (nameEn: string, fallback: string): string => {
  if (!nameEn) return fallback;
  const last = nameEn.trim().split(/\s+/).pop() || '';
  return last.toLowerCase() || fallback;
};

export async function getPublishedMembers(): Promise<Member[]> {
  if (!membersDbId) return [];

  const response = await notion.databases.query({
    database_id: membersDbId,
    filter: {
      property: 'Published',
      checkbox: { equals: true },
    },
    sorts: [{ property: 'Order', direction: 'ascending' }],
  });

  const members: Member[] = [];

  for (const page of response.results) {
    if (!('properties' in page)) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = page.properties as Record<string, any>;

    const name =
      props.Name?.type === 'title'
        ? props.Name.title.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const nameEn =
      props.NameEn?.type === 'rich_text'
        ? props.NameEn.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const role =
      props.Role?.type === 'rich_text'
        ? props.Role.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const department =
      props.Department?.type === 'select'
        ? props.Department.select?.name || ''
        : '';

    const bio =
      props.Bio?.type === 'rich_text'
        ? props.Bio.rich_text.map((t: { plain_text: string }) => t.plain_text).join('')
        : '';

    const order =
      props.Order?.type === 'number'
        ? props.Order.number || 0
        : 0;

    // Image — Files & Media (Notion-hosted or external) — fallback to male placeholder
    // (all 8 confirmed members are male; swap to a different default if a female member is added)
    let image = '/img/placeholder-gemini2.png';
    if (props.Image?.type === 'files' && props.Image.files.length > 0) {
      const file = props.Image.files[0];
      const url = file.type === 'external' ? file.external?.url : file.file?.url;
      if (url) image = url;
    } else if (props.Image?.type === 'url' && props.Image.url) {
      image = props.Image.url;
    }

    const id = slugify(nameEn, page.id);

    if (name) {
      members.push({ id, notionId: page.id, name, nameEn, role, department, image, bio, order });
    }
  }

  return members;
}

export async function getMemberById(id: string): Promise<Member | null> {
  const members = await getPublishedMembers();
  return members.find((m) => m.id === id) || null;
}
