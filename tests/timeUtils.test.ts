import { describe, it, expect } from 'vitest';
import {
  formatTimerClock,
  formatDurationBadge,
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
        enableFiveMinChime: true,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Task 2',
        durationMinutes: 30,
        enableFiveMinChime: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 't3',
        title: 'Task 3 (Done)',
        durationMinutes: 15,
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
