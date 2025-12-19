"use client";

export function TopBar({
  onPreview,
  onExport,
}: {
  onPreview: () => void;
  onExport: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-inner">
            FB
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Builder</p>
            <h1 className="text-lg font-semibold text-slate-900">Form Studio</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            onClick={onPreview}
          >
            Preview
          </button>
          <button
            className="rounded-full border border-sky-300 bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(14,165,233,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_40px_-15px_rgba(14,165,233,0.9)]"
            onClick={onExport}
          >
            Export JSON
          </button>
        </div>
      </div>
    </header>
  );
}
