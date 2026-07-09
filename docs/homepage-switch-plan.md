# Homepage Switch Plan — the simple, low-risk way

**Date:** 2026-07-09
**Goal:** When someone visits `gift-inc.org`, show them the **new website** — **without touching the dashboard**, and **without repeating the 7/8 outage.**

---

## The idea in one picture

Think of `gift-inc.org` like a **building address**. Everything sits inside that one building: the homepage, the dashboard, and the blog.

- If we *move the whole address* to the new site (point the domain at Vercel), **everything moves with it** — the dashboard disappears too. That is what broke on **7/8**.
- Instead, we leave the building exactly where it is and just put a **sign at the front door**: "visitors → go to the new site." The dashboard and blog stay untouched inside.

That "sign at the front door" is a simple **redirect**. It is the safest way to get what we want.

---

## Where things live (nothing moves)

| Thing | Where it runs | Changes in this plan? |
|---|---|---|
| **New website** | **Vercel** (already deployed, auto-updates) | No — stays on Vercel |
| **Dashboard** (`/DashBoard/`) + its database | **Sakura server** | No — untouched |
| **Blog** (`/support997/`) | **Sakura server** | No — untouched |
| **`gift-inc.org` homepage** | Sakura (old WordPress) | Front door redirects to the new site |

The new site is **not re-deployed or moved**. It stays on Vercel the whole time. Sakura simply forwards homepage visitors to it.

---

## What we actually do — 3 steps

### Step 1 — Give the new site a `gift-inc.org` address (safe: only ADD, never edit)
- Add a small DNS record so `www.gift-inc.org` points to the new site on Vercel.
- This is the **exact same 2-step we already did for `aiops.gift-inc.org`** — proven and low-risk.
- We do **not** touch the main `gift-inc.org` record or the dashboard. This step alone changes nothing visitors see.

### Step 2 — Test the new address (~1 day)
- Open `www.gift-inc.org`, confirm the new site loads with a valid padlock (SSL).
- The dashboard and blog are unaffected because we never touched them.

### Step 3 — Put up the "front door sign" (the redirect)
- On Sakura, add **one rule**: when someone comes to `gift-inc.org`, send them to the new site (`www.gift-inc.org`).
- Leave `/DashBoard/`, `/support997/`, and the API **alone** — they keep working exactly as now.
- **No DNS change to the main domain.** This is why it is far safer than 7/8.

---

## What happens to the old website?

- The old WordPress site is **not deleted** — all files stay on Sakura, fully intact.
- It is simply **hidden behind the new one**: the front door now leads to the new site.
- **Fully reversible:** delete the one redirect rule and the old site is instantly back, as if nothing happened.

---

## Will the QR code on the business card work?

- If the QR points to `gift-inc.org` (the homepage) → **yes, it will land on the new site.** No reprint needed. ✅
- If it points to a deeper page (e.g. `gift-inc.org/about/`) → it works **if** we also redirect that page (easy — it is part of the same setup).
- **Action:** tell us the exact address the QR opens, and we will confirm.

---

## Risk & why this is the safe choice

- **No DNS flip on the main domain** → the 7/8 failure mode cannot happen.
- The dashboard is **never touched**, so it cannot go down.
- **Reversible in seconds.**
- Respects the golden rule from the freeze: *only ADD a subdomain, never edit the main `gift-inc.org` record.*

**One honest tradeoff:** after the redirect, the address bar shows `www.gift-inc.org` (this is normal — many companies send the bare domain to `www.`). If, later, you want the bare `gift-inc.org` to *truly be* the new site with no redirect, that is the bigger project (move the dashboard to its own subdomain first, then flip the main domain). We can do that later — there is no rush, and this plan does not block it.

---

## Decisions we need from the manager

1. **Address name:** use `www.gift-inc.org` for the new site? (recommended — standard and clean)
2. **Redirect scope:** just the homepage, or the old inner pages too (`/about/`, `/privacypolicy/`, etc.)?
   *Recommendation: redirect the inner pages too, so no old page ever peeks through. We already have the full list.*
3. **Old business pages** `/lstep/` + `/lsteprpa/`: where should they go? *(recommend → `/services/aiops`, or → homepage)*
4. **QR code:** what exact address does the business-card QR open?

## What we need from the Sakura admin
- Add the DNS record for `www.gift-inc.org` → Vercel (Step 1).
- Add the homepage redirect rule (Step 3).
- Leave `/DashBoard/`, `/support997/`, and `/api` untouched.

---

*This plan changes no DNS on the main domain and is reversible at every step. The dashboard is never at risk.*
