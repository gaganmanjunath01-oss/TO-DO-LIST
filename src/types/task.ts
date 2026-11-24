export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type TaskFilterView = 'all' | 'pending' | 'completed' | 'overdue';
export type TaskSortBy =
  | 'due_asc'
  | 'due_desc'
  | 'priority_desc'
  | 'priority_asc'
  | 'created_desc';

export interface Task {
  id: string;
  userId: number;
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  category: string;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  category: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export const DEFAULT_CATEGORIES = [
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Learning',
] as const;

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(task: Task, today: string = getTodayDateString()): boolean {
  return (
    task.status === 'pending' &&
    Boolean(task.dueDate) &&
    (task.dueDate as string) < today
  );
}

export function isTaskDueToday(task: Task, today: string = getTodayDateString()): boolean {
  return task.status === 'pending' && task.dueDate === today;
}

export function formatDueDateLabel(
  dueDate: string | null,
  status: TaskStatus,
  today: string = getTodayDateString()
): { label: string; tone: 'overdue' | 'today' | 'normal' | 'none' } {
  if (!dueDate) {
    return { label: 'No due date', tone: 'none' };
  }

  const [y, m, d] = dueDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);

  if (status === 'pending' && dueDate < today) {
    const [ty, tm, td] = today.split('-').map(Number);
    const todayObj = new Date(ty, tm - 1, td);
    const diffDays = Math.round(
      (todayObj.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      label: `Overdue (${diffDays}d) · ${formatted}`,
      tone: 'overdue',
    };
  }

  if (status === 'pending' && dueDate === today) {
    return { label: `Due today · ${formatted}`, tone: 'today' };
  }

  return { label: formatted, tone: 'normal' };
}
