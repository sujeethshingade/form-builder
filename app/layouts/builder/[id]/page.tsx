"use client";

import { useState, useEffect, use } from "react";
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
import { BuilderNavbar } from "@/app/components/builder/BuilderNavbar";
import { library, makeField, defaultStyles } from "@/app/lib/form";
import { CursorIcon } from "@/app/lib/icons";
import type { FormField, FormStyles, WorkspaceView } from "@/app/lib/types";
import { nanoid } from "nanoid";

interface LayoutData {
  _id: string;
  layoutName: string;
  layoutType: "form-group" | "grid-layout" | "box-layout";
  category?: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export default function LayoutBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [layoutData, setLayoutData] = useState<LayoutData | null>(null);
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

  // Fetch layout data on mount
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(`/api/form-layouts/${resolvedParams.id}`);
        const data = await response.json();
        
        if (data.success) {
          setLayoutData(data.data);
          setFields(data.data.fields || []);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError("Failed to fetch layout");
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, [resolvedParams.id]);

  // Track unsaved changes
  useEffect(() => {
    if (layoutData) {
      const fieldsChanged = JSON.stringify(fields) !== JSON.stringify(layoutData.fields || []);
      setHasUnsavedChanges(fieldsChanged);
    }
  }, [fields, layoutData]);

  // Save layout to database
  const handleSave = async () => {
    if (!layoutData) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/form-layouts/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
        }),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        alert(result.error);
        return;
      }

      setLayoutData(result.data);
      setHasUnsavedChanges(false);
      alert("Layout saved successfully!");
    } catch (err) {
      alert("Failed to save");
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
    const fromCustomField = event?.active?.data?.current?.from === "custom-field";
    const fromFormLayout = event?.active?.data?.current?.from === "form-layout";

    if (fromCanvas) {
      const field = fields.find((f) => f.id === event.active.id);
      if (field) setActiveDrag({ type: field.type, label: field.label });
    } else if (fromCustomField) {
      const fieldLabel = event?.active?.data?.current?.fieldLabel;
      const fieldType = event?.active?.data?.current?.type;
      setActiveDrag({ type: fieldType, label: fieldLabel || "Custom Field" });
    } else if (fromFormLayout) {
      const layoutName = event?.active?.data?.current?.layoutName;
      const layoutType = event?.active?.data?.current?.layoutType;
      setActiveDrag({ type: "layout", label: layoutName || (layoutType === "form-group" ? "Form Group" : "Grid Layout") });
    } else if (activeType) {
      const libItem = library.find((l) => l.type === activeType);
      if (libItem) setActiveDrag({ type: libItem.type, label: libItem.label });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const activeData = active?.data?.current;
    const overId = over?.id as string | undefined;

    // Handle form layout drop - add all fields from the layout
    if (activeData?.from === "form-layout") {
      const layoutFields = activeData?.fields;
      
      if (!layoutFields || !Array.isArray(layoutFields) || layoutFields.length === 0) {
        setActiveDrag(null);
        return;
      }

      pushUndo(fields);
      
      // Create new fields with new IDs from the layout
      const newFields: FormField[] = layoutFields.map((field: any) => ({
        ...field,
        id: nanoid(),
      }));

      if (!overId || overId === "canvas") {
        setFields((prev) => [...prev, ...newFields]);
      } else {
        const targetIndex = fields.findIndex((f) => f.id === overId);
        if (targetIndex >= 0) {
          setFields((prev) => {
            const next = [...prev];
            next.splice(targetIndex, 0, ...newFields);
            return next;
          });
        } else {
          setFields((prev) => [...prev, ...newFields]);
        }
      }
      
      if (newFields.length > 0) {
        setSelectedId(newFields[0].id);
      }
      
      setActiveDrag(null);
      return;
    }

    // Handle custom field drop
    if (activeData?.from === "custom-field") {
      const fieldType = activeData?.type;
      const fieldLabel = activeData?.fieldLabel;
      const fieldName = activeData?.fieldName;
      const customFieldId = activeData?.customFieldId;
      const lovItems = activeData?.lovItems;

      if (!fieldType) return;

      pushUndo(fields);
      
      const newField: FormField = {
        id: nanoid(),
        type: fieldType as any,
        label: fieldLabel || fieldName,
        name: fieldName,
        placeholder: "",
        helper: "",
        required: false,
        width: "full" as const,
        widthColumns: 12,
      };

      // If it's a dropdown/radio/checkbox with LOV items, store customFieldId and lovItems
      const isChoiceField = ["dropdown", "radio", "checkbox"].includes(fieldType);
      if (isChoiceField && lovItems && lovItems.length > 0) {
        newField.customFieldId = customFieldId;
        newField.lovItems = lovItems;
        newField.items = lovItems
          .filter((item: any) => item.status === "Active")
          .map((item: any) => ({
            value: item.code,
            label: item.shortName,
          }));
      }

      if (!overId || overId === "canvas") {
        setFields((prev) => [...prev, newField]);
      } else {
        const targetIndex = fields.findIndex((f) => f.id === overId);
        if (targetIndex >= 0) {
          setFields((prev) => {
            const next = [...prev];
            next.splice(targetIndex, 0, newField);
            return next;
          });
        }
      }
      setSelectedId(newField.id);
    }

    // Handle palette element drop
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push("/layouts")}
            className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
          >
            Back to Layouts
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
        <BuilderNavbar
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          workspaceView={workspaceView}
          onWorkspaceViewChange={setWorkspaceView}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          saving={saving}
          isLeftSidebarOpen={isLeftSidebarOpen}
          onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
          isRightSidebarOpen={isRightSidebarOpen}
          onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
          <aside
            className={`flex h-full flex-col bg-white border-r border-slate-200 transition-[width] duration-300 ease-out ${
              isLeftSidebarOpen ? "w-72" : "w-0 min-w-0 overflow-hidden"
            }`}
          >
            <div
              className={`flex h-full w-72 flex-col ${
                isLeftSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              } transition-opacity duration-200 ${isLeftSidebarOpen ? "delay-100" : ""}`}
            >
              <ElementSidebar />
            </div>
          </aside>

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
              <FormPreview 
                fields={fields} 
                styles={styles}
              />
            ) : (
              <JsonPreview
                fields={fields}
                styles={styles}
                formName={layoutData?.layoutName}
                collectionName={layoutData?.category}
              />
            )}
          </main>

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
            <div className="flex items-center gap-2 border rounded-sm border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-lg">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{activeDrag.label}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
