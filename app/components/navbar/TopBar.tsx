"use client";

import { JSX } from "react";

export type WorkspaceView = "edit" | "json";

const viewTabs: { key: WorkspaceView; icon: JSX.Element }[] = [
  { 
    key: "edit", 
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  { 
    key: "json", 
    icon: (
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4c-2 0-3 1-3 3v2c0 1-1 2-2 2 1 0 2 1 2 2v2c0 2 1 3 3 3 M15 4c2 0 3 1 3 3v2c0 1 1 2 2 2-1 0-2 1-2 2v2c0 2-1 3-3 3"
/>
</svg>

    )
  },
];

export function TopBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  workspaceView,
  onWorkspaceViewChange,
}: {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isLeftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  workspaceView: WorkspaceView;
  onWorkspaceViewChange: (view: WorkspaceView) => void;
}) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4">
      {/* Left Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLeftSidebar}
          aria-pressed={isLeftSidebarOpen}
          title={isLeftSidebarOpen ? "Hide templates" : "Show templates"}
          className="p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 rounded cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isLeftSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>


        {/* View Toggle */}
        <div className="flex">
          {viewTabs.map(({ key, icon }) => (
            <button
              key={key}
              onClick={() => onWorkspaceViewChange(key)}
              aria-pressed={workspaceView === key}
              title={key === "edit" ? "Edit View" : "JSON View"}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition border-b-2 cursor-pointer ${
                workspaceView === key
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {icon}
              <span className="capitalize">{key === "edit" ? "Editor" : "JSON"}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded ${
              canUndo ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer" : "text-slate-300 cursor-not-allowed"
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
            className={`p-2 rounded ${
              canRedo ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer" : "text-slate-300 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>


        <button
          onClick={onToggleRightSidebar}
          aria-pressed={isRightSidebarOpen}
          title={isRightSidebarOpen ? "Hide inspector" : "Show inspector"}
          className="p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 rounded cursor-pointer"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isRightSidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

    </header>
  );
}
