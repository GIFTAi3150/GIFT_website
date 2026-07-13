# Website — Monday Meeting Summary

## What it is
Rebuilding GIFT Inc's old WordPress site from scratch in **Next.js + TypeScript + Tailwind on Vercel**, reoriented around the company's core offering, **AIOps**.

## Current status
- New site is **already live** at `aiops.gift-inc.org` — running in parallel with the old WordPress site, **zero downtime**.
- Core pages built: Home, AIOps, About, Contact, DX, 404. Contact form working.
- Daily changes ship via the `dev` branch (auto-deploys to Vercel).

## The main topic (what happened last week)
Last week, pointing the domain to Vercel broke things — the old site has the **dashboard and other systems attached** to it that can't just be moved.

A full **migration** turned out too complex and risky, so we've switched to a **redirect approach**:
- Much simpler.
- Touches **nothing** on the old site (dashboard, blog, APIs all stay as they are).
- We just redirect visitors from the old site to the new one.

That plan is now **with the manager, waiting for go/no-go.** DNS is frozen until then.

## Other blockers
- Vercel org account connection — needs manager's Owner permission.
- Some About-page details (headcount, numbers) kept vague until exec sign-off.

## Next phase
There are other pages (**callcenter, etc.**) currently hidden — we're **waiting on confirmation whether those go into the next version.**

---

### One-sentence version
> A full domain migration was too complex because the dashboard/systems are tied to the old site, so we're going with a simple redirect to the new site instead (now awaiting manager approval) — and next up, we're waiting to hear if the hidden pages like callcenter get included in the next version.
