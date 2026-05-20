# GIFT_website

GIFT Inc corporate website — rebuild from WordPress to Next.js + Tailwind + TS, deployed on Vercel.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Vercel deploys

## Branching
- `main` → production
- `dev` → integration
- `features/devN` → working branches

## Working norms
- Dev environment is **PowerShell + Windows Node** on `C:\`. Do not switch to WSL — the boundary is too slow for this tree.
- The user runs all `git commit` / `git push` operations themselves. Agents should not run git write commands.
- Most session-persistent project context (palette gotchas, design decisions, rejected directions) lives in the user-level memory at `C:\Users\owner\.claude\projects\C--Users-owner-Desktop-GIFT-website\memory\` — consult `MEMORY.md` there before proposing new directions.

## Harness
- Plans / tasks: `Plans.md`
- Harness config: `harness.toml` + `.claude-plugin/`
- Run `harness doctor` to health-check the setup.
