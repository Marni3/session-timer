import React, { useState, useEffect } from 'react';
import { Check, Bell, BellOff, Edit2, Trash2, Play, Pause, RotateCcw, GripVertical, Clock, X, Save } from 'lucide-react';
import { Task, TimerStatus } from '../types';
import { formatTaskProgressBadge, formatFocusTime, formatTimerClock } from '../lib/timeUtils';
import { MarkdownText } from './MarkdownText';

const PRESET_MINUTES = [15, 25, 45, 60];

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  isEditing?: boolean;
  onSelect: (taskId: string) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleChime: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onCancelEdit: () => void;
  onSaveEdit: (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'remainingSeconds' | 'actualDurationSeconds'>,
    taskId: string
  ) => void;
  onDelete: (taskId: string) => void;
  onAdjustMinutes?: (delta: number) => void;
  onResetTime?: () => void;
  onTogglePlayPause?: () => void;
  timerStatus?: TimerStatus;
  index?: number;
  onDragStartItem?: (index: number) => void;
  onDragOverItem?: (index: number) => void;
  onDragEndItem?: () => void;
  onDropItem?: (index: number) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isActive,
  isEditing = false,
  onSelect,
  onToggleComplete,
  onToggleChime,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAdjustMinutes,
  onResetTime,
  onTogglePlayPause,
  timerStatus,
  index,
  onDragStartItem,
  onDragOverItem,
  onDragEndItem,
  onDropItem,
  isDragging,
  isDragOver,
}) => {
  // Local edit form state — mirrors TaskForm but lives here for the expand animation
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDuration, setEditDuration] = useState(task.durationMinutes);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editChime, setEditChime] = useState(task.enableFiveMinChime);

  // When the task prop changes (e.g. from a save), sync local state
  useEffect(() => {
    setEditTitle(task.title);
    setEditDuration(task.durationMinutes);
    setEditDescription(task.description || '');
    setEditChime(task.enableFiveMinChime);
  }, [task.id, task.title, task.durationMinutes, task.description, task.enableFiveMinChime]);

  // Reset form to task values when editing is opened
  useEffect(() => {
    if (isEditing) {
      setEditTitle(task.title);
      setEditDuration(task.durationMinutes);
      setEditDescription(task.description || '');
      setEditChime(task.enableFiveMinChime);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onSaveEdit(
      {
        title: editTitle.trim(),
        durationMinutes: Math.max(1, editDuration),
        description: editDescription.trim() || undefined,
        enableFiveMinChime: editChime,
      },
      task.id
    );
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancelEdit();
    }
  };

  return (
    <div
      onClick={() => !isEditing && onSelect(task.id)}
      onDragOver={(e) => {
        if (typeof index === 'number' && onDragOverItem) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          onDragOverItem(index);
        }
      }}
      onDrop={(e) => {
        if (typeof index === 'number' && onDropItem) {
          e.preventDefault();
          e.stopPropagation();
          onDropItem(index);
        }
      }}
      className={`group relative flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all ${isEditing ? 'cursor-default' : 'cursor-pointer'} ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-dashed border-[var(--color-accent)]'
          : isDragOver
          ? 'border-t-2 border-t-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20'
          : isEditing
          ? 'bg-[var(--color-surface)] border-[var(--color-accent)]/60 shadow-md ring-1 ring-[var(--color-accent)]/20'
          : isActive
          ? 'bg-[var(--color-surface)] border-[var(--color-accent)]/60 shadow-sm ring-1 ring-[var(--color-accent)]/20'
          : task.completed
          ? 'bg-[var(--color-canvas)] border-transparent opacity-50'
          : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-2xs'
      }`}
    >
      {/* Top Row: Left Checkbox & Title, Right Badges & Actions */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Complete Checkbox & Text Info */}
        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Drag Grip Handle */}
          {!task.completed && !isEditing && onDragStartItem && typeof index === 'number' && (
            <div
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', index.toString());
                onDragStartItem(index);
              }}
              onDragEnd={() => {
                onDragEndItem?.();
              }}
              className="p-1 -ml-1 mt-0.5 text-stone-300 dark:text-stone-700 hover:text-stone-500 dark:hover:text-stone-400 cursor-grab active:cursor-grabbing transition-colors shrink-0"
              title="Drag to reorder task"
              aria-label="Drag to reorder task"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          {/* Complete Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`w-5 h-5 rounded-lg mt-0.5 flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
              task.completed
                ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/80 bg-[var(--color-canvas)]'
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
                    ? 'text-[var(--color-accent)] font-bold'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {task.title}
              </span>

              {isActive && !task.completed && (
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-accent-tint)] text-[var(--color-accent)]">
                  Active
                </span>
              )}
            </div>

            {/* Description — only shown when NOT editing */}
            {!isEditing && task.description && (
              <div className="mt-2.5 px-3 py-2 rounded-xl bg-[var(--color-canvas)]/80 dark:bg-[var(--color-canvas)] border border-[var(--color-border)]/70 text-xs text-[var(--color-text-muted)] font-normal">
                <MarkdownText content={task.description} />
              </div>
            )}
          </div>
        </div>

        {/* Right: Duration, Chime Toggle, Edit, Delete */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Duration Badge */}
          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-muted)] tabular-nums">
            {formatTaskProgressBadge(task)}
          </span>

          {/* 5-Min Chime Toggle */}
          {!isEditing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleChime(task.id);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                task.enableFiveMinChime
                  ? 'text-[var(--color-accent)] hover:bg-[var(--color-accent-tint)]'
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
          )}

          {/* Edit / Cancel-Edit Button */}
          {isEditing ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancelEdit();
              }}
              className="p-1.5 rounded-lg text-stone-400 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
              title="Cancel editing"
              aria-label="Cancel editing"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
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
          )}

          {/* Delete Button */}
          {!isEditing && (
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
          )}
        </div>
      </div>

      {/* ── Inline Edit Form (expands in place) ── */}
      <div className={`expand-grid${isEditing ? ' is-open' : ''}`}>
        <div className="expand-grid-inner">
          <form
            onSubmit={handleSaveEdit}
            onKeyDown={handleEditKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="pt-3 mt-3 border-t border-[var(--color-border)]/60 space-y-3"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Task Name
              </label>
              <input
                type="text"
                required
                autoFocus={isEditing}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Draft Substack essay introduction"
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-sm font-medium transition-all"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Estimated Duration
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-28 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="480"
                    required
                    value={editDuration}
                    onChange={(e) =>
                      setEditDuration(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-xs font-medium tabular-nums"
                  />
                  <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)] absolute left-3 top-2.5 pointer-events-none" />
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  {PRESET_MINUTES.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEditDuration(mins)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        editDuration === mins
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

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1">
                Note / Description{' '}
                <span className="font-normal opacity-60">(Markdown: **bold**, *italic*, `code`, [link](url))</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Focus on key takeaway, don't edit while drafting."
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 text-xs font-normal resize-y transition-all"
              />
            </div>

            {/* Chime Toggle */}
            <label className="flex items-center gap-2.5 p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editChime}
                onChange={(e) => setEditChime(e.target.checked)}
                className="w-4 h-4 rounded accent-[var(--color-accent)] cursor-pointer"
              />
              <div className="flex items-center gap-1.5 flex-1 text-xs font-medium text-[var(--color-text-primary)]">
                <Bell className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>5-Minute Focus Nudge Chime</span>
              </div>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pb-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelEdit();
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-[var(--color-accent)] hover:opacity-90 text-white rounded-xl shadow-xs transition-opacity cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3 h-3" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Active Task Dedicated Timer Controls Strip */}
      {isActive && !task.completed && !isEditing && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-3 border-t border-[var(--color-border)]/60 flex flex-wrap items-center justify-between gap-2 text-xs"
        >
          {/* Left: Focus spent & remaining stats */}
          <div className="flex items-center gap-2 text-[var(--color-text-muted)] tabular-nums">
            <span>
              Spent: <strong className="text-[var(--color-text-primary)] font-semibold">{formatFocusTime(task.actualDurationSeconds)}</strong>
            </span>
            <span className="opacity-40">•</span>
            <span>
              Remaining: <strong className={task.remainingSeconds < 0 ? 'text-[var(--color-overtime)] font-bold' : 'text-[var(--color-text-primary)] font-semibold'}>{formatTimerClock(task.remainingSeconds)}</strong>
            </span>
          </div>

          {/* Right: Task Timer Controls */}
          <div className="flex items-center gap-1.5">
            {onTogglePlayPause && (
              <button
                type="button"
                onClick={onTogglePlayPause}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                  timerStatus === 'running'
                    ? 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                    : 'bg-[var(--color-accent)] text-white hover:opacity-90'
                }`}
                title={timerStatus === 'running' ? 'Pause focus timer' : 'Start focus timer'}
              >
                {timerStatus === 'running' ? (
                  <>
                    <Pause className="w-3 h-3 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Focus</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onAdjustMinutes?.(-5)}
              disabled={task.remainingSeconds <= 300}
              className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium disabled:opacity-40 transition-colors cursor-pointer"
              title="Subtract 5 minutes from this task"
            >
              -5m
            </button>

            <button
              type="button"
              onClick={() => onAdjustMinutes?.(5)}
              className="px-2 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] font-medium transition-colors cursor-pointer"
              title="Add 5 minutes to this task"
            >
              +5m
            </button>

            <button
              type="button"
              onClick={() => onResetTime?.()}
              className="p-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              title="Reset timer to task estimate"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
