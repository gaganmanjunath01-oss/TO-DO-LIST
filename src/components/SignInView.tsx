import { CheckSquare, CalendarClock, FolderKanban, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export function SignInView() {
  const { signInWithGoogle, authError } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" aria-hidden="true" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900">
            Taskline
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight mb-2 [text-wrap:balance]">
          Organize daily tasks with clarity
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Sign in with your Google account to manage priorities, track deadlines,
          and keep every task synced across your devices.
        </p>

        <div className="space-y-3 border-t border-b border-slate-200 py-5 mb-6 text-sm text-slate-700">
          <div className="flex items-center gap-3">
            <FolderKanban className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span>Categorize work, personal, and project milestones</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarClock className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span>Spot overdue deadlines and sort by priority</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span>Private workspace saved securely to PostgreSQL</span>
          </div>
        </div>

        {authError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {authError}
          </div>
        )}

        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
            />
          </svg>
          <span className="whitespace-nowrap">Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
