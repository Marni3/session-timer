import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: { clearUnfinished: boolean }) => void;
  unfinishedCount: number;
  finishedCount: number;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  unfinishedCount,
  finishedCount,
}) => {
  const [clearUnfinished, setClearUnfinished] = useState(true);

  // Reset to default "true" (clearing all) every time modal is opened
  useEffect(() => {
    if (isOpen) {
      setClearUnfinished(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalCount = unfinishedCount + finishedCount;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div 
        className="w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            Clear session tasks?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
            {clearUnfinished
              ? `This will remove all ${totalCount} ${totalCount === 1 ? 'task' : 'tasks'} (finished and unfinished) and reset your session timer.`
              : finishedCount > 0
              ? `This will remove ${finishedCount} finished ${finishedCount === 1 ? 'task' : 'tasks'}, while keeping your ${unfinishedCount} unfinished ${unfinishedCount === 1 ? 'task' : 'tasks'} intact.`
              : 'You have no finished tasks to clear. Unfinished tasks will be preserved.'}
          </p>
        </div>

        {/* Checkbox for Clear Unfinished Tasks */}
        {unfinishedCount > 0 && (
          <label className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] cursor-pointer select-none transition-colors hover:border-stone-300 dark:hover:border-stone-700">
            <input
              type="checkbox"
              checked={clearUnfinished}
              onChange={(e) => setClearUnfinished(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[var(--color-accent)] focus:ring-[var(--color-accent)] cursor-pointer accent-[var(--color-accent)]"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                Clear unfinished tasks
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5">
                {clearUnfinished
                  ? 'All tasks including unfinished ones will be cleared'
                  : `Keep ${unfinishedCount} unfinished ${unfinishedCount === 1 ? 'task' : 'tasks'} in your session`}
              </span>
            </div>
          </label>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm({ clearUnfinished });
              onClose();
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {clearUnfinished ? 'Clear All' : 'Clear Finished'}
          </button>
        </div>
      </div>
    </div>
  );
};

