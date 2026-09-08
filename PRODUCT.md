# PRODUCT.md — Sessio (Minimal Session Timer)

> **"A clean, single-session to-do list timer with zero bloat."**  
> Inspired by the focus philosophies of *Llama Life*, *Pomofocus*, and *Timeboxing*.

---

## 1. Product Philosophy & Core Tenets

1. **Session-Bound, Not a Life Manager**:
   - Sessio is not an all-in-one productivity suite, project management tool, or recurring habit tracker.
   - It is designed to be opened when you sit down for a work session (e.g. 2 hours in the morning or an evening sprint). You add the 3 to 6 tasks you intend to finish right now, run the timers, finish the session, and close the tab.
2. **Zero Cloud, Zero Auth**:
   - No login screens, no backend databases, no network sync delays, and no server crashes.
   - Everything runs client-side in the browser and persists locally via `localStorage`.
3. **Strictly Anti-Bloat**:
   - **No** subtasks, nested lists, project folders, tagging systems, or complex filters.
   - **No** gamification, XP, streaks, or badges that induce anxiety.
   - Only actionable tasks with a title, estimated duration, optional short description, and focus nudge toggle.
4. **Forgiving Timeboxing (Negative Overrun)**:
   - Real life does not magically halt when a countdown hits `00:00`.
   - When time expires, Sessio does not lock the screen or sound an annoying continuous alarm. Instead, it plays a pleasant completion chime and seamlessly transitions into negative time (e.g. `-01:45`), showing you exactly how long you've overshot without interrupting your flow state.
5. **Continuous Focus Anchoring**:
   - An optional 5-minute recurring focus chime (synthesized cleanly via the browser's Web Audio API) plays a gentle bell every 5 minutes during a task to gently pull daydreaming or distracted minds back into the present moment.

---

## 2. Core Feature Specifications

### 2.1 Task Queue
- **Task Attributes**:
  - `id`: Unique string ID.
  - `title`: Short, verb-led task name (required).
  - `durationMinutes`: Estimated duration in minutes (default 25m, editable).
  - `description`: Optional short context note (e.g. "Focus on section 2.3", "Don't forget references").
  - `enableFiveMinChime`: Boolean toggle per task (plays a soft chime every 5 minutes while active).
  - `completed`: Boolean status.
  - `createdAt`: ISO timestamp.
- **Interactions**:
  - **Select Active Task**: Clicking any undone task sets it as the active timer target.
  - **Complete Task**: Checking off a task immediately marks it completed, plays a subtle accomplishment chime, and auto-advances the timer to the next undone task in the queue.
  - **Reorder / Delete**: Users can reorder tasks in the queue or remove individual tasks.
  - **Clear All Tasks**: Floating action button with a clean confirmation modal to reset the board cleanly between work sessions.

### 2.2 Central Circular Timer
- **Visual Display**:
  - Center SVG countdown ring that depletes clockwise as time elapses.
  - Large, highly legible digital clock (`MM:SS` or `HH:MM:SS` when $>1$ hour).
  - Subtle pulsing accent stroke in active running state.
  - **Overrun State**: When remaining seconds $< 0$, the ring displays a distinct "overtime" visual accent, and the digital clock displays a negative sign (e.g. `-03:12`).
- **Controls**:
  - **Start / Pause**: Large primary button (Spacebar shortcut).
  - **Reset**: Resets current active task timer back to its initial estimated duration.
  - **Skip / Next**: Advances to next undone task.
  - **+5 Min / -5 Min**: Quick-bump buttons to adjust task estimate on the fly.

### 2.3 Dual Estimated Finish Times (ETAs)
- **Active Task Finish Time**:
  - Displays what real-world time the *current active task* will finish based on remaining seconds.
  - Formula: $\text{Current Wall Clock} + \text{Remaining Task Seconds}$.
  - Example: *"Active finishes at 4:15 PM"*.
- **Total Session Finish Time**:
  - Displays what real-world time the *entire task queue* will be completed.
  - Formula: $\text{Current Wall Clock} + \text{Remaining Seconds of Active Task} + \sum(\text{Durations of all remaining undone tasks})$.
  - Example: *"Session finishes at 6:45 PM (4 tasks remaining)"*.
  - Dynamically updates as you pause, adjust task times, or overshoot estimates.

### 2.4 Focus Audio & Chimes (Web Audio API)
- Zero external MP3 / WAV network requests (never fails due to 404s, CORS, or offline environments).
- Synthesized in pure JavaScript using native browser oscillators and gain envelopes:
  - **5-Minute Focus Nudge**: Soft, two-tone meditative bell (e.g. 528 Hz harmonics, gentle decay) to remind you what you're working on without scaring you.
  - **Task Completion Gong**: Rich, resonant gong with harmonic overtone decay.
- Global master mute toggle in the header.

### 2.5 Light & Dark Modes
- Zero jarring contrasts or washed-out grays.
- **Daylight Mode**: Crisp ivory/paper canvas (`#FBFBFA`), high-contrast charcoal text (`#1C1C1A`), and focused emerald/sage accent.
- **Obsidian Dark Mode**: Deep warm charcoal canvas (`#121211`), elevated surface cards (`#1C1C1A`), soft secondary text (`#8A8A85`), and glowing emerald accent.
- Persisted in `localStorage` and respects system preference by default.

---

## 3. Data Schema & Persistence

```typescript
export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  description?: string;
  enableFiveMinChime: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface SessionState {
  tasks: Task[];
  activeTaskId: string | null;
  // Timer state
  timerState: 'idle' | 'running' | 'paused';
  remainingSeconds: number; // Can be negative during overrun
  lastTickTimestamp: number | null; // For wall-clock drift compensation
  // Settings
  soundEnabled: boolean;
  themeMode: 'light' | 'dark' | 'system';
}
```

---

## 4. Edge Cases & Resilience

1. **Browser Tab Sleep & Throttling**:
   - `setInterval(..., 1000)` drifts heavily when tabs are backgrounded or laptops sleep.
   - **Solution**: The timer engine records `lastTickTimestamp = Date.now()` and computes delta $\Delta t = (\text{now} - \text{lastTickTimestamp}) / 1000$. When the user switches back to the tab, the countdown instantly snaps to the true elapsed wall-clock time.
2. **Negative Overrun Math**:
   - In overrun state, remaining seconds decreases into negative numbers ($-1, -2, -3\dots$).
   - Progress ring clamps at $100\%$ or displays an overtime indicator without SVG NaN errors.
3. **Empty Queue State**:
   - Clean, encouraging empty state inviting the user to drop in their first task for the session.
