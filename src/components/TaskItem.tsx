import React from 'react';
import { Check, Bell, BellOff, Edit2, Trash2 } from 'lucide-react';
import { Task } from '../types';
import { formatDurationBadge } from '../lib/timeUtils';

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onSelect: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleChime: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isActive,
  onSelect,
  onToggleComplete,
  onToggleChime,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(task.id)}
      className={`group relative flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
        isActive
          ? 'bg-[var(--color-surface)] border-emerald-500/60 dark:border-emerald-500/50 shadow-sm ring-1 ring-emerald-500/20'
          : task.completed
          ? 'bg-[var(--color-canvas)] border-transparent opacity-50'
          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-2xs'
      }`}
    >
      {/* Left: Complete Checkbox & Text Info */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {/* Complete Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={`w-5 h-5 rounded-lg mt-0.5 sm:mt-0 flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
            task.completed
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-[var(--color-border)] hover:border-emerald-500/80 bg-[var(--color-canvas)]'
          }`}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Title & Description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm sm:text-base font-semibold leading-snug break-words ${
                task.completed
                  ? 'line-through text-[var(--color-text-muted)]'
                  : isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-[var(--color-text-primary)]'
              }`}
            >
              {task.title}
            </span>

            {isActive && !task.completed && (
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                Active
              </span>
            )}
          </div>

          {task.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1 font-normal">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Duration, Chime Toggle, Edit, Delete */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Duration Badge */}
        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-muted)] tabular-nums">
          {formatDurationBadge(task.durationMinutes)}
        </span>

        {/* 5-Min Chime Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleChime(task.id);
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            task.enableFiveMinChime
              ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-[var(--color-surface-hover)]'
          }`}
          title={task.enableFiveMinChime ? '5-min focus chime is ON' : '5-min focus chime is OFF'}
          aria-label="Toggle 5-minute chime"
        >
          {task.enableFiveMinChime ? (
            <Bell className="w-3.5 h-3.5 fill-current" />
          ) : (
            <BellOff className="w-3.5 h-3.5 opacity-60" />
          )}
        </button>

        {/* Edit Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="p-1.5 rounded-lg text-stone-400 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
          title="Edit task"
          aria-label="Edit task"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100"
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
