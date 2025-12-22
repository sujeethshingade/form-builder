"use client";

export function TopBar({
  onExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSidebarOpen,
  onToggleSidebar,
}: {
  onPreview: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-pressed={isSidebarOpen}
          title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Tool buttons */}
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Edit">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button onClick={onExport} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="Export Code">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`rounded-lg p-2 ${
              canUndo ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "text-slate-300 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`rounded-lg p-2 ${
              canRedo ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700" : "text-slate-300 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
