# AGENTS.md — Sessio (Minimal Session Timer)

Welcome to **Sessio** — an intentional, distraction-free to-do list timer engineered for high-focus work sessions. Built with **React 19**, **TypeScript**, **TailwindCSS**, and **Vite**, hosted on **Vercel** as a pure client-side application.

---

## 🚨 MANDATORY PRIMARY DIRECTIVE: The Anti-Bloat Tenet

> [!IMPORTANT]
> **Sessio is intentionally minimal. Any AI agent modifying this codebase MUST defend this simplicity.**
> 
> - **DO NOT** suggest or add cloud authentication, Firebase, user accounts, Supabase, or external databases.
> - **DO NOT** add subtasks, recursive checklists, project folders, tagging filters, or multiple lists.
> - **DO NOT** add gamification (points, streaks, XP, badges, confetti explosions).
> - **DO NOT** add heavy third-party audio packages, analytics trackers, or external CDN dependencies.
> 
> Every feature must serve one goal: **helping the user sit down, focus on a finite list of tasks for the current work session, and finish them.**

---

## 🏛️ Core Engineering Standards

### 1. Wall-Clock Timer Drift Resistance
`setInterval` and `setTimeout` are throttled aggressively by modern browsers when tabs are hidden or operating systems sleep:
- **Never** compute elapsed time simply by decrementing a counter by 1 every 1000ms.
- Always track a reference timestamp (`lastTick = Date.now()`). On every tick, compute:
  $$\Delta t = \text{Math.floor}((\text{now} - \text{lastTick}) / 1000)$$
- When the user returns to the tab after 10 minutes, the timer must accurately reflect the elapsed wall-clock time immediately.

### 2. Forgiving Negative Overrun Math
When remaining seconds reach `0`, the timer does NOT stop:
- The countdown continues into negative time ($-1, -2, -3\dots$).
- `formatTime(remainingSeconds)` must format positive values as `MM:SS` (or `HH:MM:SS`) and negative values as `-MM:SS` (or `-HH:MM:SS`).
- Progress percentage calculations for the SVG circular ring must clamp to $[0, 1]$ or enter the overtime state without producing `NaN`, SVG parsing crashes, or negative radius errors.

### 3. Dual ETA Projections
- **Active Task ETA**: $\text{now} + \text{remainingSeconds of active task}$.
- **Total Session ETA**: $\text{now} + \text{remainingSeconds of active task} + \sum(\text{duration of remaining incomplete tasks})$.
- Must update dynamically as tasks are checked off, added, or edited.

### 4. Zero-Asset Web Audio Chimes
- All sound effects (the 5-minute focus nudge and the session completion chime) are synthesized purely in memory using the native browser **Web Audio API** (`AudioContext`, `OscillatorNode`, `GainNode`).
- Zero external MP3/WAV assets, zero network latency, and zero broken audio file links.
- Always catch and respect browser autoplay policies (`AudioContext.state === 'suspended'`).

### 5. Local-First Zero-Crash Storage Hygiene
- Persist state to `localStorage` under a versioned key (`sessio_v1_state`).
- Wrap parsing in defensive `try / catch` blocks with fallback to default initial state.
- Never write `undefined` into localStorage payloads.

### 6. Design System & Accessibility
- Strict dual-mode support: **Daylight** (`#FBFBFA`) and **Obsidian** (`#121211`).
- All timer numbers must render with `tabular-nums` to eliminate jitter.
- Clear all destructive actions (like "Clear All Tasks") must require confirmation before execution.

---

## ⚡ Active Skills Quick Reference

| Skill | Trigger / When to Apply | Path |
|---|---|---|
| **`minimalist-software-standards`** | **Primary baseline for all development** in this repository. Anti-bloat rules, typing, storage hygiene. | [.agents/skills/minimalist-software-standards/SKILL.md](.agents/skills/minimalist-software-standards/SKILL.md) |
| **`timer-engine-standards`** | Timer math, drift-resistant wall clock logic, negative overrun calculations, Web Audio synthesis. | [.agents/skills/timer-engine-standards/SKILL.md](.agents/skills/timer-engine-standards/SKILL.md) |
| **`impeccable-timer-design`** | UI layout, circular SVG geometry, light/dark color tokens, tabular typography. | [.agents/skills/impeccable-timer-design/SKILL.md](.agents/skills/impeccable-timer-design/SKILL.md) |

---

## 🚀 Development Commands

- `npm run dev`: Boots local Vite dev server on `http://localhost:5173`.
- `npm run build`: Type-checks and builds production bundle (`tsc && vite build`).
- `npm run test`: Runs fast unit tests via Vitest (`vitest run`).
