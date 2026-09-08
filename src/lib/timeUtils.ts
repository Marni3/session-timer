import { Task } from '../types';

/**
 * Format raw seconds (positive or negative) into MM:SS or HH:MM:SS format.
 * Overruns are prepended with a minus sign (e.g. -02:15).
 */
export function formatTimerClock(seconds: number): string {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  const prefix = isNegative ? '-' : '';

  if (hours > 0) {
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = secs.toString().padStart(2, '0');
    return `${prefix}${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = secs.toString().padStart(2, '0');
  return `${prefix}${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Format minutes into a friendly badge text (e.g. 25m, 1h 15m).
 */
export function formatDurationBadge(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hrs}h`;
  }
  return `${hrs}h ${remainingMins}m`;
}

/**
 * Format a Date object into human-friendly time (e.g. "4:30 PM").
 */
export function formatEtaTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Calculate the estimated finish time for the current active task.
 */
export function calculateActiveEta(remainingSeconds: number, now: Date = new Date()): Date {
  // If in overrun (negative remaining), current task should have finished already; ETA is right now
  const positiveRemaining = Math.max(0, remainingSeconds);
  return new Date(now.getTime() + positiveRemaining * 1000);
}

/**
 * Calculate the total session completion time across active and upcoming undone tasks.
 */
export function calculateSessionEta(
  activeTaskRemainingSeconds: number,
  allTasks: Task[],
  activeTaskId: string | null,
  now: Date = new Date()
): { eta: Date; totalMinutesRemaining: number; incompleteCount: number } {
  const undoneTasks = allTasks.filter((t) => !t.completed);
  
  if (undoneTasks.length === 0) {
    return {
      eta: now,
      totalMinutesRemaining: 0,
      incompleteCount: 0,
    };
  }

  // Time remaining on the active task
  let totalRemainingSeconds = Math.max(0, activeTaskRemainingSeconds);

  // Add the duration of all other incomplete tasks in queue
  for (const task of undoneTasks) {
    if (task.id !== activeTaskId) {
      totalRemainingSeconds += task.durationMinutes * 60;
    }
  }

  const totalMinutesRemaining = Math.ceil(totalRemainingSeconds / 60);
  const eta = new Date(now.getTime() + totalRemainingSeconds * 1000);

  return {
    eta,
    totalMinutesRemaining,
    incompleteCount: undoneTasks.length,
  };
}

/**
 * Computes the 0..1 ratio of progress for the SVG ring.
 */
export function calculateRingProgress(remainingSeconds: number, totalDurationSeconds: number): number {
  if (totalDurationSeconds <= 0) return 0;
  if (remainingSeconds < 0) return 1; // Full ring during overtime
  return Math.max(0, Math.min(1, remainingSeconds / totalDurationSeconds));
}

/**
 * Format task time badge reflecting estimated duration and actual time spent/left.
 */
export function formatTaskProgressBadge(task: Task): string {
  if (task.completed) {
    const minsSpent = Math.max(1, Math.round(task.actualDurationSeconds / 60));
    return `${minsSpent}m spent`;
  }

  // Active or pending task
  if (task.actualDurationSeconds > 0) {
    if (task.remainingSeconds < 0) {
      const overMins = Math.ceil(Math.abs(task.remainingSeconds) / 60);
      return `+${overMins}m overtime`;
    }
    const minsLeft = Math.ceil(task.remainingSeconds / 60);
    return `${minsLeft}m left / ${task.durationMinutes}m`;
  }

  return formatDurationBadge(task.durationMinutes);
}

/**
 * Format focus time in seconds to a friendly string (e.g. 45s, 3m 20s, 1h 15m).
 */
export function formatFocusTime(seconds: number): string {
  const abs = Math.abs(seconds);
  if (abs < 60) {
    return `${abs}s`;
  }
  const hrs = Math.floor(abs / 3600);
  const mins = Math.floor((abs % 3600) / 60);
  const secs = abs % 60;

  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (secs === 0) {
    return `${mins}m`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

