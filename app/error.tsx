"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log telemetry internally
    console.error("Critical Application Exception:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-xl">error</span>
          </div>
          <div>
            <span className="font-extrabold text-slate-100 tracking-tight text-base block leading-none">
              The Academic Curator
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">
              Service Health & Exception Management
            </span>
          </div>
        </div>

        <div className="text-xs font-mono text-rose-400 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/50 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          500 INTERNAL_SERVER_ERROR
        </div>
      </header>

      {/* Main Error Card */}
      <div className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-3xl w-full bg-slate-950/90 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">report_problem</span>
              Exception Encountered
            </span>
            {error.digest && (
              <span className="text-xs font-mono text-slate-500">
                Digest: {error.digest}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            An Unexpected System Error Occurred
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            The application runtime encountered an unhandled condition while processing your transaction. 
            The diagnostic telemetry has been captured and dispatched to the Curator Operations Team.
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 font-mono text-xs text-slate-300">
            <div className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-2">
              Diagnostic Snapshot
            </div>
            <p className="text-rose-400 font-semibold break-all">
              {error.message || "Internal execution handler failure (HTTP 500)"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Retry Transaction
            </button>
            <Link
              href="/"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all text-sm"
            >
              Return to Portal Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        © 2026 The Academic Curator Consortium. Enterprise System Health.
      </footer>
    </main>
  );
}
