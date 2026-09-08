import React from 'react';
import { Play, Pause, SkipForward, Bell } from 'lucide-react';
import { Task, TimerStatus } from '../types';
import { formatTimerClock, formatEtaTime, calculateRingProgress } from '../lib/timeUtils';

interface TimerCircleProps {
  activeTask: Task | null;
  remainingSeconds: number;
  timerStatus: TimerStatus;
  activeEta: Date;
  onTogglePlayPause: () => void;
  onSkipNext: () => void;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  activeTask,
  remainingSeconds,
  timerStatus,
  activeEta,
  onTogglePlayPause,
  onSkipNext,
}) => {
  const isOverrun = remainingSeconds < 0;
  const totalDurationSeconds = activeTask ? activeTask.durationMinutes * 60 : 25 * 60;
  const progressRatio = calculateRingProgress(remainingSeconds, totalDurationSeconds);

  // SVG Geometry: radius 100, center (120, 120), circumference 2 * pi * 100
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <section className="flex flex-col items-center justify-center my-6 sm:my-10 px-4">
      {/* Central SVG Circular Ring */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
          {/* Background Track Ring */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-[var(--color-border)] fill-transparent transition-colors"
            strokeWidth="8"
          />

          {/* Active Progress Ring */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            className={`fill-transparent transition-all duration-300 ease-out ${
              isOverrun
                ? 'stroke-[var(--color-overtime)] animate-pulse'
                : 'stroke-[var(--color-accent)]'
            }`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Digital Clock & Overrun Indicator in Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {isOverrun && (
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-overtime)] px-2 py-0.5 rounded-full bg-[var(--color-overtime-tint)] mb-1">
              Overtime
            </span>
          )}

          <div
            className={`tabular-nums font-bold text-5xl sm:text-6xl tracking-tight transition-colors ${
              isOverrun ? 'text-[var(--color-overtime)]' : 'text-[var(--color-text-primary)]'
            }`}
          >
            {formatTimerClock(remainingSeconds)}
          </div>

          {/* Active Task ETA */}
          {activeTask && (
            <div className="text-xs font-medium text-[var(--color-text-muted)] mt-1.5 flex items-center gap-1">
              <span>{isOverrun ? 'Past target time' : `Finishes at ${formatEtaTime(activeEta)}`}</span>
              {activeTask.enableFiveMinChime && (
                <span title="5-min focus chime active" className="inline-flex items-center">
                  <Bell className="w-3 h-3 text-[var(--color-accent)] shrink-0" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Timer Controls */}
      <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
        {/* Start / Pause Button */}
        <button
          onClick={onTogglePlayPause}
          disabled={!activeTask}
          className={`flex items-center gap-2 px-8 sm:px-10 py-3.5 rounded-2xl font-semibold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer ${
            timerStatus === 'running'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              : 'bg-[var(--color-accent)] hover:opacity-90 text-white shadow-xs'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {timerStatus === 'running' ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>{timerStatus === 'paused' ? 'Resume' : 'Start Focus'}</span>
            </>
          )}
        </button>

        {/* Skip to Next Task */}
        <button
          onClick={onSkipNext}
          disabled={!activeTask}
          className="p-3.5 rounded-2xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          title="Skip to next undone task"
          aria-label="Skip task"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {!activeTask && (
        <div className="text-center mt-5 text-xs sm:text-sm text-[var(--color-text-muted)]">
          No active task. Select or add a task below to start your focus session.
        </div>
      )}
    </section>
  );
};
