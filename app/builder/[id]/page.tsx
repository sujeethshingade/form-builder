"use client";

import { useMemo, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { FormCanvas } from "@/app/components/canvas/FormCanvas";
import { JsonPreview } from "@/app/components/canvas/JsonPreview";
import { FormPreview } from "@/app/components/canvas/FormPreview";
import InspectorSidebar from "@/app/components/element/InspectorSidebar";
import { ElementSidebar } from "@/app/components/element/ElementSidebar";
import { TopBar } from "@/app/components/element/Navbar";
import { fieldToSurveyJSON, library, makeField, defaultStyles } from "@/app/lib/form";
import { getIconForType } from "@/app/lib/icons";
import { CursorIcon } from "@/app/lib/icons";
import type { FormField, FormStyles, WorkspaceView } from "@/app/lib/types";

interface FormData {
  _id: string;
  collectionName: string;
  formName: string;
  fields: FormField[];
  styles: FormStyles;
  surveyJson: any;
  createdAt: string;
  updatedAt: string;
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // Fetch form data on mount
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${resolvedParams.id}`);
        const data = await response.json();
        
        if (data.success) {
          setFormData(data.data);
          setFields(data.data.fields || []);
          setStyles(data.data.styles || defaultStyles);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch form");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [resolvedParams.id]);

  // Track unsaved changes
  useEffect(() => {
    if (formData) {
      const fieldsChanged = JSON.stringify(fields) !== JSON.stringify(formData.fields || []);
      const stylesChanged = JSON.stringify(styles) !== JSON.stringify(formData.styles || defaultStyles);
      setHasUnsavedChanges(fieldsChanged || stylesChanged);
    }
  }, [fields, styles, formData]);

  // Save form to database
  const handleSave = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/forms/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          styles,
          surveyJson,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
        setHasUnsavedChanges(false);
        alert("Form saved successfully!");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to save form");
    } finally {
      setSaving(false);
    }
  };

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

  const exportString = useMemo(
    () => JSON.stringify(surveyJson, null, 2),
    [surveyJson]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push("/forms")}
            className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
          formName={formData?.formName}
          formCollection={formData?.collectionName}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          saving={saving}
          onBack={() => router.push("/forms")}
        />

        <div className="flex h-full overflow-hidden">
          <ElementSidebar collapsed={!isLeftSidebarOpen} />

          <main className="flex h-full flex-1 flex-col overflow-hidden">
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
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            isLeftSidebarOpen ? (
              <div className="flex items-center gap-2 border rounded-sm border-slate-200 bg-white px-2 py-1.5 text-slate-900 shadow-lg">
                <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
                  {getIconForType(activeDrag.type as any)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{activeDrag.label}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center border rounded-sm border-slate-200 bg-white py-1.5 shadow-lg">
                <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
                  {getIconForType(activeDrag.type as any)}
                </div>
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
