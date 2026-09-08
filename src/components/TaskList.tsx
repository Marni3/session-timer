import React from 'react';
import { Plus, CheckCheck } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onSelectActiveTask: (taskId: string) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onToggleChimeTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddModal: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onToggleCompleteTask,
  onToggleChimeTask,
  onEditTask,
  onDeleteTask,
  onOpenAddModal,
}) => {
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <section className="w-full max-w-2xl mx-auto px-4 pb-20">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
          Tasks For This Session ({pendingTasks.length})
        </h3>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-emerald-500/50 hover:bg-[var(--color-surface-hover)] shadow-2xs transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Queue */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            No tasks set for this session.
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Drop in the 3 to 5 tasks you plan to focus on right now.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your First Task</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {/* Incomplete Tasks */}
          {pendingTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isActive={task.id === activeTaskId}
              onSelect={onSelectActiveTask}
              onToggleComplete={onToggleCompleteTask}
              onToggleChime={onToggleChimeTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}

          {/* Completed Tasks Divider & List */}
          {completedTasks.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2 px-1 text-xs font-medium text-[var(--color-text-muted)]">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Finished ({completedTasks.length})</span>
              </div>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isActive={false}
                    onSelect={onSelectActiveTask}
                    onToggleComplete={onToggleCompleteTask}
                    onToggleChime={onToggleChimeTask}
                    onEdit={onEditTask}
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
