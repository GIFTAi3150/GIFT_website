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
