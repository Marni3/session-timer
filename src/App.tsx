import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TimerCircle } from './components/TimerCircle';
import { TaskList } from './components/TaskList';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { SwitchTaskModal } from './components/SwitchTaskModal';
import { useTimer } from './hooks/useTimer';
import { useTheme } from './hooks/useTheme';
import { Task, SessionState } from './types';
import { loadSessionState, saveSessionState } from './lib/storage';
import { calculateActiveEta, calculateSessionEta } from './lib/timeUtils';
import { soundEngine } from './lib/sound';

export function App() {
  // 1. Initial State from localStorage
  const [initialState] = useState<SessionState>(() => loadSessionState());
  const [tasks, setTasks] = useState<Task[]>(initialState.tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(initialState.activeTaskId);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialState.settings.soundEnabled);

  // 2. Modals State
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState<boolean>(false);
  const [pendingSwitchTaskId, setPendingSwitchTaskId] = useState<string | null>(null);

  // 3. Theme & Palette
  const {
    isDark,
    toggleTheme,
    themeMode,
    setThemeMode,
    themePalette,
    setThemePalette,
  } = useTheme(initialState.settings.themeMode, initialState.settings.themePalette);

  // 4. Resolve Active Task
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  // 5. Per-Task Timer Callbacks
  const handleTaskTick = useCallback((taskId: string, deltaSec: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              remainingSeconds: t.remainingSeconds - deltaSec,
              actualDurationSeconds: t.actualDurationSeconds + deltaSec,
            }
          : t
      )
    );
  }, []);

  const handleAdjustTaskTime = useCallback((taskId: string, deltaMins: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === taskId) {
          const newDuration = Math.max(1, t.durationMinutes + deltaMins);
          return {
            ...t,
            durationMinutes: newDuration,
            remainingSeconds: t.remainingSeconds + deltaMins * 60,
          };
        }
        return t;
      })
    );
  }, []);

  const handleResetTaskTime = useCallback((taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              remainingSeconds: t.durationMinutes * 60,
            }
          : t
      )
    );
  }, []);

  // 6. Timer Hook
  const {
    timerStatus,
    remainingSeconds,
    togglePlayPause,
    resetTimer,
    adjustMinutes,
    pauseTimer,
  } = useTimer({
    activeTask,
    soundEnabled,
    onTaskTick: handleTaskTick,
    onAdjustTaskTime: handleAdjustTaskTime,
    onResetTaskTime: handleResetTaskTime,
  });

  // 7. Save State to LocalStorage on Change
  useEffect(() => {
    saveSessionState({
      tasks,
      activeTaskId,
      timerStatus,
      remainingSeconds,
      settings: {
        soundEnabled,
        themeMode,
        themePalette,
      },
    });
  }, [tasks, activeTaskId, timerStatus, remainingSeconds, soundEnabled, themeMode, themePalette]);

  // 8. Dynamic ETA Calculations
  const activeEta = useMemo(() => {
    return calculateActiveEta(remainingSeconds);
  }, [remainingSeconds]);

  const { eta: sessionEta, incompleteCount } = useMemo(() => {
    return calculateSessionEta(remainingSeconds, tasks, activeTaskId);
  }, [remainingSeconds, tasks, activeTaskId]);

  // 9. Task Switching with Protection
  const handleSelectActiveTask = useCallback((id: string) => {
    if (id === activeTaskId) return;

    // Confirm if current task is actively running or has recorded focus time
    const hasRecordedWork = activeTask && (activeTask.actualDurationSeconds > 0 || timerStatus === 'running' || timerStatus === 'paused');
    if (hasRecordedWork) {
      setPendingSwitchTaskId(id);
      setIsSwitchModalOpen(true);
    } else {
      setActiveTaskId(id);
    }
  }, [activeTaskId, activeTask, timerStatus]);

  const handleConfirmSwitch = useCallback(() => {
    if (pendingSwitchTaskId) {
      pauseTimer();
      setActiveTaskId(pendingSwitchTaskId);
      setPendingSwitchTaskId(null);
    }
    setIsSwitchModalOpen(false);
  }, [pendingSwitchTaskId, pauseTimer]);

  const handleToggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });

      // If active task was just completed, advance to next undone task and pause
      if (id === activeTaskId) {
        const completedActive = updated.find((t) => t.id === id)?.completed;
        if (completedActive) {
          const nextUndone = updated.find((t) => !t.completed);
          setActiveTaskId(nextUndone ? nextUndone.id : null);
          pauseTimer();
        }
      }

      return updated;
    });

    if (soundEnabled) {
      soundEngine.playCompletionGong();
    }
  }, [activeTaskId, pauseTimer, soundEnabled]);

  const handleToggleChime = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enableFiveMinChime: !t.enableFiveMinChime } : t))
    );
  }, []);

  const handleSaveTask = useCallback((
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'remainingSeconds' | 'actualDurationSeconds'>,
    taskId?: string
  ) => {
    if (taskId) {
      // Edit existing task
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const diffMins = taskData.durationMinutes - t.durationMinutes;
            return {
              ...t,
              ...taskData,
              durationMinutes: taskData.durationMinutes,
              remainingSeconds: t.remainingSeconds + diffMins * 60,
            };
          }
          return t;
        })
      );
    } else {
      // Add new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
        durationMinutes: taskData.durationMinutes,
        remainingSeconds: taskData.durationMinutes * 60,
        actualDurationSeconds: 0,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);

      if (!activeTaskId) {
        setActiveTaskId(newTask.id);
      }
    }
  }, [activeTaskId]);

  const handleDeleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (activeTaskId === id) {
        const nextUndone = filtered.find((t) => !t.completed);
        setActiveTaskId(nextUndone ? nextUndone.id : null);
      }
      return filtered;
    });
  }, [activeTaskId]);

  const handleClearSession = useCallback(({ clearUnfinished }: { clearUnfinished: boolean }) => {
    if (clearUnfinished) {
      setTasks([]);
      setActiveTaskId(null);
      resetTimer();
    } else {
      // Keep unfinished tasks, clear only completed tasks
      setTasks((prev) => {
        const remaining = prev.filter((t) => !t.completed);
        if (activeTaskId && !remaining.some((t) => t.id === activeTaskId)) {
          setActiveTaskId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    }
  }, [activeTaskId, resetTimer]);

  const handleSkipNext = useCallback(() => {
    const undoneTasks = tasks.filter((t) => !t.completed);
    if (undoneTasks.length <= 1) return;

    const currentIndex = undoneTasks.findIndex((t) => t.id === activeTaskId);
    const nextIndex = (currentIndex + 1) % undoneTasks.length;
    handleSelectActiveTask(undoneTasks[nextIndex].id);
  }, [tasks, activeTaskId, handleSelectActiveTask]);

  // 11. Spacebar Shortcut for Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        // Don't intercept if user is typing in an input or modal is open
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          isClearConfirmOpen ||
          isSettingsOpen ||
          isSwitchModalOpen
        ) {
          return;
        }
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, isClearConfirmOpen, isSettingsOpen, isSwitchModalOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-text-primary)] transition-colors duration-200">
      {/* Top Header */}
      <Header
        sessionEta={sessionEta}
        incompleteCount={incompleteCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenClearConfirm={() => setIsClearConfirmOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasTasks={tasks.length > 0}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-start">
        {/* Central Circular Countdown Ring */}
        <TimerCircle
          activeTask={activeTask}
          remainingSeconds={remainingSeconds}
          timerStatus={timerStatus}
          activeEta={activeEta}
          onTogglePlayPause={togglePlayPause}
          onSkipNext={handleSkipNext}
        />

        {/* Task Queue List */}
        <TaskList
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectActiveTask={handleSelectActiveTask}
          onToggleCompleteTask={handleToggleTaskComplete}
          onToggleChimeTask={handleToggleChime}
          onSaveTask={handleSaveTask}
          onDeleteTask={handleDeleteTask}
          onAdjustMinutes={adjustMinutes}
          onResetTime={resetTimer}
          onTogglePlayPause={togglePlayPause}
          timerStatus={timerStatus}
        />
      </main>

      {/* Clear Session Confirmation Modal */}
      <ClearConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearSession}
        unfinishedCount={tasks.filter((t) => !t.completed).length}
        finishedCount={tasks.filter((t) => t.completed).length}
      />

      {/* Settings & Theme Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        palette={themePalette}
        onSelectPalette={setThemePalette}
        themeMode={themeMode}
        onChangeThemeMode={setThemeMode}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Switch Active Task Confirmation Modal */}
      <SwitchTaskModal
        isOpen={isSwitchModalOpen}
        onClose={() => {
          setIsSwitchModalOpen(false);
          setPendingSwitchTaskId(null);
        }}
        onConfirmSwitch={handleConfirmSwitch}
        currentTask={activeTask}
        targetTask={tasks.find((t) => t.id === pendingSwitchTaskId) || null}
        isTimerRunning={timerStatus === 'running'}
      />
    </div>
  );
}

export default App;
