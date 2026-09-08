import React, { useEffect } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { Task } from '../types';
import { formatTimerClock } from '../lib/timeUtils';

interface SwitchTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwitch: () => void;
  currentTask: Task | null;
  targetTask: Task | null;
  isTimerRunning: boolean;
}

export const SwitchTaskModal: React.FC<SwitchTaskModalProps> = ({
  isOpen,
  onClose,
  onConfirmSwitch,
  currentTask,
  targetTask,
  isTimerRunning,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !currentTask || !targetTask) return null;

  const spentMinutes = Math.floor(currentTask.actualDurationSeconds / 60);
  const spentSeconds = currentTask.actualDurationSeconds % 60;
  const spentFormatted = spentMinutes > 0
    ? `${spentMinutes}m ${spentSeconds}s`
    : `${spentSeconds}s`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
              Switch Active Task?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="space-y-2.5 text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">
          <p>
            You are currently working on <strong className="text-[var(--color-text-primary)] font-semibold">{currentTask.title}</strong>
            {isTimerRunning ? ' with the timer running.' : '.'}
          </p>

          <div className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-1">
            <div className="flex justify-between text-xs">
              <span>Time spent on this task:</span>
              <strong className="text-[var(--color-text-primary)] tabular-nums">{spentFormatted}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span>Time remaining:</span>
              <strong className="text-[var(--color-text-primary)] tabular-nums">{formatTimerClock(currentTask.remainingSeconds)}</strong>
            </div>
          </div>

          <p>
            Switching will pause and safely save your progress on this task, then activate <strong className="text-[var(--color-text-primary)] font-semibold">{targetTask.title}</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-xl transition-colors cursor-pointer"
          >
            Keep Focusing
          </button>
          <button
            type="button"
            onClick={onConfirmSwitch}
            className="px-5 py-2 text-xs sm:text-sm font-semibold bg-[var(--color-accent)] hover:opacity-90 text-white rounded-xl shadow-xs transition-opacity cursor-pointer"
          >
            Switch Task
          </button>
        </div>
      </div>
    </div>
  );
};
