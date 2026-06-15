# GIFT Website — Structure Report

*Prepared 2026-06-12 · Status: current live site*

---

## Overview

The GIFT corporate website is a rebuild of the old WordPress site on a modern
framework (Next.js), deployed on Vercel. Every page shares the same **sticky
header navigation** and **footer**.

**Currently, 5 pages are reachable by users.** The header links Home, 会社概要
(ABOUT), 事業内容 (SERVICE → AIOps), and お問い合わせ (CONTACT); the footer adds
a link to the Privacy Policy. A number of additional pages are already built in
the codebase but are **not yet linked anywhere**, so users cannot navigate to
them — these are listed at the end of this report.

---

## Pages visible to users

### 1. Home — `/`

The brand landing page. A long, animated scroll that introduces who GIFT is and
what it does. Sections top to bottom:

1. **Hero** — animated 3D brand introduction (first thing visitors see).
2. **Who We Are** — the company's mission and core identity.
3. **Our Philosophy** — a scroll-pinned rotating "wheel" that holds in place
   while the user scrolls, presenting GIFT's guiding ideas.
4. **About** — an extended introduction to the company.
5. **AIOps** — a highlight of the AIOps business (links through to the full
   service page).
6. **Cases** — case-study / results showcase.
7. **How We Work** — a step-by-step process flow.

*(Several further sections — service list, works, members, recruit, news,
social — exist in the code but are intentionally hidden for now.)*

---

### 2. Company / 会社概要 — `/company`

A full company profile, with a distinct warm "bone + oxblood" palette. Sections
top to bottom:

1. **Hero** — animated headline with a column-wipe reveal effect.
2. **CEO Message / Mission** — *"関わるすべての人に、人生が変わるきっかけを贈る"*
   (Gift an opportunity), the founder's message, and the CEO's signature.
3. **Vision** — the editorial centrepiece statement: *"AIが当たり前の時代にこそ、
   人の心を動かす会社であり続ける"* (Move hearts, even in the age of AI).
4. **Values** — a dark feature card with 3 guiding values (学び / 共感 / 情熱)
   plus a "what we'll never do" block.
5. **Company Information** — the formal info table: company name, founding date,
   CEO, address, phone, business content, invoice number.
6. **Access** — office location shown with an interactive 3D globe and a
   "Open in Google Maps" button.
7. **CTA** — *"お気軽にお問い合わせください"* → links to the contact page.

*(A History / 沿革 timeline section is built but temporarily hidden.)*

---

### 3. AIOps Service / 事業内容 — `/services/dx-consulting`

GIFT's core service page, and currently the most elaborate page on the site — a
long-scroll, animated experience built entirely around **AIOps** (AI-driven
operations). Sections top to bottom:

1. **Hero** — large "AIOps." headline with the tagline *"Build it once. Run
   forever."*, a 3D animated visual, and scrolling Japanese keywords in the
   background.
2. **Intro** — *"Whatever you imagine, we'll make it run itself."* (interactive).
3. **Stats** — headline numbers: 50+ companies supported, 1,000+ hours
   automated, and an "Agent-Native" AI-first team.
4. **Four pillars** — the AIOps offering in 4 rotating cards:
   - AI agent design & build
   - Intelligent automation
   - LLM integration (RAG, fine-tuning)
   - AIOps monitoring & operations
5. **Customer pains** — *"こんなお悩み、ありませんか？"* (4 common problems) →
   resolved by AIOps.
6. **Features** — 6 capabilities: agent orchestration, RAG pipelines, tool/API
   integration, memory management, human-in-the-loop, and cost/audit logging.
7. **Agents in action** — 2 example results (a SaaS startup and a healthcare
   provider) plus what AIOps delivers.
8. **Our edge** — GIFT's differentiator: AI agents embedded in real day-to-day
   operations.
9. **Closing CTA** — *"Let's build."* → links to the contact page.

---

### 4. Contact / お問い合わせ — `/contact`

The inquiry page, with a dark navy background and floating animated rectangles.
Sections top to bottom:

1. **Hero** — "お問い合わせ" title.
2. **Form** (white card) — name, company name, email, phone, inquiry type
   (call center / AIOps / finance consulting / recruitment / other), message,
   and a privacy-policy consent checkbox. On successful send it shows an
   animated robot and a thank-you confirmation.
3. **Sidebar** — direct contact details (email, phone, address) and business
   hours (weekdays 9:00–18:00, JST).

---

### 5. Privacy Policy — `/privacy`

The legal page, linked from the footer. Dark navy hero over a light document
body. Content:

1. **Hero** — "個人情報に関する公表文" title.
2. **Body** — the full personal-information handling policy: purposes of use,
   data-handling tables, disclosure-request procedures, the formal privacy
   policy statement, and the contact window for complaints and inquiries.

---

## Technology Stack

**Core framework**
- **Next.js 14** (App Router) — React framework, server-rendered and statically
  optimized for speed
- **React 18** + **TypeScript** — UI library and type-safe code
- **Tailwind CSS** — styling system

**Interactive / 3D & animation**
- **Three.js** + **React Three Fiber** / **Drei** — the 3D visuals (hero
  visuals, the company globe, etc.)
- **GSAP** (+ ScrollTrigger) — scroll-driven animations
- **Lenis** — smooth scrolling
- **Lottie** & **Rive** — lightweight vector animations
- **cobe** — the interactive globe on the Company page
- **lucide-react** — interface icons

**Content & integrations**
- **Notion API** — content source for members, news, and job openings (editable
  by the team without touching code)
- **Resend** — contact-form email delivery
- **sharp** — image optimization

**Tooling & deployment**
- **TypeScript**, **ESLint**, **Prettier** — code quality
- **Playwright** — browser testing
- **Vercel** — hosting and continuous deployment

**One-line summary:** Built on Next.js 14 + React + TypeScript with Tailwind,
using Three.js/GSAP for interactive visuals, Notion as the content source, and
deployed on Vercel.

---

## Pages built but not currently displayed

These exist in the codebase but are **not linked in the site navigation, so they
are not shown to users** right now. They can be switched on later by adding them
to the navigation when ready.

- **Other service pages** — Call Center (`/services/callcenter`), Finance
  Consulting (`/services/finance-consulting`)
- **Members** — team directory and individual member profiles (`/member`)
- **News / Columns** — article listing and posts (`/news`)
- **Recruit** — careers page (`/recruit`)
- **Achievements** — company track record (`/achievements`)
- Internal development/preview pages (not intended for public use)
