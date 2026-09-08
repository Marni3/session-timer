export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  remainingSeconds: number; // Can go negative during overrun
  actualDurationSeconds: number; // Cumulative seconds the timer was active on this task
  description?: string;
  enableFiveMinChime: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export type ThemePalette = 'classic' | 'warm' | 'nordic' | 'monolith';

export interface SessionSettings {
  soundEnabled: boolean;
  themeMode: 'light' | 'dark' | 'system';
  themePalette: ThemePalette;
}

export interface SessionState {
  tasks: Task[];
  activeTaskId: string | null;
  timerStatus: TimerStatus;
  remainingSeconds: number; // Can go negative during overrun
  settings: SessionSettings;
}
