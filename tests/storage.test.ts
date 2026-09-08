import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadSessionState, saveSessionState, DEFAULT_INITIAL_STATE } from '../src/lib/storage';
import { SessionState } from '../src/types';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('loads default initial state when localStorage is empty', () => {
    const state = loadSessionState();
    expect(state.tasks.length).toBeGreaterThanOrEqual(3);
    expect(state.activeTaskId).toBe(state.tasks[0].id);
    expect(state.timerStatus).toBe('idle');
    expect(state.settings.soundEnabled).toBe(true);
    expect(state.tasks[0].remainingSeconds).toBe(state.tasks[0].durationMinutes * 60);
    expect(state.tasks[0].actualDurationSeconds).toBe(0);
  });

  it('correctly serializes and retrieves session state from localStorage', () => {
    const customState: SessionState = {
      tasks: [
        {
          id: 'custom-1',
          title: 'Custom Task',
          durationMinutes: 50,
          remainingSeconds: 2400,
          actualDurationSeconds: 600,
          enableFiveMinChime: true,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      activeTaskId: 'custom-1',
      timerStatus: 'idle',
      remainingSeconds: 2400,
      settings: {
        soundEnabled: false,
        themeMode: 'dark',
        themePalette: 'warm',
      },
    };

    saveSessionState(customState);
    const loaded = loadSessionState();

    expect(loaded.tasks.length).toBe(1);
    expect(loaded.tasks[0].title).toBe('Custom Task');
    expect(loaded.tasks[0].remainingSeconds).toBe(2400);
    expect(loaded.tasks[0].actualDurationSeconds).toBe(600);
    expect(loaded.activeTaskId).toBe('custom-1');
    expect(loaded.remainingSeconds).toBe(2400);
    expect(loaded.settings.soundEnabled).toBe(false);
    expect(loaded.settings.themeMode).toBe('dark');
    expect(loaded.settings.themePalette).toBe('warm');
  });

  it('migrates legacy tasks lacking remainingSeconds and actualDurationSeconds', () => {
    const legacyPayload = {
      tasks: [
        {
          id: 'legacy-1',
          title: 'Legacy Task',
          durationMinutes: 30,
          enableFiveMinChime: true,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      activeTaskId: 'legacy-1',
      timerStatus: 'idle',
      settings: {
        soundEnabled: true,
        themeMode: 'light',
      },
    };
    localStorage.setItem('sessio_v1_state', JSON.stringify(legacyPayload));

    const state = loadSessionState();
    expect(state.tasks[0].durationMinutes).toBe(30);
    expect(state.tasks[0].remainingSeconds).toBe(1800);
    expect(state.tasks[0].actualDurationSeconds).toBe(0);
    expect(state.remainingSeconds).toBe(1800);
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    localStorage.setItem('sessio_v1_state', 'invalid json string{{{');
    const state = loadSessionState();
    expect(state).toEqual(DEFAULT_INITIAL_STATE);
  });
});
