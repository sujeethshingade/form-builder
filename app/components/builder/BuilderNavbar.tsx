import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  EditIcon,
  PreviewIcon,
  JsonIcon,
  UndoIcon,
  RedoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../lib/icons";
import { motion } from "framer-motion";
import type { WorkspaceView } from "../../lib/types";

const viewTabs: { key: WorkspaceView; icon: React.ReactNode; label: string }[] = [
  { key: "edit", icon: <EditIcon />, label: "Editor" },
  { key: "preview", icon: <PreviewIcon />, label: "Preview" },
  { key: "json", icon: <JsonIcon />, label: "JSON" },
];

export type BuilderNavbarProps = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  workspaceView: WorkspaceView;
  onWorkspaceViewChange: (view: WorkspaceView) => void;
  hasUnsavedChanges?: boolean;
  onSave?: () => void;
  onSaveAs?: () => void;
  saveAsLabel?: string;
  saveAsDisabled?: boolean;
  saving?: boolean;
  isLeftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
};

export function BuilderNavbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  workspaceView,
  onWorkspaceViewChange,
  hasUnsavedChanges,
  onSave,
  onSaveAs,
  saveAsLabel,
  saveAsDisabled,
  saving,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
}: BuilderNavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="relative bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleLeftSidebar}
          className={`p-1.5 rounded-md transition-colors ${
            isLeftSidebarOpen ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title={isLeftSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isLeftSidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>

        <div className="flex items-center gap-8">
          <Link href="/builder/new" className="text-xl font-bold text-slate-800">
            Form Builder
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/forms"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/forms")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Forms
            </Link>
            <Link
              href="/layouts"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/layouts")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Layouts
            </Link>
            <Link
              href="/fields"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/fields") || isActive("/custom-fields")
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Fields
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center bg-slate-100 rounded-lg p-1">
        {viewTabs.map(({ key, icon, label }) => {
          const isActive = workspaceView === key;
          return (
            <button
              key={key}
              onClick={() => onWorkspaceViewChange(key)}
              className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
              }`}
              title={`${label} View`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-view-tab"
                  className="absolute inset-0 bg-white shadow-sm rounded-md"
                  transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {icon}
                <span>{label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-lg p-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? "text-slate-600 hover:text-slate-900 cursor-pointer"
                : "text-slate-300 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <UndoIcon />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? "text-slate-600 hover:text-slate-900 cursor-pointer"
                : "text-slate-300 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <RedoIcon />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onSaveAs && (
            <button
              onClick={onSaveAs}
              disabled={saveAsDisabled}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                saveAsDisabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 text-white hover:bg-emerald-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{saveAsLabel || "Save As"}</span>
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              disabled={saving || (hasUnsavedChanges !== undefined && !hasUnsavedChanges)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                saving || (hasUnsavedChanges !== undefined && !hasUnsavedChanges)
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
          )}

          <button
            onClick={onToggleRightSidebar}
            className={`p-1.5 rounded-md transition-colors ${
              isRightSidebarOpen ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
            title={isRightSidebarOpen ? "Close Inspector" : "Open Inspector"}
          >
            {isRightSidebarOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}
