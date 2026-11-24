import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Clock,
  Folder,
  LayoutList,
  LogOut,
  X,
} from 'lucide-react';
import type { TaskFilterView } from '../types/task.ts';

interface CategoryCount {
  name: string;
  count: number;
}

interface SidebarProps {
  activeView: TaskFilterView;
  activeCategory: string | null;
  onSelectView: (view: TaskFilterView) => void;
  onSelectCategory: (category: string | null) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
    overdue: number;
  };
  categories: CategoryCount[];
  userEmail: string | null;
  userName: string | null;
  onSignOut: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeView,
  activeCategory,
  onSelectView,
  onSelectCategory,
  counts,
  categories,
  userEmail,
  userName,
  onSignOut,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: Array<{
    id: TaskFilterView;
    label: string;
    count: number;
    icon: typeof LayoutList;
    alert?: boolean;
  }> = [
    { id: 'all', label: 'All Tasks', count: counts.all, icon: LayoutList },
    { id: 'pending', label: 'Pending', count: counts.pending, icon: Clock },
    {
      id: 'overdue',
      label: 'Overdue',
      count: counts.overdue,
      icon: AlertCircle,
      alert: counts.overdue > 0,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: counts.completed,
      icon: CheckCircle2,
    },
  ];

  const handleViewClick = (view: TaskFilterView) => {
    onSelectView(view);
    onSelectCategory(null);
    onCloseMobile();
  };

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      onSelectCategory(null);
    } else {
      onSelectCategory(category);
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64">
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Taskline
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="lg:hidden min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav
        aria-label="Task views and categories"
        className="flex-1 overflow-y-auto px-3 py-5 space-y-6"
      >
        <div>
          <p className="px-3 mb-2 text-xs font-medium text-slate-500">
            Views
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeView === item.id && activeCategory === null;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleViewClick(item.id)}
                    className={`w-full min-h-[40px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isSelected
                            ? 'text-blue-600'
                            : item.alert
                            ? 'text-red-600'
                            : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <span
                      className={`font-mono text-xs tabular-nums shrink-0 ${
                        item.alert && !isSelected
                          ? 'text-red-600 font-semibold'
                          : isSelected
                          ? 'text-blue-700 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-xs font-medium text-slate-500">Categories</p>
            {activeCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <ul className="space-y-1">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              return (
                <li key={cat.name}>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick(cat.name)}
                    className={`w-full min-h-[40px] flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <Folder
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span
                      className={`font-mono text-xs tabular-nums shrink-0 ${
                        isSelected
                          ? 'text-blue-700 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="border-t border-slate-200 p-3 shrink-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {userName || 'Workspace User'}
            </p>
            {userEmail && (
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-50 flex">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
