import React, { useState, useEffect } from 'react';
import { X, Clock, Bell } from 'lucide-react';
import { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>, taskId?: string) => void;
  initialTask?: Task | null;
}

const PRESET_MINUTES = [15, 25, 45, 60];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [description, setDescription] = useState('');
  const [enableFiveMinChime, setEnableFiveMinChime] = useState(true);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDurationMinutes(initialTask.durationMinutes);
      setDescription(initialTask.description || '');
      setEnableFiveMinChime(initialTask.enableFiveMinChime);
    } else {
      setTitle('');
      setDurationMinutes(25);
      setDescription('');
      setEnableFiveMinChime(true);
    }
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(
      {
        title: title.trim(),
        durationMinutes: Math.max(1, durationMinutes),
        description: description.trim() || undefined,
        enableFiveMinChime,
      },
      initialTask ? initialTask.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">
            {initialTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              Task Title
            </label>
            <input
              type="text"
              autoFocus
              required
              placeholder="e.g. Draft ECE Lab introduction"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-medium transition-all"
            />
          </div>

          {/* Duration with presets */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              Estimated Duration (Minutes)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="480"
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-medium tabular-nums"
                />
                <Clock className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-2.5 pointer-events-none" />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1">
                {PRESET_MINUTES.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      durationMinutes === mins
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              Short Description / Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Focus on section 2.1, don't check social media."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-xs sm:text-sm font-normal resize-none transition-all"
            />
          </div>

          {/* 5-Min Focus Chime Toggle */}
          <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={enableFiveMinChime}
              onChange={(e) => setEnableFiveMinChime(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="flex items-center gap-1.5 flex-1 text-xs font-medium text-[var(--color-text-primary)]">
              <Bell className="w-3.5 h-3.5 text-emerald-500" />
              <span>5-Minute Focus Nudge Chime</span>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {initialTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
