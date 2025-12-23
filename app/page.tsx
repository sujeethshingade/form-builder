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
import { SurveyModel } from "survey-react-ui";
import "survey-core/defaultV2.min.css";

import { FormCanvas } from "./components/canvas/FormCanvas";
import { JsonPreview } from "./components/canvas/JsonPreview";
import { FormPreview } from "./components/canvas/FormPreview";
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { ElementSidebar } from "./components/element/ElementSidebar";
import { TopBar, type WorkspaceView } from "./components/navbar/TopBar";
import { fieldToSurveyJSON, library, makeField, makeFieldFromTemplate, templates, defaultStyles } from "./lib/form";
import type { FormField, LibraryItem, FormStyles, FormTemplate, ComponentType } from "./lib/form";

// Icon mapping for drag overlay
const getIconForType = (type: ComponentType): React.ReactNode => {
  const icons: Record<ComponentType, React.ReactNode> = {
    text: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8" />
      </svg>
    ),
    textarea: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    ),
    number: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
    email: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    password: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    url: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    checkbox: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    radio: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    select: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
      </svg>
    ),
    date: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    time: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    location: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    file: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    rating: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    signature: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
    heading: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    h1: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    h2: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    h3: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    paragraph: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    divider: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
      </svg>
    ),
    spacer: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
    table: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

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

  const handleDeleteById = (id: string) => {
    pushUndo(fields);
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleMoveUp = (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index <= 0) return;
    pushUndo(fields);
    setFields((prev) => arrayMove(prev, index, index - 1));
  };

  const handleMoveDown = (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index === -1 || index >= fields.length - 1) return;
    pushUndo(fields);
    setFields((prev) => arrayMove(prev, index, index + 1));
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
              onDelete={handleDeleteById}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              styles={styles}
            />
          ) : workspaceView === "preview" ? (
            <FormPreview surveyJson={surveyJson} />
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
            <div className="flex items-center gap-3 border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-lg rounded">
              <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
                {getIconForType(activeDrag.type)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700">{activeDrag.label}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

