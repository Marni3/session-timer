import { describe, it, expect } from 'vitest';
import { Task } from '../src/types';
import { formatTaskProgressBadge, formatTimerClock, formatFocusTime, calculateRingProgress } from '../src/lib/timeUtils';

describe('taskTimerTracking logic', () => {
  it('preserves task 1 timer stats when switching to task 2', () => {
    let tasks: Task[] = [
      {
        id: 't1',
        title: 'Task 1',
        durationMinutes: 15,
        remainingSeconds: 15 * 60,
        actualDurationSeconds: 0,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Task 2',
        durationMinutes: 25,
        remainingSeconds: 25 * 60,
        actualDurationSeconds: 0,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    let activeTaskId = 't1';

    // Simulate ticking 180 seconds (3 minutes) on task 1
    const tickSeconds = 180;
    tasks = tasks.map((t) =>
      t.id === activeTaskId
        ? {
            ...t,
            remainingSeconds: t.remainingSeconds - tickSeconds,
            actualDurationSeconds: t.actualDurationSeconds + tickSeconds,
          }
        : t
    );

    const task1 = tasks.find((t) => t.id === 't1')!;
    expect(task1.remainingSeconds).toBe(12 * 60); // 12m left
    expect(task1.actualDurationSeconds).toBe(180); // 3m spent
    expect(formatTaskProgressBadge(task1)).toBe('12m left / 15m');
    expect(formatFocusTime(task1.actualDurationSeconds)).toBe('3m');

    // Simulate switching active task to task 2
    activeTaskId = 't2';
    const activeTask = tasks.find((t) => t.id === activeTaskId)!;
    expect(activeTask.id).toBe('t2');
    expect(activeTask.remainingSeconds).toBe(25 * 60);
    expect(activeTask.actualDurationSeconds).toBe(0);

    // Verify task 1 retains its recorded time
    const task1Retained = tasks.find((t) => t.id === 't1')!;
    expect(task1Retained.remainingSeconds).toBe(720);
    expect(task1Retained.actualDurationSeconds).toBe(180);

    // Now tick 60 seconds on task 2
    tasks = tasks.map((t) =>
      t.id === activeTaskId
        ? {
            ...t,
            remainingSeconds: t.remainingSeconds - 60,
            actualDurationSeconds: t.actualDurationSeconds + 60,
          }
        : t
    );

    const task2 = tasks.find((t) => t.id === 't2')!;
    expect(task2.remainingSeconds).toBe(24 * 60);
    expect(task2.actualDurationSeconds).toBe(60);

    // Switch back to task 1
    activeTaskId = 't1';
    const switchedBackTask1 = tasks.find((t) => t.id === activeTaskId)!;
    expect(switchedBackTask1.remainingSeconds).toBe(720);
    expect(switchedBackTask1.actualDurationSeconds).toBe(180);
  });

  it('correctly updates remainingSeconds and keeps desync impossible when adding +5m', () => {
    let task: Task = {
      id: 't1',
      title: 'Task 1',
      durationMinutes: 15,
      remainingSeconds: 900,
      actualDurationSeconds: 120, // 2 minutes spent
      enableFiveMinChime: false,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // User clicks +5m
    const deltaMins = 5;
    task = {
      ...task,
      remainingSeconds: task.remainingSeconds + deltaMins * 60,
    };

    expect(task.remainingSeconds).toBe(1200); // 20:00
    expect(formatTimerClock(task.remainingSeconds)).toBe('20:00');
    expect(formatTaskProgressBadge(task)).toBe('20m left / 15m');
    expect(task.actualDurationSeconds).toBe(120); // spent time unchanged
  });

  it('handles negative overrun and overtime progress correctly', () => {
    let task: Task = {
      id: 't1',
      title: 'Task 1',
      durationMinutes: 10,
      remainingSeconds: 10,
      actualDurationSeconds: 590,
      enableFiveMinChime: false,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    // Tick 30 seconds -> drops into overtime by 20 seconds
    task = {
      ...task,
      remainingSeconds: task.remainingSeconds - 30,
      actualDurationSeconds: task.actualDurationSeconds + 30,
    };

    expect(task.remainingSeconds).toBe(-20);
    expect(task.actualDurationSeconds).toBe(620);
    expect(formatTimerClock(task.remainingSeconds)).toBe('-00:20');
    expect(formatTaskProgressBadge(task)).toBe('+1m overtime');
    expect(calculateRingProgress(task.remainingSeconds, task.durationMinutes * 60)).toBe(1);
  });

  it('auto-advances to next incomplete task upon completing active task', () => {
    const tasks: Task[] = [
      {
        id: 't1',
        title: 'Task 1',
        durationMinutes: 10,
        remainingSeconds: 0,
        actualDurationSeconds: 600,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Task 2',
        durationMinutes: 15,
        remainingSeconds: 900,
        actualDurationSeconds: 0,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    let activeTaskId: string | null = 't1';

    // Mark active task complete
    const completedId = 't1';
    const updated = tasks.map((t) =>
      t.id === completedId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
    );

    if (completedId === activeTaskId) {
      const nextUndone = updated.find((t) => !t.completed);
      activeTaskId = nextUndone ? nextUndone.id : null;
    }

    expect(activeTaskId).toBe('t2');
    expect(updated.find((t) => t.id === 't1')!.completed).toBe(true);
    expect(formatTaskProgressBadge(updated.find((t) => t.id === 't1')!)).toBe('10m spent');
  });
});
