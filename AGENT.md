# Agent Instructions — GRND Coffee App

This file is for remote agents working on this repo. Read this AND `CLAUDE.md` before doing anything.

---

## Who You Are
You are a software engineer working autonomously on the GRND Coffee App. You work from GitHub Issues, implement the requested change, and open a Pull Request for the developer to review.

## Permissions
Run with `bypassPermissions` mode — you are working autonomously and there is no one available to approve prompts. You have full access to read, write, edit files, and run git and npm commands.

## Environment Setup
After cloning the repo, always run this first:
```bash
npm install
```
This gives you access to all dependencies including:
- **Shadcn/UI** — components already copied into `src/components/ui/` (no install needed, they're in the repo)
- **Magic UI** — installed via npm, use `motion` for animations
- **Tailwind CSS v4** — configured via `@tailwindcss/vite` plugin
- **React Router** — for navigation between screens

## Sub-agents
Use your judgement — spawn sub-agents whenever you think it will get the job done faster or better. For example, building multiple independent components in parallel, or delegating a specific task like writing tests while you implement the feature. You are trusted to decide when sub-agents are appropriate.

## Before You Start
1. Run `npm install` to set up dependencies
2. Read `CLAUDE.md` for full project context, design system, and conventions
3. Read the GitHub Issue carefully — understand exactly what is being asked
4. Look at the existing code in the relevant screen or component before touching anything
5. Do not invent design decisions — only build what is described in the issue

## Your Workflow

### Step 1 — Understand before acting
- Read `CLAUDE.md` and this file fully
- Read the GitHub Issue and ask: what is actually being requested here?
- Identify what success looks like before writing a single line of code

### Step 2 — Plan
- Break the work into small, specific tasks (2–5 minutes each)
- Identify exactly which files will change and why
- If the issue is vague, make a safe assumption and note it — don't guess silently

### Step 3 — Implement
- Work through your plan one task at a time
- After each task, verify it works before moving to the next
- Follow all conventions in `CLAUDE.md` exactly

### Step 4 — Review your own work
- Re-read the original issue — did you actually solve it?
- Check that nothing else broke
- Make sure the code is clean and consistent with the rest of the project

### Step 5 — Ship
- Create a branch: `feature/issue-{NUMBER}-{short-slug}`
- Commit with a message like: `feat: implement home screen points dashboard (#12)`
- Open a Pull Request with:
  - Title referencing the issue
  - Summary of what was changed
  - The plan you followed
  - Any assumptions made
  - Notes on anything the developer should review or test
  - Reminder that Vercel will auto-generate a preview URL for this PR — the developer can view the changes live on their phone before merging

## Rules
- Never push directly to `master`
- Always open a PR — never merge your own work
- Use dummy/hardcoded data — there is no backend yet
- Follow the design system in `CLAUDE.md` exactly (colours, fonts, spacing)
- Use Shadcn for structure, Magic UI/Motion for animations
- Keep components small and focused
- If something in the issue is unclear, make a safe assumption and note it in the PR

## Stack Reminder
- Vite + React + TypeScript
- Tailwind CSS v4 (utility classes only, no custom CSS unless necessary)
- Shadcn/UI — components in `src/components/ui/`
- Magic UI + Motion — for animations
- Path alias: `@/` = `src/`
- React Router for navigation
