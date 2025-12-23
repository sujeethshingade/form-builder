"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Survey, SurveyModel } from "survey-react-ui";
import "survey-core/defaultV2.min.css";

import { FormCanvas } from "./components/canvas/FormCanvas";
import { JsonPreview } from "./components/canvas/JsonPreview";
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { ElementSidebar } from "./components/element/ElementSidebar";
import { TopBar, type WorkspaceView } from "./components/navbar/TopBar";
import { fieldToSurveyJSON, library, makeField, makeFieldFromTemplate, templates, defaultStyles } from "./lib/form";
import type { FormField, LibraryItem, FormStyles, FormTemplate } from "./lib/form";

type ViewMode = "desktop" | "tablet" | "mobile";

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<LibraryItem | FormField | null>(null);
  const [styles, setStyles] = useState<FormStyles>(defaultStyles);
  const [rightTab, setRightTab] = useState<"components" | "styles">("components");
  const [undoStack, setUndoStack] = useState<FormField[][]>([]);
  const [redoStack, setRedoStack] = useState<FormField[][]>([]);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("edit");
  const viewMode: ViewMode = "desktop";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  const surveyJson = useMemo(() => fieldToSurveyJSON(fields), [fields]);
  const surveyModel = useMemo(() => new SurveyModel(surveyJson), [surveyJson]);

  const pushUndo = (prev: FormField[]) => {
    setUndoStack((stack) => [...stack.slice(-19), prev]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, fields]);
    setUndoStack((stack) => stack.slice(0, -1));
    setFields(prev);
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, fields]);
    setRedoStack((stack) => stack.slice(0, -1));
    setFields(next);
    setSelectedId(null);
  };

  const handleDragStart = (event: any) => {
    const activeType = event?.active?.data?.current?.type;
    const fromCanvas = event?.active?.data?.current?.from === "canvas";

    if (fromCanvas) {
      const field = fields.find((f) => f.id === event.active.id);
      if (field) setActiveDrag(field);
    } else if (activeType) {
      const libItem = library.find((l) => l.type === activeType);
      if (libItem) setActiveDrag(libItem);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const activeData = active?.data?.current;
    const overId = over?.id as string | undefined;

    // Drop from palette
    if (activeData?.from === "palette") {
      const libItem = library.find((l) => l.type === activeData.type);
      if (!libItem) return;

      pushUndo(fields);
      const newField = makeField(libItem);
      if (!overId || overId === "canvas") {
        setFields((prev) => [...prev, newField]);
        setSelectedId(newField.id);
      } else {
        const targetIndex = fields.findIndex((f) => f.id === overId);
        if (targetIndex >= 0) {
          setFields((prev) => {
            const next = [...prev];
            next.splice(targetIndex, 0, newField);
            return next;
          });
          setSelectedId(newField.id);
        }
      }
    }

    // Reorder inside canvas
    if (activeData?.from === "canvas" && overId && active.id !== overId) {
      pushUndo(fields);
      setFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === overId);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    setActiveDrag(null);
  };

  const handleFieldUpdate = (patch: Partial<FormField>) => {
    if (!selectedId) return;
    pushUndo(fields);
    setFields((prev) =>
      prev.map((f) => (f.id === selectedId ? { ...f, ...patch } : f))
    );
  };

  const handleDelete = () => {
    if (!selectedId) return;
    pushUndo(fields);
    setFields((prev) => prev.filter((f) => f.id !== selectedId));
    setSelectedId(null);
  };

  const handleTemplateSelect = (template: FormTemplate) => {
    pushUndo(fields);
    setFields(template.fields.map(makeFieldFromTemplate));
    setSelectedId(null);
  };

  const handleStyleUpdate = (patch: Partial<FormStyles>) => {
    setStyles((prev) => ({ ...prev, ...patch }));
  };

  const exportString = useMemo(
    () => JSON.stringify(surveyJson, null, 2),
    [surveyJson]
  );

  return (
    <div className="flex h-screen bg-slate-100">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Left Sidebar - Templates */}
        <ElementSidebar
          collapsed={!isLeftSidebarOpen}
        />

        {/* Center - Canvas */}
        <main className="flex h-full flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <TopBar
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isLeftSidebarOpen={isLeftSidebarOpen}
            onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
            isRightSidebarOpen={isRightSidebarOpen}
            onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
            workspaceView={workspaceView}
            onWorkspaceViewChange={setWorkspaceView}
          />

          {workspaceView === "edit" ? (
            <FormCanvas
              fields={fields}
              selectedId={selectedId}
              onSelect={setSelectedId}
              viewMode={viewMode}
              styles={styles}
            />
          ) : (
            <div className="flex-1 overflow-auto bg-slate-100 p-8">
              <JsonPreview
                json={exportString}
                onCopy={() => navigator.clipboard.writeText(exportString)}
              />
            </div>
          )}
        </main>

        {/* Right Sidebar - Components & Styles */}
        <aside
          className={`flex h-full flex-col border-l border-slate-200 bg-white transition-[width] duration-300 ease-out ${
            isRightSidebarOpen ? "w-72" : "w-0 min-w-0 overflow-hidden"
          }`}
        >
          <div
            className={`flex h-full flex-col ${
              isRightSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
            } transition-opacity duration-200 ${isRightSidebarOpen ? "delay-100" : ""}`}
          >
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setRightTab("components")}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition ${
                    rightTab === "components"
                      ? "border-b-2 border-sky-500 text-sky-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Components
                </button>
                <button
                  onClick={() => setRightTab("styles")}
                  className={`flex-1 px-4 py-4 text-sm font-medium transition ${
                    rightTab === "styles"
                      ? "border-b-2 border-sky-500 text-sky-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Styles
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                {rightTab === "components" ? (
                  selectedField ? (
                    <InspectorPanel
                      selectedField={selectedField}
                      onUpdate={handleFieldUpdate}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="mb-4 p-4">
                        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-700">No field selected</p>
                      <p className="mt-1 text-xs text-slate-500">Select a field from the canvas to edit its properties</p>
                    </div>
                  )
                ) : (
                  <div className="p-4 space-y-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Background Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={styles.backgroundColor}
                          onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                          className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200"
                        />
                        <input
                          type="text"
                          value={styles.backgroundColor}
                          onChange={(e) => handleStyleUpdate({ backgroundColor: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Text Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={styles.textColor}
                          onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
                          className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200"
                        />
                        <input
                          type="text"
                          value={styles.textColor}
                          onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Font Family
                      </label>
                      <select
                        value={styles.fontFamily}
                        onChange={(e) => handleStyleUpdate({ fontFamily: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                        <option value="Georgia, serif">Georgia (Classic Serif)</option>
                        <option value="system-ui, sans-serif">System Default</option>
                        <option value="Monaco, monospace">Monaco (Monospace)</option>
                      </select>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </aside>

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="border border-sky-200 bg-white px-4 py-3 text-slate-900 shadow-lg">
              {"icon" in activeDrag ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg">{activeDrag.icon}</span>
                  <span>{activeDrag.label}</span>
                </div>
              ) : (
                activeDrag.label
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

