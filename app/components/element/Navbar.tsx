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
