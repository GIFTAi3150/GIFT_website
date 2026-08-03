# GIFT_website

GIFT Inc corporate website — rebuild from WordPress to Next.js + Tailwind + TS, deployed on Vercel.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Vercel deploys

## Branching
- `main` → intended eventual production once the real domain (gift-inc.org) cuts over from the old WordPress site — not live yet
- `dev` → **this is the branch that actually matters right now.** Vercel auto-deploys it to `https://gift-website-git-dev-itgiftai-4573s-projects.vercel.app/`, which is the URL the user checks as "the website" day to day. Merging a PR into `dev` is enough to see a change live — don't assume a further `dev → main` merge is needed for the user to verify something. (Confirmed 2026-07-01.)
- `features/devN` → working branches

## Working norms
- Dev environment is **PowerShell + Windows Node** on `C:\`. Do not switch to WSL — the boundary is too slow for this tree.
- Agents may run `git add` / `git commit` / `git push` when the user explicitly asks in the moment. (Changed 2026-07-01 — previously agents were barred from all git write commands; the user lifted that restriction.)
- Most session-persistent project context (palette gotchas, design decisions, rejected directions) lives in the user-level memory at `C:\Users\owner\.claude\projects\C--Users-owner-Desktop-GIFT-website\memory\` — consult `MEMORY.md` there before proposing new directions.

## Design vs. execution — STANDING RULE
**The strong model designs. A cheaper model executes. Always, no exceptions.**
(User instruction, 2026-08-03. Restated here because it was being skipped in practice.)

- Opus does the design: the visual direction, the layout, the metaphor, the type
  scale, the motion concept, the tradeoff calls. It writes the spec.
- The spec goes in `docs/<feature>-<thing>.md` — complete enough that the
  executor never has to invent a design decision. Markup, CSS and any GSAP go in
  the spec as code, with the reasoning attached.
- Sonnet (the `executor` subagent) applies it, runs `tsc`/`build`, and reports.
  Its brief must stand alone — it cannot see the conversation.
- Opus reviews what comes back. Never rubber-stamp it. If the executor says it
  stopped rather than guessing, that is the system working.
- Only exception: a genuinely one-step mechanical edit where writing the brief
  costs more than the edit. That is not a licence to "just do it quickly" on
  anything with a design decision inside it.

## Cost discipline
- **Two-strike rule on direction iteration.** If the user rejects a creative/visual direction twice, stop iterating. Re-brief the problem before proposing a third variation. Past offenders to remember: DX hero warp tunnel, DX hero geometric shapes — these wasted multiple high-cost sessions before being killed. Check `MEMORY.md` rejected-direction notes before suggesting anything new.
- **Read before edit.** Before modifying a file, read it. Before changing a function, grep for callers. The healthy edit-to-read ratio is roughly 1 edit per 4 reads; if you are editing more than you are reading, slow down.
- **Prefer dedicated tools over Bash for routine operations.** Use Read (not `cat`/`head`/`tail`), Grep (not shell `grep`), Glob (not `ls`/`find`), and direct text output (not `echo`). Bash is for shell-only operations.
- **Reach for subagents on exploratory questions** so the main thread does not absorb broad search results that won't be touched again.

## Response style
- **Default to compressed answers.** Skip preambles, recaps of what was just asked, and pre-explanation of what you are about to do. Get to the point or the action.
- **No motivational filler.** Drop phrases like "Great question!", "Let me think...", "Here is what I found:". Just give the answer.
- **One-sentence status updates** between tool calls, not paragraphs. Use bullets only when there are 3+ discrete items.
- **Code, commit messages, and PR descriptions stay normal.** Compression applies to prose explanations to the user, not to artifacts.
- **User can ask for prose** by saying "explain", "walk me through", or "in detail" — switch back to normal English.

## Harness
- Plans / tasks: `Plans.md`
- Harness config: `harness.toml` + `.claude-plugin/`
- Run `harness doctor` to health-check the setup.
