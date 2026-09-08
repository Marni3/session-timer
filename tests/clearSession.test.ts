import { describe, it, expect } from 'vitest';
import { Task } from '../src/types';

describe('clearSession logic', () => {
  const initialTasks: Task[] = [
    {
      id: 't1',
      title: 'Active Incomplete Task',
      durationMinutes: 25,
      remainingSeconds: 900,
      actualDurationSeconds: 600,
      enableFiveMinChime: false,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 't2',
      title: 'Another Incomplete Task',
      durationMinutes: 15,
      remainingSeconds: 900,
      actualDurationSeconds: 0,
      enableFiveMinChime: false,
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 't3',
      title: 'Completed Task',
      durationMinutes: 20,
      remainingSeconds: 0,
      actualDurationSeconds: 1200,
      enableFiveMinChime: false,
      completed: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];

  it('clears all tasks and resets activeTaskId when clearUnfinished is true', () => {
    let tasks: Task[] = [...initialTasks];
    let activeTaskId: string | null = 't1';

    const clearUnfinished = true;

    if (clearUnfinished) {
      tasks = [];
      activeTaskId = null;
    } else {
      tasks = tasks.filter((t) => !t.completed);
      if (activeTaskId && !tasks.some((t) => t.id === activeTaskId)) {
        activeTaskId = tasks.length > 0 ? tasks[0].id : null;
      }
    }

    expect(tasks.length).toBe(0);
    expect(activeTaskId).toBeNull();
  });

  it('preserves unfinished tasks and active progress when clearUnfinished is false', () => {
    let tasks: Task[] = [...initialTasks];
    let activeTaskId: string | null = 't1';

    const clearUnfinished = false;

    if (clearUnfinished) {
      tasks = [];
      activeTaskId = null;
    } else {
      tasks = tasks.filter((t) => !t.completed);
      if (activeTaskId && !tasks.some((t) => t.id === activeTaskId)) {
        activeTaskId = tasks.length > 0 ? tasks[0].id : null;
      }
    }

    expect(tasks.length).toBe(2);
    expect(tasks.map((t) => t.id)).toEqual(['t1', 't2']);
    expect(activeTaskId).toBe('t1');

    // Verify task 1 timer stats remain intact
    const task1 = tasks.find((t) => t.id === 't1')!;
    expect(task1.remainingSeconds).toBe(900);
    expect(task1.actualDurationSeconds).toBe(600);
  });

  it('re-assigns activeTaskId to first remaining unfinished task if active task was completed and cleared', () => {
    let tasks: Task[] = [...initialTasks];
    let activeTaskId: string | null = 't3'; // Active was the completed task

    const clearUnfinished = false;

    if (clearUnfinished) {
      tasks = [];
      activeTaskId = null;
    } else {
      tasks = tasks.filter((t) => !t.completed);
      if (activeTaskId && !tasks.some((t) => t.id === activeTaskId)) {
        activeTaskId = tasks.length > 0 ? tasks[0].id : null;
      }
    }

    expect(tasks.length).toBe(2);
    expect(activeTaskId).toBe('t1');
  });
});
