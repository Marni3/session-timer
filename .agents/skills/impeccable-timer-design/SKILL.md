---
name: impeccable-timer-design
description: Design authority for Sessio. Covers visual hierarchy, circular SVG timer geometry, typography, tabular numbers, daylight/obsidian color tokens, micro-interactions, and accessibility.
---

# Impeccable Timer Design

## 1. Visual Hierarchy
The interface follows a clean vertical rhythm:
1. **Header**: Minimalist branding, session finish ETA pill, sound toggle, theme switcher, clear all action.
2. **Hero Center**: The circular timer ring dominates, with the countdown clock in the center and the active task title and description immediately beneath.
3. **Session Queue**: The list of tasks waiting to be done, with clean completion checkboxes, duration badges, and focus bell indicators.

## 2. Jitter-Free Timer Numbers
- Always apply `tabular-nums font-mono` or `font-sans tabular-nums font-bold tracking-tight` to digital clocks.
- When numbers switch from `10:01` to `10:00`, the container width and alignment must remain rock solid.

## 3. Circular SVG Ring Math
- Use an SVG viewBox of `0 0 240 240`.
- Center point: $(120, 120)$, Radius $r = 100$.
- Circumference $C = 2 \times \pi \times 100 \approx 628.318$.
- Progress ratio:
  ```typescript
  const ratio = totalDurationSeconds > 0 
    ? Math.max(0, Math.min(1, remainingSeconds / totalDurationSeconds)) 
    : 0;
  const strokeDashoffset = 628.318 * (1 - ratio);
  ```
- In **Overtime** (`remainingSeconds < 0`):
  - Switch stroke color from focus emerald (`#10B981` / `#34D399`) to warm overtime amber (`#F59E0B` / `#D97706`).
  - Add a soft subtle pulse animation.

## 4. Accessibility & Contrast
- Minimum WCAG AA (aim for AAA on main text).
- Primary text on light: `#1A1A18` on `#FBFBFA` (ratio $> 14:1$).
- Primary text on dark: `#F2F2EF` on `#121211` (ratio $> 14:1$).
- Interactive touch targets must be at least $40\times 40\text{px}$ on mobile.
