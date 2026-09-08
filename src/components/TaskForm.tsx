import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';
import { Task } from '../types';

interface TaskFormProps {
  initialTask?: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>, taskId?: string) => void;
  onCancel: () => void;
}

const PRESET_MINUTES = [15, 25, 45, 60];

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [durationMinutes, setDurationMinutes] = useState(initialTask?.durationMinutes || 25);
  const [description, setDescription] = useState(initialTask?.description || '');
  const [enableFiveMinChime, setEnableFiveMinChime] = useState(
    initialTask ? initialTask.enableFiveMinChime : true
  );

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDurationMinutes(initialTask.durationMinutes);
      setDescription(initialTask.description || '');
      setEnableFiveMinChime(initialTask.enableFiveMinChime);
    }
  }, [initialTask]);

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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="bg-[var(--color-surface)] border border-[var(--color-accent)]/50 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all"
    >
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
          {initialTask ? 'Edit Task' : 'What are you working on?'}
        </label>
        <input
          type="text"
          autoFocus
          required
          placeholder="e.g. Draft Substack essay introduction"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm font-medium transition-all"
        />
      </div>

      {/* Duration */}
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-xs sm:text-sm font-medium tabular-nums"
            />
            <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-1">
            {PRESET_MINUTES.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDurationMinutes(mins)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  durationMinutes === mins
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Note / Description */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
          Note / Description (Markdown supported: **bold**, *italic*, `code`, [link](url), - list)
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Focus on key takeaway, don't edit while drafting. [Reference link](https://...)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-xs font-normal resize-y transition-all"
        />
      </div>

      {/* 5-Min Focus Chime Toggle */}
      <label className="flex items-center gap-2.5 p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={enableFiveMinChime}
          onChange={(e) => setEnableFiveMinChime(e.target.checked)}
          className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
        />
        <div className="flex items-center gap-1.5 flex-1 text-xs font-medium text-[var(--color-text-primary)]">
          <Bell className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>5-Minute Focus Nudge Chime</span>
        </div>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 text-xs sm:text-sm font-semibold bg-[var(--color-accent)] hover:opacity-90 text-white rounded-xl shadow-xs transition-opacity cursor-pointer"
        >
          {initialTask ? 'Save Changes' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};
