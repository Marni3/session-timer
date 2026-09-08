import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskCount: number;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[var(--color-text-primary)]">
            Clear all session tasks?
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
            This will remove all {taskCount} {taskCount === 1 ? 'task' : 'tasks'} and reset the session timer. This action cannot be undone.
          </p>
        </div>

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
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};
