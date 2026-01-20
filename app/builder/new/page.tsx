"use client";

import { useState } from "react";
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
import type { FormField, FormStyles, WorkspaceView, CollectionData } from "@/app/lib/types";
import { nanoid } from "nanoid";
import { useEffect } from "react";

type SaveAsType = "form" | "form-group" | "grid-layout" | "box-layout";

export default function NewFormBuilderPage() {
  const router = useRouter();
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<{ type: string; label: string } | null>(null);
  const [styles, setStyles] = useState<FormStyles>(defaultStyles);
  const [undoStack, setUndoStack] = useState<FormField[][]>([]);
  const [redoStack, setRedoStack] = useState<FormField[][]>([]);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("edit");
  
  // Save modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [saveForm, setSaveForm] = useState({
    collectionName: "",
    formName: "",
  });
  const [saveType, setSaveType] = useState<SaveAsType>("form");
  const [layoutName, setLayoutName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;
  const hasChanges = fields.length > 0;

  // Fetch collections for save modal
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch("/api/collections");
        const data = await response.json();
        if (data.success) {
          setCollections(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch collections");
      }
    };
    fetchCollections();
  }, []);

  const handleSave = () => {
    setShowSaveModal(true);
    setSaveType("form");
    setLayoutName("");
  };

  const handleSaveConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only validate collection and form name for form type
    if (saveType === "form") {
      if (!saveForm.collectionName || !saveForm.formName) {
        alert("Please fill in all required fields");
        return;
      }
    }

    if (saveType !== "form" && !layoutName.trim()) {
      alert(`Please enter a ${saveType === "form-group" ? "Form Group" : saveType === "grid-layout" ? "Grid Layout" : "Box Layout"} name`);
      return;
    }

    setSaving(true);
    try {
      // If saving as layout (form-group or grid-layout), only create the layout
      if (saveType !== "form" && layoutName.trim()) {
        const layoutResponse = await fetch("/api/form-layouts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            layoutName: layoutName.trim(),
            layoutType: saveType,
            fields,
          }),
        });

        const layoutResult = await layoutResponse.json();

        if (!layoutResult.success) {
          alert(`Failed to create layout: ${layoutResult.error}`);
          return;
        }

        setShowSaveModal(false);
        alert(`${saveType === "form-group" ? "Form Group" : saveType === "grid-layout" ? "Grid Layout" : "Box Layout"} "${layoutName}" created successfully! You can manage it from the Layouts page.`);
        router.push("/layouts");
        return;
      }

      // Create the form
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionName: saveForm.collectionName,
          formName: saveForm.formName,
          formJson: {
            fields,
            styles,
          },
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        alert(data.error);
        return;
      }

      setShowSaveModal(false);
      alert("Form saved successfully!");
      router.push(`/builder/${data.data._id}`);
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
      const customFieldId = activeData?.customFieldId;
      const lovItems = activeData?.lovItems;
      const tableColumns = activeData?.tableColumns;

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

      // If it's a table field with columns, add the columns
      if (fieldType === "table" && tableColumns && tableColumns.length > 0) {
        newField.columns = tableColumns.map((col: any) => ({
          name: col.name,
          label: col.label,
          type: col.type || "text",
          required: col.required || false,
          options: col.options || [],
        }));
        newField.tableRows = []; // Initialize with empty rows
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

  const handleFieldUpdateById = (fieldId: string, patch: Partial<FormField>) => {
    pushUndo(fields);
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...patch } : f))
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

  return (
    <div className="flex h-full bg-slate-100 flex-col">
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
          hasUnsavedChanges={hasChanges}
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
                onUpdateField={handleFieldUpdateById}
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
                formName="New Form"
                collectionName=""
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

      {/* Save Form Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">Save</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveConfirm} className="p-4 space-y-4">
              {/* Save Type Options - show first */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Save As
                </label>
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
                      <div className="font-medium text-slate-700 text-sm">Form</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-sky-50 transition-colors">
                    <input
                      type="radio"
                      name="saveType"
                      checked={saveType === "form-group"}
                      onChange={() => setSaveType("form-group")}
                      className="w-4 h-4 text-sky-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700 text-sm">Form Group</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-sky-50 transition-colors">
                    <input
                      type="radio"
                      name="saveType"
                      checked={saveType === "grid-layout"}
                      onChange={() => setSaveType("grid-layout")}
                      className="w-4 h-4 text-sky-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700 text-sm">Grid Layout</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-sky-50 transition-colors">
                    <input
                      type="radio"
                      name="saveType"
                      checked={saveType === "box-layout"}
                      onChange={() => setSaveType("box-layout")}
                      className="w-4 h-4 text-sky-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-700 text-sm">Box Layout</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Show Collection and Form Name only for Form type */}
              {saveType === "form" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Select Collection <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={saveForm.collectionName}
                      onChange={(e) => setSaveForm({ ...saveForm, collectionName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                      required
                    >
                      <option value="">Select a collection</option>
                      {collections.map((collection) => (
                        <option key={collection._id} value={collection.name}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Form Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={saveForm.formName}
                      onChange={(e) => setSaveForm({ ...saveForm, formName: e.target.value })}
                      placeholder="Enter form name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                      required
                    />
                  </div>
                </>
              )}

              {saveType !== "form" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {saveType === "form-group" ? "Form Group Name" : saveType === "grid-layout" ? "Grid Layout Name" : "Box Layout Name"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    placeholder={`Enter ${saveType === "form-group" ? "form group" : saveType === "grid-layout" ? "grid layout" : "box layout"} name`}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : saveType === "form" ? "Save Form" : `Create ${saveType === "form-group" ? "Form Group" : saveType === "grid-layout" ? "Grid Layout" : "Box Layout"}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
