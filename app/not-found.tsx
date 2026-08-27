import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Enterprise Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-xl">school</span>
          </div>
          <div>
            <span className="font-extrabold text-slate-100 tracking-tight text-base block leading-none">
              The Academic Curator
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mt-0.5">
              Academic Information System & Digital Archive
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700/60 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Services Operational
          </span>
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Portal Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main 404 Body */}
      <div className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="max-w-4xl w-full grid md:grid-cols-12 gap-8 items-center bg-slate-950/80 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle decorative glow */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none"></div>

          {/* Left Column: Error Visual & Code */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-slate-800 pb-8 md:pb-0 md:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="material-symbols-outlined text-sm">warning</span>
              HTTP 404 • Not Found
            </div>
            
            <div className="text-8xl sm:text-9xl font-black text-slate-800 tracking-tighter select-none font-mono">
              404
            </div>
            
            <p className="text-xs text-slate-500 font-mono mt-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              ERR_HTTP_RESOURCE_NOT_FOUND
            </p>
          </div>

          {/* Right Column: Information & Institutional Navigation */}
          <div className="md:col-span-7 space-y-6 md:pl-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Requested Resource Was Not Found
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                The requested URL path does not correspond to any active course module, syllabus record, or administrative resource in the Curator registry.
              </p>
            </div>

            {/* Quick Portal Access */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Institutional Navigation Shortcuts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Link
                  href="/student/dashboard"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 transition-all text-sm group"
                >
                  <span className="material-symbols-outlined text-indigo-400 group-hover:scale-110 transition-transform">school</span>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Student Portal</span>
                    <span className="text-[11px] text-slate-500">Learning hub & courses</span>
                  </div>
                </Link>

                <Link
                  href="/lecturer/dashboard"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 hover:bg-purple-950/50 border border-slate-800 hover:border-purple-500/50 transition-all text-sm group"
                >
                  <span className="material-symbols-outlined text-purple-400 group-hover:scale-110 transition-transform">analytics</span>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Lecturer Hub</span>
                    <span className="text-[11px] text-slate-500">Gradebook & assignments</span>
                  </div>
                </Link>

                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-sm group"
                >
                  <span className="material-symbols-outlined text-rose-400 group-hover:scale-110 transition-transform">admin_panel_settings</span>
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">Administration</span>
                    <span className="text-[11px] text-slate-500">System management</span>
                  </div>
                </Link>

                <Link
                  href="/login"
                  className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all text-sm group shadow-lg shadow-indigo-600/20"
                >
                  <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">login</span>
                  <div>
                    <span className="font-bold block text-xs">Account Sign In</span>
                    <span className="text-[11px] text-indigo-200">Authenticate session</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Diagnostic Footer */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
              <span>Node: edge-gw01.curator.internal</span>
              <span>Status: 404 Not Found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 The Academic Curator Consortium. Enterprise Learning Network. All rights reserved.</p>
          <div className="flex gap-4 text-slate-400">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/.well-known/security.txt" className="hover:underline text-indigo-400">Security Disclosures</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
