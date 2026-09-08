import React from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Minus, Bell, CheckCircle2 } from 'lucide-react';
import { Task, TimerStatus } from '../types';
import { formatTimerClock, formatEtaTime, calculateRingProgress } from '../lib/timeUtils';

interface TimerCircleProps {
  activeTask: Task | null;
  remainingSeconds: number;
  timerStatus: TimerStatus;
  activeEta: Date;
  onTogglePlayPause: () => void;
  onReset: () => void;
  onSkipNext: () => void;
  onAdjustMinutes: (delta: number) => void;
  onCompleteTask: (taskId: string) => void;
}

export const TimerCircle: React.FC<TimerCircleProps> = ({
  activeTask,
  remainingSeconds,
  timerStatus,
  activeEta,
  onTogglePlayPause,
  onReset,
  onSkipNext,
  onAdjustMinutes,
  onCompleteTask,
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
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-overtime)] px-2 py-0.5 rounded-full bg-amber-500/10 mb-1">
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
                  <Bell className="w-3 h-3 text-emerald-500 shrink-0" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Timer Controls */}
      <div className="flex items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
        {/* Quick -5 min */}
        <button
          onClick={() => onAdjustMinutes(-5)}
          disabled={!activeTask || remainingSeconds <= 300}
          className="p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          title="Subtract 5 minutes"
          aria-label="Subtract 5 minutes"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Start / Pause Button */}
        <button
          onClick={onTogglePlayPause}
          disabled={!activeTask}
          className={`flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl font-semibold text-sm sm:text-base transition-all shadow-md active:scale-98 cursor-pointer ${
            timerStatus === 'running'
              ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
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

        {/* Quick +5 min */}
        <button
          onClick={() => onAdjustMinutes(5)}
          disabled={!activeTask}
          className="p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          title="Add 5 minutes"
          aria-label="Add 5 minutes"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Reset Active Task Timer */}
        <button
          onClick={onReset}
          disabled={!activeTask}
          className="p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          title="Reset timer to task duration"
          aria-label="Reset timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Skip to Next Task */}
        <button
          onClick={onSkipNext}
          disabled={!activeTask}
          className="p-2.5 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          title="Skip to next undone task"
          aria-label="Skip task"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Active Task Details & Quick Checkoff */}
      {activeTask ? (
        <div className="max-w-md w-full text-center mt-5 px-4">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {activeTask.title}
            </h2>
            <button
              onClick={() => onCompleteTask(activeTask.id)}
              className="text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1 transition-colors cursor-pointer"
              title="Mark completed"
              aria-label="Mark task completed"
            >
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {activeTask.description && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1 font-normal leading-relaxed line-clamp-2">
              {activeTask.description}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center mt-5 text-sm text-[var(--color-text-muted)]">
          All tasks finished! Add a new task below to start another block.
        </div>
      )}
    </section>
  );
};
