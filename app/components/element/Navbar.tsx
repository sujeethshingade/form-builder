"use client";

import type { WorkspaceView } from "../../lib/types";
import {
  EditIcon,
  PreviewIcon,
  JsonIcon,
  UndoIcon,
  RedoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../lib/icons";

const viewTabs: { key: WorkspaceView; icon: React.ReactNode; label: string }[] = [
  { key: "edit", icon: <EditIcon />, label: "Editor" },
  { key: "preview", icon: <PreviewIcon />, label: "Preview" },
  { key: "json", icon: <JsonIcon />, label: "JSON" },
];

type TopBarProps = {
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
  formName?: string;
  formCollection?: string;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  saving?: boolean;
  onBack?: () => void;
};

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
  formName,
  formCollection,
  hasUnsavedChanges,
  onSave,
  saving,
  onBack,
}: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleLeftSidebar}
          aria-pressed={isLeftSidebarOpen}
          title={isLeftSidebarOpen ? "Hide templates" : "Show templates"}
          className="p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 rounded cursor-pointer"
        >
          {isLeftSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex">
          {viewTabs.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => onWorkspaceViewChange(key)}
              aria-pressed={workspaceView === key}
              title={`${label} View`}
              className={`flex items-center gap-2 px-4 py-4 text-sm font-medium transition border-b-2 cursor-pointer ${
                workspaceView === key
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onBack && (
          <>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Back to Forms"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">Forms</span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
          </>
        )}
        {onSave && (
          <>
            <button
              onClick={onSave}
              disabled={saving || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                saving || !hasUnsavedChanges
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 text-white hover:bg-sky-600"
              }`}
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Save</span>
                </>
              )}
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1" />
          </>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded ${
              canUndo
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                : "text-slate-300 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <UndoIcon />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded ${
              canRedo
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                : "text-slate-300 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <RedoIcon />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button
          onClick={onToggleRightSidebar}
          aria-pressed={isRightSidebarOpen}
          title={isRightSidebarOpen ? "Hide inspector" : "Show inspector"}
          className="p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 rounded cursor-pointer"
        >
          {isRightSidebarOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
    </header>
  );
}

export type { WorkspaceView } from "../../lib/types";
