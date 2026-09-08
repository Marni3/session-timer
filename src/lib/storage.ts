import { SessionState, Task } from '../types';

const STORAGE_KEY = 'sessio_v1_state';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    title: '📐 Plan top priorities for this session',
    durationMinutes: 15,
    remainingSeconds: 15 * 60,
    actualDurationSeconds: 0,
    description: 'List the 3 essential outcomes needed before stopping.',
    enableFiveMinChime: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-task-2',
    title: '💻 Deep work execution block',
    durationMinutes: 45,
    remainingSeconds: 45 * 60,
    actualDurationSeconds: 0,
    description: 'Keep phone away and focus on single-tasking.',
    enableFiveMinChime: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-task-3',
    title: '☕ Quick recharge & stretch',
    durationMinutes: 10,
    remainingSeconds: 10 * 60,
    actualDurationSeconds: 0,
    description: 'Step away from screen and drink water.',
    enableFiveMinChime: false,
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_INITIAL_STATE: SessionState = {
  tasks: DEFAULT_TASKS,
  activeTaskId: DEFAULT_TASKS[0].id,
  timerStatus: 'idle',
  remainingSeconds: DEFAULT_TASKS[0].durationMinutes * 60,
  settings: {
    soundEnabled: true,
    themeMode: 'system',
    themePalette: 'classic',
  },
};

export function loadSessionState(): SessionState {
  if (typeof window === 'undefined') {
    return DEFAULT_INITIAL_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_INITIAL_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<SessionState>;

    // Defensive reconciliation with per-task time migration
    const rawTasks = Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : DEFAULT_TASKS;
    const tasks: Task[] = rawTasks.map((t) => {
      const duration = typeof t.durationMinutes === 'number' && t.durationMinutes > 0 ? t.durationMinutes : 25;
      return {
        ...t,
        durationMinutes: duration,
        remainingSeconds: typeof t.remainingSeconds === 'number' ? t.remainingSeconds : duration * 60,
        actualDurationSeconds: typeof t.actualDurationSeconds === 'number' ? t.actualDurationSeconds : 0,
      };
    });

    const activeTaskId = parsed.activeTaskId || tasks.find((t) => !t.completed)?.id || tasks[0]?.id || null;
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    const remainingSeconds = activeTask ? activeTask.remainingSeconds : 25 * 60;

    const validPalettes = ['classic', 'warm', 'nordic', 'monolith'];
    const savedPalette = parsed.settings?.themePalette;
    const themePalette = (savedPalette && validPalettes.includes(savedPalette)) 
      ? savedPalette 
      : 'classic';

    return {
      tasks,
      activeTaskId,
      timerStatus: 'idle', // Always start paused on page load
      remainingSeconds,
      settings: {
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        themeMode: parsed.settings?.themeMode ?? 'system',
        themePalette,
      },
    };
  } catch (err) {
    console.warn('Failed to parse localStorage state for Sessio, resetting to defaults', err);
    return DEFAULT_INITIAL_STATE;
  }
}

export function saveSessionState(state: SessionState): void {
  if (typeof window === 'undefined') return;

  try {
    const sanitized: SessionState = {
      tasks: state.tasks,
      activeTaskId: state.activeTaskId,
      timerStatus: state.timerStatus,
      remainingSeconds: state.remainingSeconds,
      settings: state.settings,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.error('Failed to save Sessio state to localStorage', err);
  }
}
