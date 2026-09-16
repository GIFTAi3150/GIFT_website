import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Serve the supplied standalone document without the shared React layout or styles.
// Keep this direct-link page out of the site's navigation and sitemap.
export const dynamic = 'force-static';

export async function GET() {
  const html = await readFile(path.join(process.cwd(), 'src/app/aiops-lp/index.html'), 'utf8');

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
