# DESIGN.md — Sessio Visual Architecture & Design System

> **Aesthetic Archetype**: Calm Minimalist Timebox.  
> The interface exists to protect attention. Every element earns its place.

---

## 1. Design Principles

1. **One Focus at a Time (Mono-Focus)**:
   - The active task and its circular countdown dominate the viewport.
   - The queue of upcoming tasks sits subordinate to the active countdown.
2. **Jitter-Free Typography**:
   - All timer digits, countdown clocks, and progress numbers must use tabular figures (`font-variant-numeric: tabular-nums`). Seconds changing must never shift adjacent letters or buttons.
3. **Calm Affirmation, Never Panic**:
   - No harsh alarm red when time expires.
   - Overrun is communicated with a steady warm amber/terracotta accent, acknowledging that deep work is organic and tasks sometimes take a few minutes longer.
4. **Instant Comprehensibility**:
   - Zero hidden gestures.
   - A single glance tells you: (1) what you are doing right now, (2) how much time you have left, (3) when this task finishes, and (4) when your entire session will wrap up.

---

## 2. Color System & Design Tokens

### Daylight Mode (Light)
- **Canvas Background**: `#FBFBFA` (Gentle warm paper)
- **Surface Cards**: `#FFFFFF` (Crisp white for task cards & modals)
- **Primary Text**: `#1A1A18` (Deep charcoal, WCAG AAA contrast)
- **Muted Text**: `#73736E` (Secondary hints, ETAs, descriptions)
- **Hairline Borders**: `#EAE9E4` (Subtle boundary lines)
- **Primary Accent**: `#10B981` / `#059669` (Deep focus emerald)
- **Accent Background**: `#ECFDF5` (Soft emerald badge tint)
- **Overtime Accent**: `#D97706` / `#B45309` (Warm amber for negative overrun)

### Obsidian Mode (Dark)
- **Canvas Background**: `#121211` (Deep natural carbon)
- **Surface Cards**: `#1C1C1A` (Elevated dark graphite)
- **Primary Text**: `#F2F2EF` (Warm bone white)
- **Muted Text**: `#8E8E88` (Readable secondary metadata)
- **Hairline Borders**: `#2E2E2A` (Low-contrast dark borders)
- **Primary Accent**: `#34D399` / `#10B981` (Vibrant focus emerald)
- **Accent Background**: `#064E3B` with `opacity: 0.3` (Subtle dark emerald glow)
- **Overtime Accent**: `#F59E0B` (Luminous amber for overrun state)

---

## 3. Typography Hierarchy

- **Font Family**: Modern system UI sans stack (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`).
- **Digital Clock**: `font-mono` or sans with `tabular-nums tracking-tight font-bold`.
  - Normal state: 56px to 64px on desktop, 44px on mobile.
  - Overrun state: prepended with `-` (minus), styled in amber.
- **Task Title**: `text-base sm:text-lg font-semibold`.
- **Task Description & ETAs**: `text-xs sm:text-sm font-normal text-muted`.

---

## 4. Circular Timer Geometry & Math

The circular timer ring is rendered via an SVG `<circle>`:
- **Radius ($r$)**: `110px`
- **Circumference ($C$)**: $2 \times \pi \times r \approx 691.15\text{px}$
- **Stroke Width**: `8px` background track, `10px` active progress bar with `stroke-linecap="round"`.
- **Offset Calculation**:
  $$\text{progress} = \max(0, \min(1, \frac{\text{remainingSeconds}}{\text{totalDurationSeconds}}))$$
  $$\text{strokeDashoffset} = C \times (1 - \text{progress})$$
- **Overrun Treatment**:
  - In overrun ($\text{remainingSeconds} < 0$), the progress track turns into a warm amber ring with an animated soft glow or subtle pulsating rhythm, and the digital clock counts up with a negative sign.

---

## 5. UI Layout Wireframe

```
┌────────────────────────────────────────────────────────────────────────┐
│  Sessio   ⏱️ Session finishes at 4:30 PM (3 tasks left)    🔔  🌓  🗑️  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                              ╭───────────╮                             │
│                           ╭──╯           ╰──╮                          │
│                          │      21:45       │                          │
│                          │   Finishes 2:15  │                          │
│                           ╰──╮           ╭──╯                          │
│                              ╰───────────╯                             │
│                                                                        │
│                      [ ⏸ Pause ]   [ ⏩ Skip ]   [ ↺ Reset ]          │
│                                                                        │
│                     Active Task: 📐 Review Circuit Analysis            │
│                     "Focus on problems 4 through 7 without phone"      │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  TASKS FOR THIS SESSION                                  [ + Add Task ]│
│                                                                        │
│  [●] 📐 Review Circuit Analysis (Active)           25m  🔔  [✓] [⋮]    │
│      "Focus on problems 4 through 7 without phone"                     │
│                                                                        │
│  [ ] 📝 Outline ECE Lab Report Draft               30m  🔔  [✓] [⋮]    │
│                                                                        │
│  [ ] 📧 Reply to professor regarding rubric        10m      [✓] [⋮]    │
│                                                                        │
│  ────────────────────────────────────────────────────────────────────  │
│  [ 🗑️ Clear All Tasks ]                                                │
└────────────────────────────────────────────────────────────────────────┘
```
