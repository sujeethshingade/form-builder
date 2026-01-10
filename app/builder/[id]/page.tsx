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
import { TopBar } from "@/app/components/element/Navbar";
import { library, makeField, defaultStyles } from "@/app/lib/form";
import { getIconForType } from "@/app/lib/icons";
import { CursorIcon } from "@/app/lib/icons";
import type { FormField, FormStyles, WorkspaceView, TemplateData } from "@/app/lib/types";
import { nanoid } from "nanoid";

type SaveAsType = "form" | "form-group" | "box-layout";

interface FormJson {
  fields: FormField[];
  styles: FormStyles;
}

interface FormData {
  _id: string;
  collectionName: string;
  formName: string;
  formJson: FormJson;
  createdAt: string;
  updatedAt: string;
}

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saveType: SaveAsType, layoutName?: string) => void;
  saving: boolean;
  formName?: string;
}

function SaveModal({ isOpen, onClose, onSave, saving, formName }: SaveModalProps) {
  const [saveType, setSaveType] = useState<SaveAsType>("form");
  const [layoutName, setLayoutName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSaveType("form");
      setLayoutName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (saveType !== "form" && !layoutName.trim()) {
      alert("Please enter a layout name");
      return;
    }
    onSave(saveType, saveType !== "form" ? layoutName.trim() : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Save Options</h2>
        
        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-3">
            Choose how to save <span className="font-medium">{formName || "this form"}</span>:
          </p>
          
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="saveType"
                checked={saveType === "form"}
                onChange={() => setSaveType("form")}
                className="w-4 h-4 text-sky-600"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-700">Save as Form</div>
                <div className="text-xs text-slate-500">Save as a regular form</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
              <input
                type="radio"
                name="saveType"
                checked={saveType === "form-group"}
                onChange={() => setSaveType("form-group")}
                className="w-4 h-4 text-purple-600"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-700">Form Group</div>
                <div className="text-xs text-slate-500">Save as a reusable group of fields</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
              <input
                type="radio"
                name="saveType"
                checked={saveType === "box-layout"}
                onChange={() => setSaveType("box-layout")}
                className="w-4 h-4 text-emerald-600"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-700">Box Layout</div>
                <div className="text-xs text-slate-500">Save as a box layout template</div>
              </div>
            </label>
          </div>
        </div>

        {saveType !== "form" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {saveType === "form-group" ? "Form Group Name" : "Box Layout Name"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              placeholder={`Enter ${saveType === "form-group" ? "form group" : "box layout"} name`}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

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

  // Fetch form data on mount
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${resolvedParams.id}`);
        const data = await response.json();
        
        if (data.success) {
          setFormData(data.data);
          const formJson = data.data.formJson || { fields: [], styles: defaultStyles };
          setFields(formJson.fields || []);
          setStyles(formJson.styles || defaultStyles);
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
      const formJson = formData.formJson || { fields: [], styles: defaultStyles };
      const fieldsChanged = JSON.stringify(fields) !== JSON.stringify(formJson.fields || []);
      const stylesChanged = JSON.stringify(styles) !== JSON.stringify(formJson.styles || defaultStyles);
      setHasUnsavedChanges(fieldsChanged || stylesChanged);
    }
  }, [fields, styles, formData]);

  // Handle save button click - show modal
  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  // Save form to database
  const handleSave = async (saveType: SaveAsType, layoutName?: string) => {
    if (!formData) return;
    
    setSaving(true);
    try {
      // Always save the form first
      const formResponse = await fetch(`/api/forms/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formJson: {
            fields,
            styles,
          },
        }),
      });
      
      const formResult = await formResponse.json();
      
      if (!formResult.success) {
        alert(formResult.error);
        return;
      }

      setFormData(formResult.data);
      setHasUnsavedChanges(false);

      // If saving as layout, also create the layout
      if (saveType !== "form" && layoutName) {
        const layoutResponse = await fetch("/api/form-layouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layoutName,
            layoutType: saveType,
            category: formData.collectionName,
            fields,
          }),
        });

        const layoutResult = await layoutResponse.json();

        if (!layoutResult.success) {
          alert(`Form saved, but layout creation failed: ${layoutResult.error}`);
          setShowSaveModal(false);
          return;
        }

        alert(`Form saved and ${saveType === "form-group" ? "Form Group" : "Box Layout"} "${layoutName}" created successfully!`);
      } else {
        alert("Form saved successfully!");
      }

      setShowSaveModal(false);
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
      setActiveDrag({ type: "layout", label: layoutName || (layoutType === "form-group" ? "Form Group" : "Box Layout") });
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
        id: nanoid(), // Generate new unique ID
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
      
      // Select the first field of the added layout
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
      const lovEnabled = activeData?.lovEnabled;
      const lovItems = activeData?.lovItems;

      if (!fieldType) return;

      pushUndo(fields);
      
      // Create the new field based on custom field data
      const newField: FormField = {
        id: nanoid(),
        type: fieldType as any,
        label: fieldLabel || fieldName,
        name: fieldName,
        placeholder: "",
        helper: "",
        required: false,
        width: "full" as const,
      };

      // If it's a select/radio with LOV items, add the options
      if (lovEnabled && lovItems && lovItems.length > 0 && (fieldType === "select" || fieldType === "radio")) {
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

  // Handle form submission from preview mode
  const handleFormSubmission = async (data: Record<string, unknown>) => {
    if (!formData) throw new Error("Form data not available");
    
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formId: formData._id,
        collectionName: formData.collectionName,
        formName: formData.formName,
        data,
      }),
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
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
          onSave={handleSaveClick}
          saving={saving}
          onBack={() => router.push("/forms")}
        />

        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSave}
          saving={saving}
          formName={formData?.formName}
        />

        <div className="flex h-full overflow-hidden">
          <aside
            className={`flex h-full flex-col bg-white border-r border-slate-200 transition-[width] duration-300 ease-out ${
              isLeftSidebarOpen ? "w-84" : "w-0 min-w-0 overflow-hidden"
            }`}
          >
            <div
              className={`flex h-full w-84 flex-col ${
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
                formId={formData?._id}
                formName={formData?.formName}
                collectionName={formData?.collectionName}
                onSubmit={handleFormSubmission}
              />
            ) : (
              <JsonPreview
                fields={fields}
                styles={styles}
                formName={formData?.formName}
                collectionName={formData?.collectionName}
              />
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
            activeDrag.type === "template" ? (
              <div className="flex items-center gap-2 border rounded-sm border-sky-300 bg-sky-50 px-2 py-1.5 text-slate-900 shadow-lg">
                <div className="flex h-9 w-9 items-center justify-center text-sky-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{activeDrag.label}</div>
                </div>
              </div>
            ) : activeDrag.type === "layout" ? (
              <div className="flex items-center gap-2 border rounded-sm border-purple-300 bg-purple-50 px-2 py-1.5 text-slate-900 shadow-lg">
                <div className="flex h-9 w-9 items-center justify-center text-purple-500 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{activeDrag.label}</div>
                </div>
              </div>
            ) : isLeftSidebarOpen ? (
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
