import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import {
  DEFAULT_CATEGORIES,
  getTodayDateString,
  type Task,
  type TaskFormValues,
  type TaskPriority,
} from '../types/task.ts';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  existingCategories: string[];
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
}

const PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function TaskModal({
  isOpen,
  editingTask,
  existingCategories,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const availableCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...existingCategories])
  );

  useEffect(() => {
    if (!isOpen) return;
    setFormError(null);
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate ?? '');
      setPriority(editingTask.priority);
      if (availableCategories.includes(editingTask.category)) {
        setCategory(editingTask.category);
        setUseCustomCategory(false);
        setCustomCategory('');
      } else {
        setUseCustomCategory(true);
        setCustomCategory(editingTask.category);
      }
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setPriority('medium');
      setCategory('Work');
      setUseCustomCategory(false);
      setCustomCategory('');
    }
  }, [isOpen, editingTask]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError('Please enter a task title.');
      return;
    }

    const resolvedCategory = useCustomCategory
      ? customCategory.trim()
      : category.trim();

    if (!resolvedCategory) {
      setFormError('Please choose or enter a category.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        dueDate,
        priority,
        category: resolvedCategory,
      });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to save task.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-slate-900/45"
        onClick={() => !submitting && onClose()}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2
            id="task-modal-title"
            className="font-display text-lg font-bold text-slate-900"
          >
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close modal"
            className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {formError}
            </div>
          )}

          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Prepare quarterly budget review"
              maxLength={200}
              autoFocus
              required
              className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-800 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes, links, or checklist details..."
              rows={3}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-slate-800 mb-1.5"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-800 mb-1.5">
                Priority
              </span>
              <div
                role="radiogroup"
                aria-label="Task priority"
                className="grid grid-cols-3 p-1 bg-slate-100 border border-slate-200 rounded-lg min-h-[42px]"
              >
                {PRIORITIES.map((opt) => {
                  const selected = priority === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPriority(opt.value)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                        selected
                          ? opt.value === 'high'
                            ? 'bg-white text-amber-700 shadow-xs'
                            : 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={useCustomCategory ? 'task-custom-cat' : 'task-category'}
                className="block text-sm font-medium text-slate-800"
              >
                Category
              </label>
              <button
                type="button"
                onClick={() => setUseCustomCategory((prev) => !prev)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {useCustomCategory ? 'Choose preset' : 'Custom category'}
              </button>
            </div>

            {useCustomCategory ? (
              <input
                id="task-custom-cat"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name (e.g., Design)"
                maxLength={40}
                className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            ) : (
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full min-h-[42px] px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 cursor-pointer"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[40px] px-5 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap cursor-pointer"
            >
              {submitting
                ? 'Saving...'
                : editingTask
                ? 'Save Changes'
                : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
