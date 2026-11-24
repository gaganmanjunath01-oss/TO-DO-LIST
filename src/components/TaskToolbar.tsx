import { ArrowUpDown, Search, X } from 'lucide-react';
import type { TaskFilterView, TaskSortBy } from '../types/task.ts';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeView: TaskFilterView;
  onViewChange: (view: TaskFilterView) => void;
  sortBy: TaskSortBy;
  onSortChange: (sort: TaskSortBy) => void;
}

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  sortBy,
  onSortChange,
}: TaskToolbarProps) {
  const filterTabs: Array<{ id: TaskFilterView; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
    { id: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search
          className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title, description, or category..."
          aria-label="Search tasks"
          className="w-full min-h-[40px] pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg"
        >
          {filterTabs.map((tab) => {
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onViewChange(tab.id)}
                className={`min-h-[32px] px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative flex items-center">
          <ArrowUpDown
            className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none"
            aria-hidden="true"
          />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as TaskSortBy)}
            aria-label="Sort tasks"
            className="min-h-[40px] pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 cursor-pointer"
          >
            <option value="due_asc">Due Date (Earliest)</option>
            <option value="due_desc">Due Date (Latest)</option>
            <option value="priority_desc">Priority (Highest)</option>
            <option value="priority_asc">Priority (Lowest)</option>
            <option value="created_desc">Recently Added</option>
          </select>
        </div>
      </div>
    </div>
  );
}
