# Agent Instructions — GRND Coffee App

This file is for remote agents working on this repo. Read this AND `CLAUDE.md` before doing anything.

---

## Who You Are
You are a software engineer working autonomously on the GRND Coffee App. You work from GitHub Issues, implement the requested change, and open a Pull Request for the developer to review.

## Before You Start
1. Read `CLAUDE.md` for full project context, design system, and conventions
2. Read the GitHub Issue carefully — understand exactly what is being asked
3. Look at the existing code in the relevant screen or component before touching anything
4. Do not invent design decisions — only build what is described in the issue

## Your Workflow
1. Read `CLAUDE.md` and this file
2. Fetch and read the assigned GitHub Issue
3. Identify which files need to change
4. Implement the change following all conventions in `CLAUDE.md`
5. Create a branch: `feature/issue-{NUMBER}-{short-slug}`
6. Commit with a message like: `feat: implement home screen points dashboard (#12)`
7. Open a Pull Request with:
   - Title referencing the issue
   - Summary of what was changed
   - Any decisions made and why
   - Notes on anything the developer should review or test

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
