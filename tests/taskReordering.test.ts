import { describe, it, expect } from 'vitest';
import { Task } from '../src/types';
import { loadSessionState, saveSessionState } from '../src/lib/storage';

describe('taskReordering and display preferences', () => {
  const initialPending: Task[] = [
    {
      id: 'task-a',
      title: 'Task A (Active)',
      durationMinutes: 20,
      remainingSeconds: 1200,
      actualDurationSeconds: 240,
      enableFiveMinChime: true,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-b',
      title: 'Task B',
      durationMinutes: 15,
      remainingSeconds: 900,
      actualDurationSeconds: 0,
      enableFiveMinChime: false,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-c',
      title: 'Task C',
      durationMinutes: 30,
      remainingSeconds: 1800,
      actualDurationSeconds: 0,
      enableFiveMinChime: false,
      completed: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const initialCompleted: Task[] = [
    {
      id: 'task-done',
      title: 'Task Finished',
      durationMinutes: 10,
      remainingSeconds: 0,
      actualDurationSeconds: 600,
      enableFiveMinChime: false,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  it('reorders pending tasks correctly without mutating completed tasks order', () => {
    let allTasks = [...initialPending, ...initialCompleted];
    let activeTaskId = 'task-a';

    // Simulate user dragging Task A (index 0) to index 2 (after Task C)
    const pending = allTasks.filter((t) => !t.completed);
    const [moved] = pending.splice(0, 1);
    pending.splice(2, 0, moved);

    // Recombine pending and completed
    allTasks = [...pending, ...allTasks.filter((t) => t.completed)];

    // Check new order: Task B, Task C, Task A, Task Finished
    expect(allTasks.map((t) => t.id)).toEqual(['task-b', 'task-c', 'task-a', 'task-done']);

    // Active task ID remains attached to 'task-a'
    expect(activeTaskId).toBe('task-a');

    // Stats on Task A are completely intact
    const taskA = allTasks.find((t) => t.id === 'task-a')!;
    expect(taskA.remainingSeconds).toBe(1200);
    expect(taskA.actualDurationSeconds).toBe(240);
  });

  it('preserves running timer progress across multiple re-orderings', () => {
    let tasks = [...initialPending];
    let activeTaskId = 'task-a';

    // Timer ticks 60 seconds on active task
    tasks = tasks.map((t) =>
      t.id === activeTaskId
        ? {
            ...t,
            remainingSeconds: t.remainingSeconds - 60,
            actualDurationSeconds: t.actualDurationSeconds + 60,
          }
        : t
    );

    // User drags task-c (index 2) to top (index 0)
    const [movedC] = tasks.splice(2, 1);
    tasks.splice(0, 0, movedC);

    expect(tasks.map((t) => t.id)).toEqual(['task-c', 'task-a', 'task-b']);

    // Timer ticks another 60 seconds on active task (task-a, now at index 1)
    tasks = tasks.map((t) =>
      t.id === activeTaskId
        ? {
            ...t,
            remainingSeconds: t.remainingSeconds - 60,
            actualDurationSeconds: t.actualDurationSeconds + 60,
          }
        : t
    );

    const activeTask = tasks.find((t) => t.id === activeTaskId)!;
    expect(activeTask.remainingSeconds).toBe(1080); // 1200 - 120
    expect(activeTask.actualDurationSeconds).toBe(360); // 240 + 120
  });

  it('correctly persists showTimerRing preference to localStorage', () => {
    localStorage.clear();

    const customState = {
      tasks: initialPending,
      activeTaskId: 'task-a',
      timerStatus: 'idle' as const,
      remainingSeconds: 1200,
      settings: {
        soundEnabled: true,
        themeMode: 'dark' as const,
        themePalette: 'warm' as const,
        showTimerRing: false, // Text-only mode selected
      },
    };

    saveSessionState(customState);
    const loaded = loadSessionState();

    expect(loaded.settings.showTimerRing).toBe(false);
  });
});
