import React, { useState } from 'react';
import { Plus, CheckCheck } from 'lucide-react';
import { Task, TimerStatus } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm'; // still used for the "add new task" form

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onToggleChimeTask: (taskId: string) => void;
  onSaveTask: (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'remainingSeconds' | 'actualDurationSeconds'>,
    taskId?: string
  ) => void;
  onDeleteTask: (taskId: string) => void;
  onAdjustMinutes?: (delta: number) => void;
  onResetTime?: () => void;
  onTogglePlayPause?: () => void;
  timerStatus?: TimerStatus;
  onReorderTasks?: (reorderedPending: Task[]) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onToggleCompleteTask,
  onToggleChimeTask,
  onSaveTask,
  onDeleteTask,
  onAdjustMinutes,
  onResetTime,
  onTogglePlayPause,
  timerStatus,
  onReorderTasks,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (dropTargetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== dropTargetIndex && onReorderTasks) {
      const reordered = [...pendingTasks];
      const [moved] = reordered.splice(draggedIndex, 1);
      reordered.splice(dropTargetIndex, 0, moved);
      onReorderTasks(reordered);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = (
    taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'remainingSeconds' | 'actualDurationSeconds'>,
    taskId?: string
  ) => {
    onSaveTask(taskData, taskId);
    setIsAdding(false);
    setEditingTaskId(null);
  };

  return (
    <section className="w-full max-w-2xl mx-auto px-4 pb-20">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Tasks For This Session ({pendingTasks.length})
        </h3>

        {!isAdding && (
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingTaskId(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-surface-hover)] shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Task Queue */}
      {tasks.length === 0 && !isAdding ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No tasks set for this session.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Drop in the 3 to 5 tasks you plan to focus on right now.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your First Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Incomplete Tasks */}
          {pendingTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              isActive={task.id === activeTaskId}
              isEditing={editingTaskId === task.id}
              onSelect={onSelectActiveTask}
              onToggleComplete={onToggleCompleteTask}
              onToggleChime={onToggleChimeTask}
              onEdit={() => {
                setEditingTaskId(task.id);
                setIsAdding(false);
              }}
              onCancelEdit={() => setEditingTaskId(null)}
              onSaveEdit={(taskData, taskId) => {
                onSaveTask(taskData, taskId);
                setEditingTaskId(null);
              }}
              onDelete={onDeleteTask}
              onAdjustMinutes={onAdjustMinutes}
              onResetTime={onResetTime}
              onTogglePlayPause={onTogglePlayPause}
              timerStatus={timerStatus}
              onDragStartItem={handleDragStart}
              onDragOverItem={handleDragOver}
              onDragEndItem={handleDragEnd}
              onDropItem={handleDrop}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index}
            />
          ))}

          {/* Inline Add Task Form */}
          {isAdding ? (
            <TaskForm
              onSave={handleSave}
              onCancel={() => setIsAdding(false)}
            />
          ) : (
            pendingTasks.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsAdding(true);
                  setEditingTaskId(null);
                }}
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)]/50 bg-[var(--color-surface)]/40 hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            )
          )}

          {/* Completed Tasks Divider & List */}
          {completedTasks.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2 px-1 text-xs font-medium text-[var(--color-text-muted)]">
                <CheckCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Finished ({completedTasks.length})</span>
              </div>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isActive={false}
                    isEditing={editingTaskId === task.id}
                    onSelect={onSelectActiveTask}
                    onToggleComplete={onToggleCompleteTask}
                    onToggleChime={onToggleChimeTask}
                    onEdit={() => {
                      setEditingTaskId(task.id);
                      setIsAdding(false);
                    }}
                    onCancelEdit={() => setEditingTaskId(null)}
                    onSaveEdit={(taskData, taskId) => {
                      onSaveTask(taskData, taskId);
                      setEditingTaskId(null);
                    }}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
