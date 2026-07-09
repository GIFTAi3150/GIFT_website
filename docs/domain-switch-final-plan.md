# Domain Switch Plan

**Goal:** when someone visits `gift-inc.org`, they land on the new website — without touching the dashboard, the blog, any API, or the contact form, and without repeating the outage from 7/8.

This document explains what the plan is, why it's safe, and answers the technical questions that naturally come up around it.

---

## 1. What's already in place

- **Old-page redirects are already written and deployed.** `/about/` → `/company`, `/privacypolicy/` → `/privacy`, `/lstep/` and `/lsteprpa/` → `/services/aiops`. These live in the new site's own configuration and are already running on the current deployment.
- **The contact form doesn't depend on the domain.** It sends mail through `gift-original.jp`, a separate domain from `gift-inc.org`. Confirmed by reading the code directly — nothing about this plan touches it.
- **The approach is already proven.** `aiops.gift-inc.org` was set up the same way (add a new address, don't touch the main one) and has been running without issue since 2026-07-06.

---

## 2. The plan — 3 steps

| Step | What happens |
|---|---|
| 1 | Add a new address, `www.gift-inc.org`, pointing to the new site on Vercel. This only *adds* a DNS record — the existing `gift-inc.org` record is not touched. |
| 2 | Confirm `www.gift-inc.org` loads the new site correctly, with valid SSL. |
| 3 | Add one redirect rule on the current hosting: anyone who visits `gift-inc.org` (homepage) is sent to `www.gift-inc.org`. |

`/DashBoard/`, `/support997/` (the blog), and any API are not part of any of these three steps — they keep answering exactly as they do today, on the same server, unchanged.

The main domain's DNS is never edited. That's the reason this is safe: it's the same class of change (DNS record edit) that caused the 7/8 outage, and this plan avoids it entirely.

---

## 3. What happens to the old website

- **No visitor — including any client — can land on the old homepage anymore.** Once step 3 is live, every single request to `gift-inc.org` is redirected automatically and instantly to the new site. There is no way to browse to the old homepage from the outside; the redirect isn't optional or occasional, it fires on every visit.
- **The old files aren't deleted, only hidden behind the redirect.** They stay on the same server, untouched. This matters for one reason only: it makes the change trivially reversible (see Rollback) and means nothing has to be rebuilt or restored later if it's ever needed. It does not mean the old site is reachable by visitors — it isn't.
- **The blog (SUPPORT 997) and the dashboard are a separate case, on purpose.** Those aren't "leftover old site" — they're active, current, and meant to keep being publicly reachable at their own paths, exactly as they are today. They're simply excluded from the redirect rule, not hidden by it.

## 4. Frequently asked questions

**How does Vercel handle this?**
Vercel is already hosting the new site. Adding `www.gift-inc.org` is a one-time configuration step in the Vercel project settings — it doesn't require a code change or a redeploy. Once the matching DNS record is added, Vercel automatically issues (and later auto-renews) a valid SSL certificate for that address, the same way it already does for `aiops.gift-inc.org`.

**How does the redirect on the current hosting actually work?**
It's a small server-side rule scoped to a specific path — not a DNS change. In plain terms: "if someone requests the homepage (`/`), send them to `https://www.gift-inc.org/`." Because the rule only matches that one path, requests for `/DashBoard/`, `/support997/`, or the API never match it and are served exactly as before. Nothing about the domain's DNS changes in this step — only how the homepage request is handled.

**Could anything break?**
Going through the realistic risks:
- *Old inner pages* (`/lstep/`, `/about/`, etc.) — covered by adding a matching redirect rule for each, using the mapping already built and tested.
- *Email* — unaffected. This only changes how the homepage path responds; it does not touch mail (MX) records at all.
- *Certificates* — the current hosting keeps its own valid certificate for the initial request, and Vercel issues its own valid certificate for `www`. The specific problem from 7/8 (a certificate that didn't cover `www`) can't recur here, because Vercel's certificate covers `www` directly.
- *Anything pointing directly at old deep-page URLs* (print material, saved links) — worth a one-time check, but separate from this redirect and not a blocker to it.

**Will this hold up long-term, or is it a temporary patch?**
It's a standard, permanent pattern — plenty of companies run a bare-domain → `www` redirect indefinitely, not as a stopgap. Two things keep it maintenance-free: Vercel renews its own certificate automatically forever, and the redirect rule keeps working for as long as it exists, with no expiry. The one cosmetic effect is that the address bar shows `www.` after the redirect. If a fully bare `gift-inc.org` (no redirect at all) is ever wanted, that's a larger, separate project — moving the dashboard to its own address first, then pointing the main domain itself at the new site. That option stays open for later and isn't required for this plan to remain stable indefinitely.

---

## 5. Open items before step 3 goes live

- Confirm `www.gift-inc.org` as the new site's address. *(recommended)*
- Confirm whether to redirect the homepage only, or the old inner pages too. *(recommended: inner pages too — already built and ready)*
- Confirm where `/lstep/` and `/lsteprpa/` should point — `/services/aiops` *(recommended, already built)* or the homepage.
- **Business card QR code — resolved:** confirmed it opens the plain homepage, which is exactly the path that gets redirected. No reprint needed.

---

## 6. Sequence for 2026-07-10

1. Share this plan and collect answers to the open items above.
2. Once confirmed → step 1 (add the `www` DNS record). No visible change yet.
3. Verify step 2 (the new address loads correctly with valid SSL, and the existing redirects work on it too).
4. Step 3 (the homepage redirect rule goes live). This is the moment the change becomes visible to visitors.
5. Spend 30–60 minutes afterward checking the dashboard, blog, and contact form — expected to be unaffected, confirmed anyway.

---

## 7. Rollback

Remove the step 3 redirect rule. The homepage instantly serves the old site again, exactly as before — possible only because the old files were never deleted. (Leaving the step 1 DNS record in place afterward is harmless either way.)

---

## 8. What stays completely unchanged

- Dashboard (`gift-inc.org/DashBoard/`)
- Blog (`gift-inc.org/support997/`)
- Any API on the current hosting
- Contact form emails (`gift-original.jp`)
- `new.gift-inc.org` (separate site, separate DNS record)
- `aiops.gift-inc.org` (separate DNS record)

---

## 9. How to write the redirect rule correctly (implementation + verification)

This is the one step where a mistake could actually cause a problem — worth being precise about.

**The one mistake that would break everything:** a catch-all rule that redirects the whole domain (anything matching `gift-inc.org/*`) to `www.gift-inc.org`. That would also catch `/DashBoard/`, `/support997/`, and the API. Every rule here must be an **exact-path match** — never a wildcard.

**If the hosting uses Apache + `.htaccess`** (standard for this kind of WordPress rental-server setup, and the most likely case here):

```apache
# GIFT homepage redirect — place ABOVE the "# BEGIN WordPress" block
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/$
RewriteRule ^$ https://www.gift-inc.org/ [R=301,L]
```

If the inner-page redirects are approved too, add one exact-match line per path — never a wildcard:

```apache
RewriteRule ^about/?$ https://www.gift-inc.org/company [R=301,L]
RewriteRule ^privacypolicy/?$ https://www.gift-inc.org/privacy [R=301,L]
RewriteRule ^lstep/?$ https://www.gift-inc.org/services/aiops [R=301,L]
RewriteRule ^lsteprpa/?$ https://www.gift-inc.org/services/aiops [R=301,L]
```

These lines must sit **above** the `# BEGIN WordPress ... # END WordPress` block in `.htaccess`, so they're evaluated first and exit (the `[L]` flag) before WordPress's own routing takes over.

**If a WordPress redirect plugin is used instead** (e.g. "Redirection"): set the match type to **"Exact match"** — never "starts with" or a regex wildcard. One entry per path.

**Verification checklist — run this immediately before and right after Step 3:**

| Check | Expected result |
|---|---|
| `gift-inc.org/` | 301/308 redirect to `https://www.gift-inc.org/` |
| `gift-inc.org/DashBoard/` | 200 — loads normally, **no redirect** |
| `gift-inc.org/support997/` | 200 — loads normally, **no redirect** |
| Any API endpoint in use | Responds normally, **no redirect** |
| `www.gift-inc.org/` | 200 — new site, valid SSL padlock |

Fastest way to check: `curl -I <url>` shows just the response headers — look for `301`/`308` + a `Location:` header on the homepage, and plain `200` on everything else. No browser needed; all five checks take under a minute.

**If any "should be 200" row instead shows a redirect** — stop. That means the rule was written too broadly. Fix or remove it immediately; this is exactly the scenario Section 7 (Rollback) covers.
