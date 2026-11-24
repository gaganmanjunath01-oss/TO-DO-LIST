interface StatsStripProps {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
}

export function StatsStrip({
  total,
  pending,
  completed,
  overdue,
}: StatsStripProps) {
  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section
      aria-label="Task statistics"
      className="bg-white border border-slate-200 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 sm:divide-x divide-slate-200"
    >
      <div className="p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-500">Total Tasks</p>
        <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 tabular-nums">
          {total}
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-500">Pending</p>
        <p className="mt-1.5 font-display text-2xl font-bold text-slate-900 tabular-nums">
          {pending}
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-slate-500">Completed</p>
          <span className="font-mono text-xs text-emerald-700 tabular-nums">
            {completionRate}%
          </span>
        </div>
        <p className="mt-1.5 font-display text-2xl font-bold text-emerald-700 tabular-nums">
          {completed}
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-500">Overdue</p>
        <p
          className={`mt-1.5 font-display text-2xl font-bold tabular-nums ${
            overdue > 0 ? 'text-red-600' : 'text-slate-900'
          }`}
        >
          {overdue}
        </p>
      </div>
    </section>
  );
}
