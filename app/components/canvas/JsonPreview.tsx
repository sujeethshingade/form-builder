"use client";

export function JsonPreview({
  json,
  onCopy,
}: {
  json: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Export</p>
          <h3 className="text-base font-semibold text-slate-900">Form JSON</h3>
        </div>
        <button
          onClick={onCopy}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-600"
        >
          Copy
        </button>
      </div>
      <pre className="flex-1 overflow-auto bg-slate-900 p-4 text-xs leading-relaxed text-emerald-400">
        {json}
      </pre>
    </div>
  );
}
