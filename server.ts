import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import {
  createTaskForUser,
  deleteTaskForUser,
  listTasksByUser,
  updateTaskForUser,
  type TaskPriority,
  type TaskStatus,
} from './src/db/tasks.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_PRIORITIES = new Set<TaskPriority>(['low', 'medium', 'high']);
const VALID_STATUSES = new Set<TaskStatus>(['pending', 'completed']);

function normalizeDueDate(value: unknown): { valid: boolean; value: string | null } {
  if (value === null || value === undefined || value === '') {
    return { valid: true, value: null };
  }
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) {
    return { valid: false, value: null };
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return { valid: false, value: null };
  }
  return { valid: true, value };
}

async function resolveCurrentUser(req: AuthRequest) {
  const uid = req.user?.uid;
  if (!uid) {
    throw new Error('Authenticated user identifier missing.');
  }
  const email = req.user?.email ?? `${uid}@firebase.local`;
  const displayName =
    typeof req.user?.name === 'string' ? req.user.name : null;
  return await getOrCreateUser(uid, email, displayName);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await resolveCurrentUser(req);
      const userTasks = await listTasksByUser(user.id);
      res.json({ tasks: userTasks });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load tasks.';
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, description, dueDate, priority, category } = req.body ?? {};

      if (typeof title !== 'string' || title.trim().length === 0) {
        res.status(400).json({ error: 'Task title is required.' });
        return;
      }
      if (title.trim().length > 200) {
        res.status(400).json({ error: 'Task title must be 200 characters or fewer.' });
        return;
      }

      const cleanDescription =
        typeof description === 'string' ? description.trim().slice(0, 2000) : '';

      const dueResult = normalizeDueDate(dueDate);
      if (!dueResult.valid) {
        res.status(400).json({ error: 'Due date must be a valid YYYY-MM-DD date.' });
        return;
      }

      const resolvedPriority: TaskPriority = VALID_PRIORITIES.has(priority)
        ? priority
        : 'medium';
      if (priority !== undefined && !VALID_PRIORITIES.has(priority)) {
        res.status(400).json({ error: 'Priority must be low, medium, or high.' });
        return;
      }

      const cleanCategory =
        typeof category === 'string' && category.trim().length > 0
          ? category.trim().slice(0, 40)
          : 'Work';

      const user = await resolveCurrentUser(req);
      const created = await createTaskForUser(user.id, {
        title: title.trim(),
        description: cleanDescription,
        dueDate: dueResult.value,
        priority: resolvedPriority,
        category: cleanCategory,
      });

      res.status(201).json({ task: created });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create task.';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const taskId = String(req.params.id ?? '');
      if (!UUID_REGEX.test(taskId)) {
        res.status(400).json({ error: 'Invalid task identifier.' });
        return;
      }

      const { title, description, dueDate, priority, category, status } =
        req.body ?? {};

      const updates: Parameters<typeof updateTaskForUser>[2] = {};

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim().length === 0) {
          res.status(400).json({ error: 'Task title cannot be empty.' });
          return;
        }
        if (title.trim().length > 200) {
          res.status(400).json({ error: 'Task title must be 200 characters or fewer.' });
          return;
        }
        updates.title = title.trim();
      }

      if (description !== undefined) {
        if (typeof description !== 'string') {
          res.status(400).json({ error: 'Description must be text.' });
          return;
        }
        updates.description = description.trim().slice(0, 2000);
      }

      if (dueDate !== undefined) {
        const dueResult = normalizeDueDate(dueDate);
        if (!dueResult.valid) {
          res.status(400).json({ error: 'Due date must be a valid YYYY-MM-DD date.' });
          return;
        }
        updates.dueDate = dueResult.value;
      }

      if (priority !== undefined) {
        if (!VALID_PRIORITIES.has(priority)) {
          res.status(400).json({ error: 'Priority must be low, medium, or high.' });
          return;
        }
        updates.priority = priority;
      }

      if (category !== undefined) {
        if (typeof category !== 'string' || category.trim().length === 0) {
          res.status(400).json({ error: 'Category cannot be empty.' });
          return;
        }
        updates.category = category.trim().slice(0, 40);
      }

      if (status !== undefined) {
        if (!VALID_STATUSES.has(status)) {
          res.status(400).json({ error: 'Status must be pending or completed.' });
          return;
        }
        updates.status = status;
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No valid task updates provided.' });
        return;
      }

      const user = await resolveCurrentUser(req);
      const updated = await updateTaskForUser(taskId, user.id, updates);

      if (!updated) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      res.json({ task: updated });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update task.';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
    try {
      const taskId = String(req.params.id ?? '');
      if (!UUID_REGEX.test(taskId)) {
        res.status(400).json({ error: 'Invalid task identifier.' });
        return;
      }

      const user = await resolveCurrentUser(req);
      const deleted = await deleteTaskForUser(taskId, user.id);

      if (!deleted) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }

      res.json({ deletedId: deleted.id });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete task.';
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`TaskFlow server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
