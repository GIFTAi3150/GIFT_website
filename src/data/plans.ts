// The plan shown on /plans, and the source of the /contact deep-link pre-fill
// (see src/app/plans/_components/KhCta.tsx for the `/contact?plan=<slug>` link
// and src/app/contact/page.tsx for the lookup that turns a slug back into a
// pre-filled message).
//
// ⚠️ 2026-08-18: these are REAL, manager-supplied figures — not the invented
// placeholders this file used to carry. Editing them is a commercial change.
// The three old AIOps placeholder services (aiops-diagnosis / workflow-automation
// / data-utilization) were removed when /plans became the Knowledge Harness
// product page; a stale `?plan=` link to one of those slugs no longer matches and
// /contact simply leaves the message box empty, which is the intended fallback.
//
// Only `slug`, `label`, `name` and `summary` are read by anything live today —
// /contact's pre-fill.

export type Plan = {
  /**
   * Stable identifier used in the `/contact?plan=` deep link. Copy in the
   * other fields may be reworded freely, but changing a slug breaks any link
   * already in the wild.
   */
  slug: string;
  /** Mono label across the top of the card — the card's actual title. */
  label: string;
  /** Short Japanese service name. */
  name: string;
  /** One line of body copy. Opened panel only, and desktop only — there is no
   *  room for it on a phone-sized panel. */
  summary: string;
};

export const PLANS: Plan[] = [
  {
    slug: 'knowledge-harness',
    label: 'KNOWLEDGE HARNESS',
    name: 'ナレッジハーネス',
    summary:
      '社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。',
  },
];
