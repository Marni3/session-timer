import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerStatus, Task } from '../types';
import { soundEngine } from '../lib/sound';

interface UseTimerOptions {
  activeTask: Task | null;
  soundEnabled: boolean;
  onTaskTick: (taskId: string, deltaSec: number) => void;
  onAdjustTaskTime: (taskId: string, deltaMins: number) => void;
  onResetTaskTime: (taskId: string) => void;
}

export function useTimer({
  activeTask,
  soundEnabled,
  onTaskTick,
  onAdjustTaskTime,
  onResetTaskTime,
}: UseTimerOptions) {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(
    activeTask ? activeTask.remainingSeconds : 25 * 60
  );

  // References for drift calculation and interval tracking
  const lastTickRef = useRef<number | null>(null);
  const elapsedSinceLastChimeRef = useRef<number>(0);
  const hasTriggeredZeroCompletionRef = useRef<boolean>(false);
  const activeTaskIdRef = useRef<string | null>(activeTask?.id || null);

  // Keep activeTaskIdRef current
  useEffect(() => {
    activeTaskIdRef.current = activeTask?.id || null;
  }, [activeTask?.id]);

  // Sync remaining seconds when switching active tasks
  useEffect(() => {
    if (activeTask) {
      setRemainingSeconds(activeTask.remainingSeconds);
      hasTriggeredZeroCompletionRef.current = activeTask.remainingSeconds <= 0;
      elapsedSinceLastChimeRef.current = 0;
    } else {
      setRemainingSeconds(0);
      setTimerStatus('idle');
    }
  }, [activeTask?.id]);

  // Main countdown engine with drift compensation
  useEffect(() => {
    if (timerStatus !== 'running' || !activeTask) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      if (!lastTickRef.current) {
        lastTickRef.current = now;
        return;
      }

      const deltaMs = now - lastTickRef.current;
      const deltaSec = Math.floor(deltaMs / 1000);

      if (deltaSec > 0) {
        lastTickRef.current = now - (deltaMs % 1000); // Preserve remainder for sub-second precision

        const currentTaskId = activeTaskIdRef.current;
        if (currentTaskId) {
          onTaskTick(currentTaskId, deltaSec);
        }

        setRemainingSeconds((prev) => {
          const nextSeconds = prev - deltaSec;

          // Check for exact zero transition (initial completion alert)
          if (prev > 0 && nextSeconds <= 0 && !hasTriggeredZeroCompletionRef.current) {
            hasTriggeredZeroCompletionRef.current = true;
            if (soundEnabled) {
              soundEngine.playCompletionGong();
            }
          }

          return nextSeconds;
        });

        // 5-minute recurring focus nudge chime
        if (activeTask.enableFiveMinChime) {
          elapsedSinceLastChimeRef.current += deltaSec;
          if (elapsedSinceLastChimeRef.current >= 300) { // 300 seconds = 5 minutes
            elapsedSinceLastChimeRef.current = 0;
            if (soundEnabled) {
              soundEngine.playFocusChime();
            }
          }
        }
      }
    }, 250); // Frequent poll for buttery-smooth responsiveness

    return () => clearInterval(interval);
  }, [timerStatus, soundEnabled, activeTask?.id, activeTask?.enableFiveMinChime, onTaskTick]);

  // Handle visibility change (tab switching / sleep wake-up)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerStatus === 'running' && lastTickRef.current && activeTask) {
        const now = Date.now();
        const deltaMs = now - lastTickRef.current;
        const deltaSec = Math.floor(deltaMs / 1000);
        if (deltaSec > 0) {
          lastTickRef.current = now - (deltaMs % 1000);
          onTaskTick(activeTask.id, deltaSec);
          setRemainingSeconds((prev) => prev - deltaSec);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerStatus, activeTask?.id, onTaskTick]);

  const startTimer = useCallback(() => {
    if (!activeTask) return;
    setTimerStatus('running');
    lastTickRef.current = Date.now();
    if (soundEnabled) {
      soundEngine.playTactileClick('start');
    }
  }, [activeTask, soundEnabled]);

  const pauseTimer = useCallback(() => {
    setTimerStatus('paused');
    lastTickRef.current = null;
    if (soundEnabled) {
      soundEngine.playTactileClick('stop');
    }
  }, [soundEnabled]);

  const togglePlayPause = useCallback(() => {
    if (timerStatus === 'running') {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [timerStatus, startTimer, pauseTimer]);

  const resetTimer = useCallback(() => {
    setTimerStatus('idle');
    lastTickRef.current = null;
    elapsedSinceLastChimeRef.current = 0;
    hasTriggeredZeroCompletionRef.current = false;
    if (activeTask) {
      onResetTaskTime(activeTask.id);
      setRemainingSeconds(activeTask.durationMinutes * 60);
    }
    if (soundEnabled) {
      soundEngine.playTactileClick('stop');
    }
  }, [activeTask, soundEnabled, onResetTaskTime]);

  const adjustMinutes = useCallback((deltaMins: number) => {
    if (!activeTask) return;
    onAdjustTaskTime(activeTask.id, deltaMins);
    setRemainingSeconds((prev) => prev + deltaMins * 60);
  }, [activeTask, onAdjustTaskTime]);

  return {
    timerStatus,
    setTimerStatus,
    remainingSeconds,
    isOverrun: remainingSeconds < 0,
    startTimer,
    pauseTimer,
    togglePlayPause,
    resetTimer,
    adjustMinutes,
  };
}
