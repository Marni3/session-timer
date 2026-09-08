import { describe, it, expect } from 'vitest';
import {
  formatTimerClock,
  formatDurationBadge,
  formatTaskProgressBadge,
  formatFocusTime,
  calculateActiveEta,
  calculateSessionEta,
  calculateRingProgress,
} from '../src/lib/timeUtils';
import { Task } from '../src/types';

describe('timeUtils', () => {
  describe('formatTimerClock', () => {
    it('formats standard MM:SS correctly', () => {
      expect(formatTimerClock(1500)).toBe('25:00');
      expect(formatTimerClock(65)).toBe('01:05');
      expect(formatTimerClock(0)).toBe('00:00');
    });

    it('formats hours correctly when exceeding 1 hour', () => {
      expect(formatTimerClock(3665)).toBe('1:01:05');
      expect(formatTimerClock(7200)).toBe('2:00:00');
    });

    it('formats negative overrun time with a minus sign', () => {
      expect(formatTimerClock(-1)).toBe('-00:01');
      expect(formatTimerClock(-75)).toBe('-01:15');
      expect(formatTimerClock(-3665)).toBe('-1:01:05');
    });
  });

  describe('formatDurationBadge', () => {
    it('formats minute badges', () => {
      expect(formatDurationBadge(25)).toBe('25m');
      expect(formatDurationBadge(5)).toBe('5m');
    });

    it('formats hours and mixed badges', () => {
      expect(formatDurationBadge(60)).toBe('1h');
      expect(formatDurationBadge(75)).toBe('1h 15m');
      expect(formatDurationBadge(120)).toBe('2h');
    });
  });

  describe('formatTaskProgressBadge', () => {
    it('formats unstarted task with planned duration', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        durationMinutes: 25,
        remainingSeconds: 1500,
        actualDurationSeconds: 0,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      expect(formatTaskProgressBadge(task)).toBe('25m');
    });

    it('formats in-progress task with remaining and planned duration', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        durationMinutes: 25,
        remainingSeconds: 600, // 10 min left
        actualDurationSeconds: 900, // 15 min spent
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      expect(formatTaskProgressBadge(task)).toBe('10m left / 25m');
    });

    it('formats overtime task with positive overtime indicator', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        durationMinutes: 25,
        remainingSeconds: -120, // 2 min overrun
        actualDurationSeconds: 1620,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      expect(formatTaskProgressBadge(task)).toBe('+2m overtime');
    });

    it('formats completed task with actual time spent', () => {
      const task: Task = {
        id: '1',
        title: 'Task',
        durationMinutes: 25,
        remainingSeconds: 300,
        actualDurationSeconds: 1200, // 20 min spent
        enableFiveMinChime: false,
        completed: true,
        createdAt: new Date().toISOString(),
      };
      expect(formatTaskProgressBadge(task)).toBe('20m spent');
    });
  });

  describe('formatFocusTime', () => {
    it('formats seconds under 1 minute', () => {
      expect(formatFocusTime(0)).toBe('0s');
      expect(formatFocusTime(45)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatFocusTime(60)).toBe('1m');
      expect(formatFocusTime(75)).toBe('1m 15s');
      expect(formatFocusTime(125)).toBe('2m 05s');
    });

    it('formats hours and minutes', () => {
      expect(formatFocusTime(3600)).toBe('1h 0m');
      expect(formatFocusTime(3720)).toBe('1h 2m');
    });
  });

  describe('calculateActiveEta', () => {
    it('projects future timestamp based on positive remaining seconds', () => {
      const now = new Date('2026-09-08T10:00:00Z');
      const eta = calculateActiveEta(1500, now); // 25 minutes
      expect(eta.toISOString()).toBe('2026-09-08T10:25:00.000Z');
    });

    it('clamps to now if remaining seconds is negative', () => {
      const now = new Date('2026-09-08T10:00:00Z');
      const eta = calculateActiveEta(-120, now);
      expect(eta.toISOString()).toBe('2026-09-08T10:00:00.000Z');
    });
  });

  describe('calculateSessionEta', () => {
    const sampleTasks: Task[] = [
      {
        id: 't1',
        title: 'Task 1',
        durationMinutes: 20,
        remainingSeconds: 600,
        actualDurationSeconds: 600,
        enableFiveMinChime: true,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Task 2',
        durationMinutes: 30,
        remainingSeconds: 1800,
        actualDurationSeconds: 0,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't3',
        title: 'Task 3 (Done)',
        durationMinutes: 15,
        remainingSeconds: 0,
        actualDurationSeconds: 900,
        enableFiveMinChime: false,
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    it('accurately calculates sum of active remaining seconds and other undone tasks', () => {
      const now = new Date('2026-09-08T12:00:00Z');
      // Task 1 is active with 10 mins remaining (600s). Task 2 is 30 mins. Task 3 is done.
      // Total remaining: 10m + 30m = 40m
      const { eta, totalMinutesRemaining, incompleteCount } = calculateSessionEta(
        600,
        sampleTasks,
        't1',
        now
      );

      expect(incompleteCount).toBe(2);
      expect(totalMinutesRemaining).toBe(40);
      expect(eta.toISOString()).toBe('2026-09-08T12:40:00.000Z');
    });

    it('returns now when all tasks are completed', () => {
      const allCompleted: Task[] = sampleTasks.map((t) => ({ ...t, completed: true }));
      const now = new Date('2026-09-08T12:00:00Z');

      const { totalMinutesRemaining, incompleteCount } = calculateSessionEta(
        0,
        allCompleted,
        null,
        now
      );

      expect(incompleteCount).toBe(0);
      expect(totalMinutesRemaining).toBe(0);
    });
  });

  describe('calculateRingProgress', () => {
    it('computes correct ratio', () => {
      expect(calculateRingProgress(1500, 1500)).toBe(1);
      expect(calculateRingProgress(750, 1500)).toBe(0.5);
      expect(calculateRingProgress(0, 1500)).toBe(0);
    });

    it('clamps negative overrun to 1 without throwing', () => {
      expect(calculateRingProgress(-100, 1500)).toBe(1);
    });
  });
});
