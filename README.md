# ⏱️ Sessio — Minimal Session Timer

> A clean, distraction-free to-do list timer with zero bloat. Set up your tasks for the work session, run your countdowns, and get things done.

Inspired by the calm, single-session focus philosophies of *Llama Life* and *Pomofocus*, built for people who want to timebox their work without fighting complex project managers, subtasks, or cloud synchronization.

---

## ✨ Features

- **Circular Countdown Ring**: Elegant SVG timer centered on your screen with progress tracking and intuitive play, pause, reset, and skip controls.
- **Forgiving Negative Overrun**: When your timer hits `00:00`, it doesn't slam the brakes. It shifts to a warm overtime state and counts in negative seconds (`-02:15`), so you can wrap up your thought without losing momentum.
- **Dual Finish-Time Projections (ETAs)**:
  - 🎯 **Active Task ETA**: Displays exact real-world time your current task will finish (e.g. *Finishes at 3:45 PM*).
  - 📋 **Total Session ETA**: Computes when you will finish *all* remaining tasks in your queue (e.g. *Session finishes at 5:15 PM*).
- **5-Minute Focus Nudge Bell**: Toggleable per-task subtle chime that rings softly every 5 minutes using the browser's native Web Audio API to anchor wandering minds.
- **Obsidian Dark & Daylight Modes**: Curated high-contrast palettes designed for prolonged screen work day or night.
- **Single-Session Simplicity**:
  - Add tasks with title, estimated minutes, and short context descriptions.
  - Reorder, select active task, check off tasks, and clear all with a safe confirmation modal.
  - **100% Local-First**: No accounts, no cloud databases, no tracking. Stored securely in your browser's `localStorage`.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or pnpm / bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Unit Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

Sessio is architected as a pure client-side static application with zero server dependencies:

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Vite**.
5. Click **Deploy**.

---

## 🏛️ Project Structure

```
session-timer/
├── .agents/
│   └── skills/
│       ├── minimalist-software-standards/   # Anti-bloat, strict typing, storage hygiene
│       ├── timer-engine-standards/          # Drift compensation, overrun math, Web Audio
│       └── impeccable-timer-design/         # SVG geometry, tokens, tabular typography
├── src/
│   ├── components/
│   │   ├── Header.tsx                       # Session finish ETA, theme switcher, sound toggle
│   │   ├── TimerCircle.tsx                  # Circular SVG ring, clock, active task controls
│   │   ├── TaskList.tsx                     # Queue of tasks, active selector, add trigger
│   │   ├── TaskItem.tsx                     # Individual task card with 5-min chime toggle
│   │   ├── TaskModal.tsx                    # Add / edit task dialog
│   │   └── ClearConfirmModal.tsx            # Clear-all confirmation dialog
│   ├── hooks/
│   │   ├── useTimer.ts                      # Wall-clock drift-compensated timer hook
│   │   └── useTheme.ts                      # Daylight / Obsidian theme hook
│   ├── lib/
│   │   ├── sound.ts                         # Web Audio API synthetic bell synthesizer
│   │   ├── storage.ts                       # Versioned localStorage get/set
│   │   └── timeUtils.ts                     # Formatters, overrun calculations, ETA projections
│   ├── types.ts                             # Core TypeScript domain models
│   ├── App.tsx                              # Main application layout & state orchestrator
│   └── main.tsx                             # React 19 entrypoint
├── tests/
│   ├── timeUtils.test.ts                    # Unit tests for clock and ETA math
│   ├── timerEngine.test.ts                  # Unit tests for countdown and overrun logic
│   └── storage.test.ts                      # Unit tests for local storage serialization
├── AGENTS.md                                # AI pair programming instructions
├── PRODUCT.md                               # Full product and functional spec
├── DESIGN.md                                # Design tokens, wireframes, and styling rules
└── package.json
```

---

## 📄 License
MIT
