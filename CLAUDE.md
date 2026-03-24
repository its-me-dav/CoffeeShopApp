# GRND Coffee App

A branded loyalty app for GRND Coffee Shop. Three core screens plus a leaderboard. The goal is to reward repeat customers and give them a reason to open the app daily.

---

## Screens

### 1. Home — Points Dashboard
- Greeting: "Good morning, [Name]"
- Large points balance display
- Subtext: "X points until your next reward"
- 10-day visit streak tracker (dot indicators, 1–10)
- Points earned based on spend amount
- Rewards threshold set by shop owner

### 2. Card — Digital Loyalty Card
- Dark card displaying user name + live points balance
- NFC tap to register visit and collect points
- QR code fallback if no NFC reader
- "Add to Apple/Google Wallet" button
- Status text: "Ready to Scan"

### 3. Game — GRND Jump
- Doodle Jump style, coffee bean mascot as player
- Starts at ground level showing the GRND coffee shop
- Player jumps upward on platforms
- Score displayed live (top of screen)
- Game over screen shows: final score, weekly high score, "Claim Weekly Prize" + "View Leaderboard" buttons

### 4. Leaderboard
- Weekly reset — tabs: Global / Friends / Weekly
- #1 wins free coffee, runners-up get discounts (10%, 25%, 50%)
- Current user row highlighted in accent colour
- Drives notifications and repeat visits

### Extra
- Daily spin the wheel mechanic (planned, not yet designed)

---

## Design System

### Visual Style
- Clean, minimal, warm
- Off-white/cream backgrounds
- Bold chunky display typography for headings
- Coffee bean mascot character used throughout (illustrated, friendly)
- Dark card for the loyalty card screen
- Bottom navigation: 3 tabs — Home, Card, Game

### Colours
- Background: off-white cream (`#F5F4EF`)
- Primary text / UI: near-black (`#1A1A1A`)
- Loyalty card background: dark (`#1C1C1E`)
- Accent / highlight: warm orange (`#F4A261`) — used for current user row, CTAs
- Muted text: medium grey

### Typography
- Display/headings: bold, heavy weight
- Body: clean sans-serif
- Points balance: very large, prominent

### Navigation
- Fixed bottom bar, 3 tabs: Home · Card · Game
- Simple icon + label

---

## Tech Stack
- Vite + React + TypeScript
- Tailwind CSS v4
- Shadcn/UI (components)
- Magic UI (animations)
- Motion (framer-motion replacement)

## Key Conventions
- Path alias: `@/` maps to `src/`
- Components go in `src/components/`
- UI primitives (Shadcn) in `src/components/ui/`
- Shared layout components (BottomNav etc.) in `src/components/layout/`
- Screens in `src/screens/`
- Custom hooks in `src/hooks/`
- Images/illustrations in `src/assets/images/`, icons in `src/assets/icons/`
- No backend yet — all screens use hardcoded dummy data
- Use Shadcn components for structure, Magic UI + Motion for animations
- Mobile-first, max-width 430px, everything centered in `#root`
- Font: Geist Variable (already imported via Shadcn setup)

## Current Build Status
- [ ] App shell + routing — done (React Router, 4 screens wired up)
- [ ] Bottom navigation — placeholder only
- [ ] Home screen — placeholder only
- [ ] Card screen — placeholder only
- [ ] Game screen — placeholder only
- [ ] Leaderboard screen — placeholder only
- [ ] Onboarding / auth screens — not started
- [ ] Daily spin the wheel — not started

## UI Design
- Designs are created in Pencil by the developer
- Screenshots shared per session before building each screen
- Do not invent UI — wait for design input before building a screen
