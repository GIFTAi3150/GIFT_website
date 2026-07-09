# Answers to the Domain-Switch Confirmation Questions

**Date:** 2026-07-09
**Re:** The manager's 5 questions about pointing the main domain (`gift-inc.org`) at Vercel

> Basis: this builds on `docs/domain-dashboard-plan.md` (the 3-phase migration plan). The domain freeze is intact — no DNS was changed to produce these answers (all checks were read-only).

---

## Question 1 — what happens to `new.gift-inc.org` when the main domain moves to Vercel

Short answer: **nothing happens to it — it keeps working exactly as it does now.**

The reason is that DNS records are independent, one per name. The main-domain switch only edits the **apex + www** records; every other subdomain is a separate record and is untouched:

| Name | Points to | Changed by the switch? |
|---|---|---|
| `gift-inc.org` (apex) | Sakura → **Vercel** | ✅ yes — this *is* the change |
| `www.gift-inc.org` | Sakura → **Vercel** | ✅ yes — this *is* the change |
| `new.gift-inc.org` | **Google Cloud** | ❌ no — separate record, untouched |
| `aiops.gift-inc.org` | Vercel (already live) | ❌ no — untouched |
| `dashboard.gift-inc.org` (planned) | Sakura | ❌ no — separate record |

`new.gift-inc.org` has its own record pointing at Google Cloud and does not rely on Sakura or the main domain at all, so it **stays live and unchanged** after the switch. (For clarity: it is a separate website on Google Cloud — a different build from our Vercel site — not our site showing through.)

**The only thing to be aware of (a decision, not a problem):** once the new main site is live on Vercel, there will be **two public "GIFT inc." sites at once** — the new main site (`gift-inc.org`, Vercel) and `new.gift-inc.org` (Google Cloud). That is technically fine and safe. The only question is whether you're **OK leaving `new.gift-inc.org` up** alongside the new main site, or would like it taken down / redirected at some point. Either way, **it does not block or affect the main-domain switch** — we can handle it separately whenever you decide.

---

## Question 2 — apex vs www / redirect policy

- **Recommend:** canonical = **apex (`gift-inc.org`)**, with **`www` → apex via 308 redirect.**
- **The 7/8 cert problem fixes itself on Vercel.** Vercel auto-issues valid certs for **both** apex and www, so the current mismatch (`*.sakura.ne.jp` not covering www) can't happen once www is on Vercel.
- **Measured today (FYI):** `www.gift-inc.org` still serves the mismatched cert and returns 403 over HTTPS. That's a Sakura-side state and disappears once www moves to Vercel.
- **Vercel setup:** point apex at Vercel, register www at Vercel too, then add the www→apex redirect. Apex is canonical because the brand URL, existing backlinks, and print collateral all use the bare domain.

---

## Question 3 — list of old WordPress URLs to preserve

Pulled every URL from the old `wp-sitemap.xml`. The old site is a **5-page brochure site** (no blog posts) + feed + dashboard. This is the complete redirect scope:

| Old URL | What it is | → New URL | Note |
|---|---|---|---|
| `/` | Home (株式会社GIFT) | `/` | Same path, new content — no redirect |
| `/about/` | Company profile | `/company` | 301 (clean match) |
| `/privacypolicy/` | Privacy policy | `/privacy` | 301 (clean match) |
| `/lstep/` | L-step service | **decision needed** | see below |
| `/lsteprpa/` | RPA L-step automation | **decision needed** | see below |
| `/feed/` | WordPress RSS feed | `/` (or leave 404) | No feed on new site. Low value. |
| `/DashBoard/` | Dashboard | `dashboard.gift-inc.org` | See Q5 — no rewrite |

