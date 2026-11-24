import { and, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { tasks, type TaskRecord } from './schema.ts';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface CreateTaskInput {
  title: string;
  description: string;
  dueDate: string | null;
  priority: TaskPriority;
  category: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: TaskPriority;
  category?: string;
  status?: TaskStatus;
}

export async function listTasksByUser(userId: number): Promise<TaskRecord[]> {
  try {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    throw new Error('Unable to load tasks right now. Please try again.', {
      cause: error,
    });
  }
}

export async function createTaskForUser(
  userId: number,
  input: CreateTaskInput
): Promise<TaskRecord> {
  try {
    const result = await db
      .insert(tasks)
      .values({
        userId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        priority: input.priority,
        category: input.category,
        status: 'pending',
        completedAt: null,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Failed to create task:', error);
    throw new Error('Unable to create task right now. Please try again.', {
      cause: error,
    });
  }
}

export async function updateTaskForUser(
  taskId: string,
  userId: number,
  input: UpdateTaskInput
): Promise<TaskRecord | null> {
  try {
    const updateValues: Partial<typeof tasks.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.title !== undefined) {
      updateValues.title = input.title;
    }
    if (input.description !== undefined) {
      updateValues.description = input.description;
    }
    if (input.dueDate !== undefined) {
      updateValues.dueDate = input.dueDate;
    }
    if (input.priority !== undefined) {
      updateValues.priority = input.priority;
    }
    if (input.category !== undefined) {
      updateValues.category = input.category;
    }
    if (input.status !== undefined) {
      updateValues.status = input.status;
      updateValues.completedAt = input.status === 'completed' ? new Date() : null;
    }

    const result = await db
      .update(tasks)
      .set(updateValues)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result[0] ?? null;
  } catch (error) {
    console.error('Failed to update task:', error);
    throw new Error('Unable to update task right now. Please try again.', {
      cause: error,
    });
  }
}

export async function deleteTaskForUser(
  taskId: string,
  userId: number
): Promise<TaskRecord | null> {
  try {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return result[0] ?? null;
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw new Error('Unable to delete task right now. Please try again.', {
      cause: error,
    });
  }
}
