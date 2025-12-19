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
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { LibraryPanel } from "./components/library/LibraryPanel";
import { TemplatesSidebar } from "./components/sidebar/TemplatesSidebar";
import { TopBar } from "./components/navbar/TopBar";
import { fieldToSurveyJSON, library, makeField, makeFieldFromTemplate, templates, defaultStyles } from "./lib/form";
import type { FormField, LibraryItem, FormStyles, FormTemplate } from "./lib/form";

type ViewMode = "desktop" | "tablet" | "mobile";

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState<LibraryItem | FormField | null>(null);
  const [styles, setStyles] = useState<FormStyles>(defaultStyles);
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [rightTab, setRightTab] = useState<"components" | "styles">("components");
  const [undoStack, setUndoStack] = useState<FormField[][]>([]);
  const [redoStack, setRedoStack] = useState<FormField[][]>([]);

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
    <div className="flex h-screen flex-col bg-slate-100">
      <TopBar
        onPreview={() => setPreviewOpen(true)}
        onExport={() => setJsonOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Templates */}
          <TemplatesSidebar
            templates={templates}
            onSelect={handleTemplateSelect}
          />

          {/* Center - Canvas */}
          <main className="flex flex-1 flex-col overflow-hidden">
            <FormCanvas
              fields={fields}
              selectedId={selectedId}
              onSelect={setSelectedId}
              viewMode={viewMode}
              styles={styles}
            />
          </main>

          {/* Right Sidebar - Components & Styles */}
          <aside className="flex w-72 flex-col border-l border-slate-200 bg-white">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setRightTab("components")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  rightTab === "components"
                    ? "border-b-2 border-sky-500 text-sky-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setRightTab("styles")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  rightTab === "styles"
                    ? "border-b-2 border-sky-500 text-sky-600"
                    : "text-slate-500 hover:text-slate-700"
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
                  <LibraryPanel items={library} />
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
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={styles.primaryColor}
                        onChange={(e) => handleStyleUpdate({ primaryColor: e.target.value })}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-slate-200"
                      />
                      <input
                        type="text"
                        value={styles.primaryColor}
                        onChange={(e) => handleStyleUpdate({ primaryColor: e.target.value })}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Border Radius
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={styles.borderRadius}
                        onChange={(e) => handleStyleUpdate({ borderRadius: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-12 text-right text-sm text-slate-600">{styles.borderRadius}px</span>
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
          </aside>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-slate-900 shadow-lg">
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

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Form Preview</h3>
                <p className="text-sm text-slate-500">Live preview of your form</p>
              </div>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
              <Survey model={surveyModel} />
            </div>
          </div>
        </div>
      )}

      {/* JSON Export Modal */}
      {jsonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Export JSON</h3>
                <p className="text-sm text-slate-500">Copy the form configuration</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
                  onClick={() => navigator.clipboard.writeText(exportString)}
                >
                  Copy to Clipboard
                </button>
                <button
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  onClick={() => setJsonOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <pre className="max-h-[60vh] overflow-y-auto rounded-xl bg-slate-900 p-4 text-sm text-emerald-400">
                {exportString}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

