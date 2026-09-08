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
  });

  it('correctly serializes and retrieves session state from localStorage', () => {
    const customState: SessionState = {
      tasks: [
        {
          id: 'custom-1',
          title: 'Custom Task',
          durationMinutes: 50,
          enableFiveMinChime: true,
          completed: false,
          createdAt: new Date().toISOString(),
        },
      ],
      activeTaskId: 'custom-1',
      timerStatus: 'idle',
      remainingSeconds: 3000,
      settings: {
        soundEnabled: false,
        themeMode: 'dark',
      },
    };

    saveSessionState(customState);
    const loaded = loadSessionState();

    expect(loaded.tasks.length).toBe(1);
    expect(loaded.tasks[0].title).toBe('Custom Task');
    expect(loaded.activeTaskId).toBe('custom-1');
    expect(loaded.remainingSeconds).toBe(3000);
    expect(loaded.settings.soundEnabled).toBe(false);
    expect(loaded.settings.themeMode).toBe('dark');
  });

  it('recovers gracefully from corrupted JSON in localStorage', () => {
    localStorage.setItem('sessio_v1_state', 'invalid json string{{{');
    const state = loadSessionState();
    expect(state).toEqual(DEFAULT_INITIAL_STATE);
  });
});
