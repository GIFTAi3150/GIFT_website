import { compile } from 'html-to-text';

// Parse markup and decode entities once. The result is plain text for Notion,
// never HTML to be injected into a page.
const toText = compile({
  wordwrap: false,
  selectors: [
    { selector: 'a', options: { ignoreHref: true } },
    { selector: 'img', format: 'skip' },
    { selector: 'script', format: 'skip' },
    { selector: 'style', format: 'skip' },
  ],
});

export function feedText(value) {
  return toText(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}
