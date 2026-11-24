import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from './lib/api.ts';
import {
  DEFAULT_CATEGORIES,
  getTodayDateString,
  isTaskOverdue,
  type Task,
  type TaskFilterView,
  type TaskFormValues,
  type TaskPriority,
  type TaskSortBy,
  type ToastMessage,
} from './types/task.ts';
import { SignInView } from './components/SignInView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { StatsStrip } from './components/StatsStrip.tsx';
import { TaskToolbar } from './components/TaskToolbar.tsx';
import { TaskList } from './components/TaskList.tsx';
import { TaskModal } from './components/TaskModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

const VIEW_LABELS: Record<TaskFilterView, string> = {
  all: 'All Tasks',
  pending: 'Pending',
  completed: 'Completed',
  overdue: 'Overdue',
};

function Dashboard() {
  const { user, signOutUser, getIdToken } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<TaskFilterView>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<TaskSortBy>('due_asc');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastMessage['type'], message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadUserTasks = useCallback(async () => {
    setLoadingTasks(true);
    setLoadError(null);
    try {
      const token = await getIdToken();
      const loaded = await fetchTasks(token);
      setTasks(loaded);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to fetch tasks.';
      setLoadError(message);
    } finally {
      setLoadingTasks(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (user) {
      void loadUserTasks();
    }
  }, [user, loadUserTasks]);

  const today = getTodayDateString();

  const stats = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    for (const task of tasks) {
      if (task.status === 'completed') {
        completed += 1;
      } else {
        pending += 1;
        if (isTaskOverdue(task, today)) {
          overdue += 1;
        }
      }
    }

    return {
      all: tasks.length,
      pending,
      completed,
      overdue,
    };
  }, [tasks, today]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const cat of DEFAULT_CATEGORIES) {
      map.set(cat, 0);
    }
    for (const task of tasks) {
      map.set(task.category, (map.get(task.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (activeView === 'pending' && task.status !== 'pending') return false;
      if (activeView === 'completed' && task.status !== 'completed') return false;
      if (activeView === 'overdue' && !isTaskOverdue(task, today)) return false;

      if (activeCategory && task.category !== activeCategory) return false;

      if (query) {
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description.toLowerCase().includes(query);
        const matchesCat = task.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'due_asc': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
          return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        }
        case 'due_desc': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        case 'priority_desc': {
          const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
          if (diff !== 0) return diff;
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'priority_asc': {
          const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
          if (diff !== 0) return diff;
          return (a.dueDate ?? '').localeCompare(b.dueDate ?? '');
        }
        case 'created_desc':
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [tasks, activeView, activeCategory, searchQuery, sortBy, today]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (values: TaskFormValues) => {
    const token = await getIdToken();
    if (editingTask) {
      const updated = await updateTask(token, editingTask.id, values);
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      pushToast('success', 'Task updated successfully.');
    } else {
      const created = await createTask(token, values);
      setTasks((prev) => [created, ...prev]);
      pushToast('success', 'Task created successfully.');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    setTogglingId(task.id);
    try {
      const token = await getIdToken();
      const updated = await updateTask(token, task.id, { status: nextStatus });
      setTasks((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      pushToast(
        'success',
        nextStatus === 'completed'
          ? 'Task marked as completed.'
          : 'Task reopened as pending.'
      );
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error ? error.message : 'Unable to update task status.'
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async (task: Task) => {
    try {
      const token = await getIdToken();
      await deleteTask(token, task.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      setTaskToDelete(null);
      pushToast('success', 'Task deleted permanently.');
    } catch (error) {
      pushToast(
        'error',
        error instanceof Error ? error.message : 'Unable to delete task.'
      );
    }
  };

  const handleClearFilters = () => {
    setActiveView('all');
    setActiveCategory(null);
    setSearchQuery('');
  };

  const activeHeading = activeCategory
    ? `${activeCategory} Tasks`
    : VIEW_LABELS[activeView];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeView={activeView}
        activeCategory={activeCategory}
        onSelectView={setActiveView}
        onSelectCategory={setActiveCategory}
        counts={stats}
        categories={categoryCounts}
        userEmail={user?.email ?? null}
        userName={user?.displayName ?? null}
        onSignOut={signOutUser}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 whitespace-nowrap">Tasks</span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <h1 className="font-display font-semibold text-slate-900 truncate">
                {activeHeading}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="min-h-[40px] px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>New Task</span>
          </button>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          <StatsStrip
            total={stats.all}
            pending={stats.pending}
            completed={stats.completed}
            overdue={stats.overdue}
          />

          <TaskToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeView={activeView}
            onViewChange={setActiveView}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <TaskList
            tasks={filteredAndSortedTasks}
            totalTaskCount={tasks.length}
            loading={loadingTasks}
            error={loadError}
            onRetry={loadUserTasks}
            onToggleComplete={handleToggleComplete}
            onEdit={handleOpenEdit}
            onDeleteRequest={setTaskToDelete}
            onCreateNew={handleOpenCreate}
            onClearFilters={handleClearFilters}
            togglingId={togglingId}
          />
        </main>
      </div>

      <TaskModal
        isOpen={modalOpen}
        editingTask={editingTask}
        existingCategories={categoryCounts.map((c) => c.name)}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveTask}
      />

      <DeleteConfirmModal
        task={taskToDelete}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-sm font-medium text-slate-500">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <SignInView />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
