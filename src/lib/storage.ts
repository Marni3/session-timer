import { SessionState, Task } from '../types';

const STORAGE_KEY = 'sessio_v1_state';

const DEFAULT_TASKS: Task[] = [
  {
    id: 'seed-task-1',
    title: '📐 Plan top priorities for this session',
    durationMinutes: 15,
    description: 'List the 3 essential outcomes needed before stopping.',
    enableFiveMinChime: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-task-2',
    title: '💻 Deep work execution block',
    durationMinutes: 45,
    description: 'Keep phone away and focus on single-tasking.',
    enableFiveMinChime: true,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'seed-task-3',
    title: '☕ Quick recharge & stretch',
    durationMinutes: 10,
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

    // Defensive reconciliation
    const tasks = Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : DEFAULT_TASKS;
    const activeTaskId = parsed.activeTaskId || tasks.find((t) => !t.completed)?.id || tasks[0]?.id || null;
    const activeTask = tasks.find((t) => t.id === activeTaskId);
    const remainingSeconds = typeof parsed.remainingSeconds === 'number' 
      ? parsed.remainingSeconds 
      : (activeTask ? activeTask.durationMinutes * 60 : 25 * 60);

    return {
      tasks,
      activeTaskId,
      timerStatus: 'idle', // Always start paused on page load
      remainingSeconds,
      settings: {
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        themeMode: parsed.settings?.themeMode ?? 'system',
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
