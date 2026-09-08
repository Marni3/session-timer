---
name: timer-engine-standards
description: Authoritative standards for countdown timing accuracy, background tab throttling compensation, negative overrun handling, dual ETA calculations, and synthetic Web Audio sound design in Sessio.
---

# Timer Engine Standards

## 1. Wall-Clock Drift Compensation
Browsers clamp `setInterval` when backgrounded (sometimes to 1 tick per minute). To keep countdowns accurate:

```typescript
// On every interval or requestAnimationFrame tick:
const now = Date.now();
if (lastTickTimestamp) {
  const elapsedSeconds = Math.floor((now - lastTickTimestamp) / 1000);
  if (elapsedSeconds > 0) {
    setRemainingSeconds((prev) => prev - elapsedSeconds);
    setLastTickTimestamp(now);
  }
}
```

- When the tab regains focus (`visibilitychange` event), immediately recalculate elapsed time using `Date.now()`.

## 2. Negative Overrun Math
- When `remainingSeconds` hits `0`, the timer continues decrementing into negative numbers: `-1, -2, -3...`.
- Overrun duration = `Math.abs(remainingSeconds)` when `remainingSeconds < 0`.
- Display formatting:
  ```typescript
  export function formatTimerClock(seconds: number): string {
    const isNegative = seconds < 0;
    const absSeconds = Math.abs(seconds);
    const hrs = Math.floor(absSeconds / 3600);
    const mins = Math.floor((absSeconds % 3600) / 60);
    const secs = absSeconds % 60;

    const prefix = isNegative ? '-' : '';
    if (hrs > 0) {
      return `${prefix}${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${prefix}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  ```

## 3. Dual ETA Projections
Always recalculate ETAs when:
1. Seconds tick while running.
2. Active task changes.
3. Tasks are added, edited, reordered, or completed.

- **Active Task Finish**:
  $$\text{ETA}_{\text{active}} = \text{new Date}(\text{Date.now}() + \max(0, \text{remainingSeconds}) \times 1000)$$
- **Total Session Finish**:
  $$\text{Total Remaining Seconds} = \max(0, \text{remainingSeconds}) + \sum_{\text{task} \in \text{other undone tasks}} (\text{task.durationMinutes} \times 60)$$
  $$\text{ETA}_{\text{session}} = \text{new Date}(\text{Date.now}() + \text{Total Remaining Seconds} \times 1000)$$

## 4. Web Audio API Synthesis
Never import audio files. Synthesize sounds using browser audio nodes:

- **5-Minute Focus Nudge**:
  - Twin pure sine waves (e.g. 587.33 Hz / D5 and 880 Hz / A5) with gentle exponential gain decay (envelope: 0.05s attack, 1.2s decay).
- **Completion Gong**:
  - Multi-harmonic bell (fundamental ~440 Hz + overtone 660 Hz + 1100 Hz) with exponential decay over 2.5s.
- Always resume `AudioContext` on user interaction if in `'suspended'` state.
