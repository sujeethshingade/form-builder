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
import { FormCanvas } from "./components/canvas/FormCanvas";
import { JsonPreview } from "./components/canvas/JsonPreview";
import { FormPreview } from "./components/canvas/FormPreview";
import InspectorSidebar from "./components/element/InspectorSidebar";
import { ElementSidebar } from "./components/element/ElementSidebar";
import { TopBar } from "./components/element/Navbar";
import { fieldToSurveyJSON, library, makeField, defaultStyles } from "./lib/form";
import { getIconForType } from "./lib/icons";
import { CursorIcon } from "./lib/icons";
import type { FormField, FormStyles, WorkspaceView } from "./lib/types";

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ type: string; label: string } | null>(null);
  const [styles, setStyles] = useState<FormStyles>(defaultStyles);
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

  // Drag handlers
  const handleDragStart = (event: any) => {
    const activeType = event?.active?.data?.current?.type;
    const fromCanvas = event?.active?.data?.current?.from === "canvas";

    if (fromCanvas) {
      const field = fields.find((f) => f.id === event.active.id);
      if (field) setActiveDrag({ type: field.type, label: field.label });
    } else if (activeType) {
      const libItem = library.find((l) => l.type === activeType);
      if (libItem) setActiveDrag({ type: libItem.type, label: libItem.label });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const activeData = active?.data?.current;
    const overId = over?.id as string | undefined;

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

  const handleDuplicate = (id: string) => {
    const index = fields.findIndex((f) => f.id === id);
    if (index === -1) return;
    pushUndo(fields);
    const fieldToDuplicate = fields[index];
    const duplicatedField = {
      ...fieldToDuplicate,
      id: Math.random().toString(36).substring(2, 11),
      label: `${fieldToDuplicate.label}`,
    };
    setFields((prev) => [
      ...prev.slice(0, index + 1),
      duplicatedField,
      ...prev.slice(index + 1),
    ]);
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
        <ElementSidebar collapsed={!isLeftSidebarOpen} />

        <main className="flex h-full flex-1 flex-col overflow-hidden">
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
              onDuplicate={handleDuplicate}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              styles={styles}
            />
          ) : workspaceView === "preview" ? (
            <FormPreview fields={fields} styles={styles} />
          ) : (
            <div className="flex-1 overflow-auto bg-slate-100 p-8">
              <JsonPreview
                json={exportString}
                onCopy={() => navigator.clipboard.writeText(exportString)}
              />
            </div>
          )}
        </main>

        <aside
          className={`flex h-full flex-col border-l border-slate-200 bg-white transition-[width] duration-300 ease-out ${
            isRightSidebarOpen ? "w-84" : "w-0 min-w-0 overflow-hidden"
          }`}
        >
          <div
            className={`flex h-full flex-col ${
              isRightSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
            } transition-opacity duration-200 ${isRightSidebarOpen ? "delay-100" : ""}`}
          >
            <div className="flex justify-center border-b border-slate-200 px-4 py-4">
              <h2 className="text-sm font-medium text-slate-500 mt-0.5">Properties</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedField ? (
                <InspectorSidebar
                  field={selectedField}
                  onClose={() => setSelectedId(null)}
                  onUpdate={handleFieldUpdate}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 p-4">
                    <CursorIcon className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">No field selected</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Click on a field in the canvas to edit it
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="flex items-center gap-3 border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-lg rounded">
              <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
                {getIconForType(activeDrag.type as any)}
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
