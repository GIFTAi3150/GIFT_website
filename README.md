# GIFT Inc. Corporate Website

Official corporate website for **株式会社GIFT (GIFT Inc.)** — rebuilt from WordPress to a modern Next.js stack and deployed on Vercel.

The site communicates GIFT's core business: **AIOps** — a consulting and implementation service that helps small-to-medium enterprises embed AI into their daily operations, covering learning, implementation, and long-term adoption.

---

## Pages

| Route | Content |
|---|---|
| `/` | Home — hero, philosophy wheel, about, AIOps overview, case studies |
| `/services/aiops` | AIOps service detail — 3-step roadmap (学習 → 実装 → 定着) |
| `/company` | Company overview — mission/vision/values, CEO message, history, access |
| `/news` | News & column articles (Notion-backed, ISR) |
| `/news/[slug]` | Individual article page |
| `/member` | Team member directory |
| `/member/[id]` | Individual member profile |
| `/recruit` | Recruitment page |
| `/achievements` | Case studies / achievements |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript 5.5 |
| Styling | Tailwind CSS 3.4 |
| 3D / WebGL | Three.js + React Three Fiber (`@react-three/fiber`, `@react-three/drei`) |
| Animation | GSAP 3, Lenis (smooth scroll), Lottie (`lottie-react`) |
| CMS | Notion API (`@notionhq/client`) — articles and member profiles |
| Email | Resend — contact form delivery |
| Deployment | Vercel |
| Testing | Playwright |
| Formatting | Prettier + `prettier-plugin-tailwindcss` |

---

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in your keys
cp .env.example .env.local
```

Required environment variables:

```
NOTION_API_KEY=        # Notion integration token
NOTION_ARTICLES_DB=    # Notion database ID for news articles
NOTION_MEMBERS_DB=     # Notion database ID for team members
RESEND_API_KEY=        # Resend API key for the contact form
```

### Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

### Production build (recommended for visual QA)

```bash
npm run build && npm run start
```

Use the production build to catch flash/flicker bugs that only appear after SSR optimizations — the dev server can mask them.

---

## Useful Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format all files |
| `npm run format:check` | Prettier check (CI) |
| `npm run check:encoding` | Detect mojibake in source files |
| `npm run fix:encoding` | Auto-fix mojibake |

---

## Branching Strategy

```
main           ← production (auto-deploys on Vercel)
dev            ← integration branch
features/devN  ← working feature branches
```

Pull requests target `dev`; `dev` is merged to `main` for releases.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router — one folder per route
│   ├── page.tsx          # Home page
│   ├── company/          # /company
│   ├── services/aiops/   # /services/aiops
│   ├── news/             # /news + /news/[slug]
│   ├── member/           # /member + /member/[id]
│   ├── contact/          # /contact
│   └── ...
├── components/
│   ├── layout/           # Navbar, Footer
│   ├── sections/         # Page-level section components
│   └── ui/               # Reusable UI primitives
├── data/                 # Static JSON (company info, fallback member data)
├── lib/                  # Notion client, utilities
└── styles/               # Global CSS

public/
├── images/
├── lottie/               # Lottie animation JSON files
└── ...
```

---

## Content Management

Articles and member profiles are managed in **Notion** and pulled at build time via ISR (Incremental Static Regeneration, 60-second revalidation window). No CMS login is needed to browse the site — content updates in Notion appear on the live site within one minute without a redeploy.

---

## License

Private repository — all rights reserved by 株式会社GIFT.
