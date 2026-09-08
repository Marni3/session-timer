import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerStatus, Task } from '../types';
import { soundEngine } from '../lib/sound';

interface UseTimerOptions {
  activeTask: Task | null;
  soundEnabled: boolean;
  initialRemainingSeconds: number;
}

export function useTimer({
  activeTask,
  soundEnabled,
  initialRemainingSeconds,
}: UseTimerOptions) {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialRemainingSeconds);

  // References for drift calculation and interval tracking
  const lastTickRef = useRef<number | null>(null);
  const elapsedSinceLastChimeRef = useRef<number>(0);
  const hasTriggeredZeroCompletionRef = useRef<boolean>(false);

  // Sync remaining seconds when switching active tasks while idle
  useEffect(() => {
    if (timerStatus === 'idle' && activeTask) {
      setRemainingSeconds(activeTask.durationMinutes * 60);
      elapsedSinceLastChimeRef.current = 0;
      hasTriggeredZeroCompletionRef.current = false;
    }
  }, [activeTask?.id, timerStatus]);

  // Main countdown engine with drift compensation
  useEffect(() => {
    if (timerStatus !== 'running') {
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
        if (activeTask?.enableFiveMinChime) {
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
  }, [timerStatus, soundEnabled, activeTask?.enableFiveMinChime]);

  // Handle visibility change (tab switching / sleep wake-up)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && timerStatus === 'running' && lastTickRef.current) {
        const now = Date.now();
        const deltaSec = Math.floor((now - lastTickRef.current) / 1000);
        if (deltaSec > 0) {
          lastTickRef.current = now;
          setRemainingSeconds((prev) => prev - deltaSec);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [timerStatus]);

  const startTimer = useCallback(() => {
    setTimerStatus('running');
    lastTickRef.current = Date.now();
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerStatus('paused');
    lastTickRef.current = null;
  }, []);

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
      setRemainingSeconds(activeTask.durationMinutes * 60);
    }
  }, [activeTask]);

  const adjustMinutes = useCallback((deltaMins: number) => {
    setRemainingSeconds((prev) => prev + deltaMins * 60);
  }, []);

  return {
    timerStatus,
    remainingSeconds,
    isOverrun: remainingSeconds < 0,
    startTimer,
    pauseTimer,
    togglePlayPause,
    resetTimer,
    adjustMinutes,
    setRemainingSeconds,
  };
}
