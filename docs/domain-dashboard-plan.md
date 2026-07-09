# Domain + Dashboard Migration Plan

**Date:** 2026-07-09
**Goal:** Let the main domain `gift-inc.org` serve the **new website** (on Vercel), **without breaking the dashboard** the team uses every day.

---

## The situation

Right now the main domain `gift-inc.org` does three jobs at once:
1. Serves the **old WordPress** public homepage.
2. Serves the **dashboard** at `gift-inc.org/DashBoard/`.
3. Serves the dashboard's **backend API** (PHP + MySQL) on the same Sakura server.

Because all three share the one domain name, pointing that domain at Vercel (for the new site) also drags the dashboard away from Sakura — which is exactly what caused the outage on **2026-07-08** (the domain was flipped to Vercel while the dashboard still lived on it, so the team lost access).

## What the dashboard actually is (investigated 2026-07-09)

Good news — it is **not WordPress**, so it does not have WordPress's hard migration traps.

- **Front-end:** a custom **React app** (built with Vite), titled *"CallData Analysis"*, served as **plain static files** from the `/DashBoard/` folder on the Sakura server.
- **Data sources:** the **PHP + MySQL** database on Sakura, plus **Supabase** (cloud) and the **Google Sheets API** (cloud).
- **Key fact:** the app code contains **no hardcoded `gift-inc.org`** anywhere. This means the dashboard is **portable** — it will run under a different hostname without code changes.

## The idea (and it works)

Give the **dashboard its own subdomain** (`dashboard.gift-inc.org`) that stays on the Sakura server. Once the dashboard lives on its own name, the main domain is free to point at Vercel without touching the dashboard.

> **Important:** the dashboard **stays on Sakura**. It cannot move to Vercel — Vercel does not run PHP or host a MySQL database. The subdomain simply gives the dashboard its own address on the *same* Sakura server.

---

## The plan — 3 phases (order matters)

### Phase 1 — Give the dashboard its own subdomain (no risk; the main domain is untouched)
1. Add a DNS record: `dashboard.gift-inc.org` → Sakura (`133.242.249.108`).
2. Configure the Sakura vhost so the subdomain serves **both** the `/DashBoard/` React folder **and** the PHP `/api` backend.
3. Issue a free Let's Encrypt SSL certificate for the subdomain (Sakura supports this).

Because it is not WordPress and nothing hardcodes the domain, there is **no site-URL rewrite step** and no code change. During this phase the main domain still points at Sakura, so **nothing the team uses is affected**.

### Phase 2 — Test for a few days (~3 days)
- The team uses `dashboard.gift-inc.org` for real daily work.
- Verify: login, every page loads, data reads/writes to the PHP/MySQL DB work, Supabase features work, Google Sheets features work, SSL is valid.
- The main domain stays on Sakura the whole time, so the old `gift-inc.org/DashBoard/` still works as a **fallback**. If anything is wrong on the subdomain, the team simply keeps using the old URL — zero downtime.

> **One thing to be clear about:** the subdomain uses the **same Sakura database** as the live dashboard, so **it is the same data behind both URLs** — a change made through one appears in the other. This is fine for testing *"does it work from the new address"*. It is **not** an isolated sandbox. A truly isolated test copy would need a duplicated database (extra work, likely unnecessary here).

### Phase 3 — Only after the dashboard is confirmed working, point the main domain at Vercel
1. **First, lower the main domain's DNS TTL to ~300 seconds**, a day before the switch.
   *This is the direct fix for yesterday's slow recovery* — on 2026-07-08 the undo took about an hour because the TTL was 3600s (1 hour). With a low TTL, any undo takes minutes, not an hour.
2. Point the main domain (`gift-inc.org` apex + `www`) at Vercel.
3. The dashboard on `dashboard.gift-inc.org` keeps running on Sakura, **completely unaffected**, because it no longer depends on the main domain.
4. Add redirects on Vercel for any old WordPress URLs that need to keep working.

---

## Golden rules (these prevent a repeat of 2026-07-08)
- **Only ADD new subdomain records; never edit the main domain (`gift-inc.org`) or `www` during Phases 1–2.** Yesterday's outage was caused by editing the shared main domain.
- **The dashboard stays on Sakura.** The subdomain points at Sakura, never at Vercel.
- **Subdomain first, main-domain flip last.** Never flip the main domain before the dashboard has its own home.

## Things to confirm before we start
1. **Does the subdomain's Sakura vhost serve the PHP `/api` path too**, not just the React folder? (The person who administers Sakura needs to confirm/configure this.)
2. **Are the Google Sheets API key and Supabase origins locked to `gift-inc.org`?** If so, add the subdomain to their allowed list, or the cloud data features could fail on the new address.
3. **Is `new.gift-inc.org` (currently on Google Cloud) known/ours, or a stray deployment?** Unexplained so far.
4. **Do we have the exact Vercel DNS target values** for the main domain (from Vercel → Domains)? Needed for Phase 3.

## Appendix — why 2026-07-08 broke
- The main domain was pointed at Vercel **while the dashboard still lived on it**, so the dashboard became unreachable.
- Recovery took ~1 hour because the domain's DNS cache (TTL) was 3600s. **Fix:** lower the TTL before any switch (Phase 3, step 1).
- Separately, `www.gift-inc.org` currently serves a certificate (`*.sakura.ne.jp`) that does not cover it, so any `www` HTTPS visit shows a certificate error. Worth fixing on Sakura regardless of this plan.

---

*Note: this plan requires no DNS change to prepare. The domain freeze stays fully intact until the team agrees to run Phase 1.*
