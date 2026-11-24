import {
  AlertTriangle,
  Calendar,
  Check,
  Flag,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  formatDueDateLabel,
  isTaskOverdue,
  type Task,
  type TaskPriority,
} from '../types/task.ts';

interface TaskListProps {
  tasks: Task[];
  totalTaskCount: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDeleteRequest: (task: Task) => void;
  onCreateNew: () => void;
  onClearFilters: () => void;
  togglingId: string | null;
}

const PRIORITY_LABEL: Record<TaskPriority, { text: string; colorClass: string }> = {
  high: { text: 'High priority', colorClass: 'text-amber-700 font-medium' },
  medium: { text: 'Medium priority', colorClass: 'text-slate-600' },
  low: { text: 'Low priority', colorClass: 'text-slate-500' },
};

export function TaskList({
  tasks,
  totalTaskCount,
  loading,
  error,
  onRetry,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
  onCreateNew,
  onClearFilters,
  togglingId,
}: TaskListProps) {
  if (loading) {
    return (
      <div
        aria-label="Loading tasks"
        className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200"
      >
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="p-4 sm:p-5 flex items-start gap-4 animate-pulse">
            <div className="w-6 h-6 rounded-md bg-slate-200 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="bg-white border border-red-200 rounded-xl p-6 text-center"
      >
        <AlertTriangle
          className="w-7 h-7 text-red-600 mx-auto mb-2"
          aria-hidden="true"
        />
        <h2 className="font-display text-base font-semibold text-slate-900">
          Could not load your tasks
        </h2>
        <p className="mt-1 text-sm text-slate-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 min-h-[40px] px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    const isTrulyEmpty = totalTaskCount === 0;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
        <h2 className="font-display text-base font-semibold text-slate-900">
          {isTrulyEmpty ? 'No tasks yet' : 'No tasks match your filters'}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 max-w-md mx-auto">
          {isTrulyEmpty
            ? 'Create your first task with a title, due date, priority, and category to start organizing your day.'
            : 'Adjust your search keyword, category selection, or status filter to view other tasks.'}
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          {isTrulyEmpty ? (
            <button
              type="button"
              onClick={onCreateNew}
              className="min-h-[40px] inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Create First Task</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClearFilters}
              className="min-h-[40px] inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-200">
      {tasks.map((task) => {
        const isCompleted = task.status === 'completed';
        const overdue = isTaskOverdue(task);
        const dueMeta = formatDueDateLabel(task.dueDate, task.status);
        const priorityMeta = PRIORITY_LABEL[task.priority] ?? PRIORITY_LABEL.medium;
        const isToggling = togglingId === task.id;

        return (
          <article
            key={task.id}
            className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-colors ${
              isCompleted ? 'bg-slate-50/60' : 'hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <button
                type="button"
                disabled={isToggling}
                onClick={() => onToggleComplete(task)}
                aria-label={
                  isCompleted
                    ? `Mark "${task.title}" as pending`
                    : `Mark "${task.title}" as completed`
                }
                aria-pressed={isCompleted}
                className={`mt-0.5 w-6 h-6 min-w-[24px] rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-300 text-transparent hover:border-blue-600'
                } ${isToggling ? 'opacity-60' : ''}`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              </button>

              <div className="min-w-0 flex-1">
                <h3
                  className={`font-display text-base font-semibold leading-snug ${
                    isCompleted
                      ? 'text-slate-500 line-through'
                      : 'text-slate-900'
                  }`}
                >
                  {task.title}
                </h3>

                {task.description && (
                  <p
                    className={`mt-1 text-sm leading-relaxed ${
                      isCompleted ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">
                    {task.category}
                  </span>
                  <span aria-hidden="true">·</span>

                  <span
                    className={`inline-flex items-center gap-1 ${priorityMeta.colorClass}`}
                  >
                    <Flag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{priorityMeta.text}</span>
                  </span>
                  <span aria-hidden="true">·</span>

                  <span
                    className={`inline-flex items-center gap-1 font-mono tabular-nums ${
                      dueMeta.tone === 'overdue'
                        ? 'text-red-600 font-semibold'
                        : dueMeta.tone === 'today'
                        ? 'text-amber-700 font-medium'
                        : 'text-slate-500'
                    }`}
                  >
                    {overdue ? (
                      <AlertTriangle
                        className="w-3.5 h-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <Calendar
                        className="w-3.5 h-3.5 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{dueMeta.label}</span>
                  </span>

                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      isCompleted
                        ? 'text-emerald-700 font-medium'
                        : 'text-slate-600'
                    }
                  >
                    {isCompleted ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:shrink-0 pl-9 sm:pl-0">
              <button
                type="button"
                onClick={() => onToggleComplete(task)}
                disabled={isToggling}
                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isCompleted ? 'Reopen' : 'Complete'}
              </button>

              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit "${task.title}"`}
                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onDeleteRequest(task)}
                aria-label={`Delete "${task.title}"`}
                className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
