import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { TimerCircle } from './components/TimerCircle';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';
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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);

  // 3. Theme
  const { isDark, toggleTheme } = useTheme(initialState.settings.themeMode);

  // 4. Resolve Active Task
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  // 5. Completion Callback
  const handleTaskComplete = useCallback((completedId: string) => {
    setTasks((prevTasks) => {
      const updated = prevTasks.map((t) =>
        t.id === completedId
          ? { ...t, completed: true, completedAt: new Date().toISOString() }
          : t
      );

      // Auto-advance to next undone task if the completed one was active
      if (completedId === activeTaskId) {
        const nextUndone = updated.find((t) => !t.completed);
        setActiveTaskId(nextUndone ? nextUndone.id : null);
      }

      return updated;
    });

    if (soundEnabled) {
      soundEngine.playCompletionGong();
    }
  }, [activeTaskId, soundEnabled]);

  // 6. Timer Hook
  const {
    timerStatus,
    remainingSeconds,
    togglePlayPause,
    resetTimer,
    adjustMinutes,
  } = useTimer({
    activeTask,
    soundEnabled,
    onCompleteTask: handleTaskComplete,
    initialRemainingSeconds: initialState.remainingSeconds,
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
        themeMode: isDark ? 'dark' : 'light',
      },
    });
  }, [tasks, activeTaskId, timerStatus, remainingSeconds, soundEnabled, isDark]);

  // 8. Dynamic ETA Calculations
  const activeEta = useMemo(() => {
    return calculateActiveEta(remainingSeconds);
  }, [remainingSeconds]);

  const { eta: sessionEta, incompleteCount } = useMemo(() => {
    return calculateSessionEta(remainingSeconds, tasks, activeTaskId);
  }, [remainingSeconds, tasks, activeTaskId]);

  // 9. Task Management Handlers
  const handleSelectActiveTask = useCallback((id: string) => {
    setActiveTaskId(id);
  }, []);

  const handleToggleTaskComplete = useCallback((id: string) => {
    setTasks((prev) => {
      return prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted && soundEnabled) {
            soundEngine.playCompletionGong();
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
    });
  }, [soundEnabled]);

  const handleToggleChime = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enableFiveMinChime: !t.enableFiveMinChime } : t))
    );
  }, []);

  const handleSaveTask = useCallback((
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>,
    taskId?: string
  ) => {
    if (taskId) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...taskData } : t))
      );
    } else {
      // Add new
      const newTask: Task = {
        id: `task-${Date.now()}`,
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);

      // If no active task, set this new task as active
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

  const handleClearAll = useCallback(() => {
    setTasks([]);
    setActiveTaskId(null);
    resetTimer();
  }, [resetTimer]);

  const handleSkipNext = useCallback(() => {
    const undoneTasks = tasks.filter((t) => !t.completed);
    if (undoneTasks.length <= 1) return;

    const currentIndex = undoneTasks.findIndex((t) => t.id === activeTaskId);
    const nextIndex = (currentIndex + 1) % undoneTasks.length;
    setActiveTaskId(undoneTasks[nextIndex].id);
    resetTimer();
  }, [tasks, activeTaskId, resetTimer]);

  // 10. Spacebar Shortcut for Play/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        // Don't intercept if user is typing in an input or modal is open
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          isTaskModalOpen ||
          isClearConfirmOpen
        ) {
          return;
        }
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, isTaskModalOpen, isClearConfirmOpen]);

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
          onReset={resetTimer}
          onSkipNext={handleSkipNext}
          onAdjustMinutes={adjustMinutes}
          onCompleteTask={handleTaskComplete}
        />

        {/* Task Queue List */}
        <TaskList
          tasks={tasks}
          activeTaskId={activeTaskId}
          onSelectActiveTask={handleSelectActiveTask}
          onToggleCompleteTask={handleToggleTaskComplete}
          onToggleChimeTask={handleToggleChime}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsTaskModalOpen(true);
          }}
          onDeleteTask={handleDeleteTask}
          onOpenAddModal={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
        />
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      <ClearConfirmModal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearAll}
        taskCount={tasks.length}
      />
    </div>
  );
}

export default App;
