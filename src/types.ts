export interface Task {
  id: string;
  title: string;
  durationMinutes: number;
  description?: string;
  enableFiveMinChime: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface SessionSettings {
  soundEnabled: boolean;
  themeMode: 'light' | 'dark' | 'system';
}

export interface SessionState {
  tasks: Task[];
  activeTaskId: string | null;
  timerStatus: TimerStatus;
  remainingSeconds: number; // Can go negative during overrun
  settings: SessionSettings;
}