**Decision needed:** `/lstep/` and `/lsteprpa/` were the old **core-business** pages and most likely to carry inbound links. The new site reoriented to **AIOps** and has no equivalent. Pick a target:
- **→ `/services/aiops`** (recommended if L-step is folded into AIOps — closest match: automation)
- **→ `/`** (safe default if L-step is retired)
- **New dedicated L-step page** (only if it's still an active service line)

**Completeness — we compiled this ourselves, no action needed from you:** the list above comes from the old `wp-sitemap.xml` **and** an independent crawl of every internal link on the old site; both agree, so it is the complete set of live old URLs. (External backlinks — who links in from *other* sites — would come from Google Search Console, but that is an SEO concern, not a redirect one; if it's ever wanted, the development side will check it directly. **The manager does not need to pull anything.**)

---

## ⚠️ Additional finding — a second WordPress site: SUPPORT 997

During a thorough check of the old domain (sitemap + full historical crawl + Google index), we found a **second, separate WordPress site** the migration plan had not accounted for:

- **URL:** `https://gift-inc.org/support997/`
- **What it is:** an owned-media blog, *"SUPPORT 997｜中小企業のためのお役立ちメディア"* — **48 how-to articles** (RPA, Excel, Google Drive, PowerPoint, OCR, DX, subsidies/workstyle), **49 URLs total**, still **live and actively maintained** (its sitemap regenerated on 2026-07-09).
- **Why it matters:** it lives under the apex on Sakura, **just like the dashboard did.** When the apex moves to Vercel, **all 49 `/support997/*` URLs will 404** unless we plan for them. How-to content typically carries the most search traffic and inbound links, so this may be the **highest-SEO-value content on the whole domain** — losing it silently would hurt.

**Decision needed on SUPPORT 997 before cutover:**

1. **Is it still wanted** as an active blog, or is it being wound down?
2. If **kept**, how to preserve it — our recommendation is its **own subdomain** on Sakura (e.g. `media.gift-inc.org`), the same pattern as the dashboard, with 301 redirects from the old `/support997/*` paths. (Because it's WordPress, this needs a one-time site-URL migration on the Sakura side.)
   - *Lower-effort alternative* (but re-couples apex↔Sakura): keep the URLs as-is via a Vercel proxy to Sakura.
   - *If the content is not being kept:* 301 everything to the new site.
3. If you have **Google Analytics** for it, its traffic numbers would show how much SEO value is at stake.

Until this is decided, `/support997/` is an **open blocker for the apex flip** — the same class of issue as the dashboard.

## Question 4 — cutover date + attendance window

The flip date is calculated backwards: **flip = Phase 1 (`dashboard.gift-inc.org` setup) complete + ~3-day test + TTL lowered the day before.** Once Phase 1 is done, the date is automatic. Here is the **proposed schedule, if the prerequisites below are met:**

| Date | Step |
|---|---|
| **Mon Jul 13** | Phase 1 — Sakura sets up `dashboard.gift-inc.org` (vhost + SSL). *If SUPPORT 997 is kept, set up its subdomain in parallel.* |
| **Tue Jul 14 – Thu Jul 16** | Phase 2 — ~3-day real-use test on the new subdomain (login, all pages, DB read/write). |
| **Fri Jul 17** | Lower the apex DNS TTL to 300s (safe to do early; makes rollback take minutes). |
| **Mon Jul 20, morning** | **Flip apex + www → Vercel.** Backup: Tue Jul 21. |

*Note: Mon Jul 20 is a Japanese public holiday (海の日), but the company operates that day, so we flip then. Both sides on standby 1–2h after the flip.*

**This schedule holds if:**
1. Decisions (apex policy, `/lstep` target, **SUPPORT 997 handling**) are confirmed **by Mon Jul 13**.
2. The Sakura admin can **start Phase 1 on Mon Jul 13**.
3. If SUPPORT 997 is kept, its preservation (subdomain migration) is included in Phases 1–2.
4. **Every staff member has confirmed their external APIs / integrations / external links do not depend on the main domain (`gift-inc.org`).** If even one integration still points at the main domain, it could break after the flip — so **we do not cut over until everyone has confirmed.**

**Honest note on the deadline:** **Mon Jul 20 is a target, not a commitment — it's only firm once all four conditions above (especially every team's external-integration check) are met.** If any slips, the flip slips by the same amount. A "this week" / "tomorrow" flip would mean cutting over untested — a high risk of repeating the 7/8 outage — so we don't recommend it. If there's a target launch date, tell us and we'll immediately say whether it fits this critical path.

---

## Question 5 — no rewrite for `gift-inc.org/DashBoard/`

**Agreed.** We will **not** create a Vercel rewrite/proxy from `gift-inc.org/DashBoard/` to Sakura — that re-coupling is exactly what caused 7/8.

**One thing to align on:** after the flip, Sakura no longer receives apex traffic, so the **old path `gift-inc.org/DashBoard/` will 404.** Therefore **all dashboard users/bookmarks must be moved to `dashboard.gift-inc.org` during Phase 2.**

- **Optional:** we *can* add a **301 redirect** `gift-inc.org/DashBoard/` → `dashboard.gift-inc.org` to save old bookmarks. That's a **redirect, not a rewrite** — it never touches Sakura and doesn't re-couple anything. If you'd prefer nothing there, it 404s. **Your call.**

---

## Decisions / actions needed (summary)

| # | Item | Type |
|---|---|---|
| 1 | Confirm you're **OK leaving `new.gift-inc.org` live** alongside the new main site (the switch does not affect it; we can retire/redirect it separately if you'd prefer just one public site) | confirm |
| 2 | Confirm **apex** as the canonical URL | confirm |
| 3 | **Redirect target** for `/lstep/` + `/lsteprpa/` (recommend `/services/aiops`) | decide (business) |
| 4 | **Schedule Phase 1** (Sakura subdomain) → then lock flip date | arrange |
| 5 | **Optional 301** for the old `/DashBoard/` path — yes/no | confirm |
| 6 | **SUPPORT 997** (`gift-inc.org/support997/`, separate WP blog, 49 URLs) — keep it? and how to preserve it (subdomain recommended) | decide |

## Golden rules (repeat — prevents a 7/8 repeat)
- During Phases 1–2, **only ADD the subdomain.** Never edit `gift-inc.org` or `www`.
- **Dashboard stays on Sakura.** Subdomain points at Sakura, never Vercel.
- **Subdomain first, main-domain flip last.**
