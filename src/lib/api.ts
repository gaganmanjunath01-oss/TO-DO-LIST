import type { Task, TaskFormValues, TaskStatus } from '../types/task.ts';

async function requestJson<T>(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage =
      typeof payload?.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export async function fetchTasks(token: string): Promise<Task[]> {
  const data = await requestJson<{ tasks: Task[] }>('/api/tasks', token);
  return data.tasks;
}

export async function createTask(
  token: string,
  values: TaskFormValues
): Promise<Task> {
  const data = await requestJson<{ task: Task }>('/api/tasks', token, {
    method: 'POST',
    body: JSON.stringify({
      title: values.title,
      description: values.description,
      dueDate: values.dueDate || null,
      priority: values.priority,
      category: values.category,
    }),
  });
  return data.task;
}

export async function updateTask(
  token: string,
  taskId: string,
  updates: Partial<TaskFormValues> & { status?: TaskStatus }
): Promise<Task> {
  const body: Record<string, unknown> = {};
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.dueDate !== undefined) body.dueDate = updates.dueDate || null;
  if (updates.priority !== undefined) body.priority = updates.priority;
  if (updates.category !== undefined) body.category = updates.category;
  if (updates.status !== undefined) body.status = updates.status;

  const data = await requestJson<{ task: Task }>(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    }
  );
  return data.task;
}

export async function deleteTask(token: string, taskId: string): Promise<string> {
  const data = await requestJson<{ deletedId: string }>(
    `/api/tasks/${encodeURIComponent(taskId)}`,
    token,
    {
      method: 'DELETE',
    }
  );
  return data.deletedId;
}
