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
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { BuilderNavbar } from "@/app/components/builder/BuilderNavbar";
import { LayoutCanvas } from "@/app/components/canvas/LayoutCanvas";
import { LayoutField } from "@/app/components/canvas/LayoutCanvasCard";
import { LayoutFieldInspector } from "@/app/components/element/LayoutFieldInspector";

interface Box {
  id: string;
  title: string;
  fields: LayoutField[];
}

interface LayoutConfig {
  boxes: Box[];
}

interface LayoutData {
  _id: string;
  layoutName: string;
  layoutType: "box-layout";
  category?: string;
  fields: any[];
  layoutConfig: LayoutConfig;
  createdAt: string;
  updatedAt: string;
}

interface CustomFieldData {
  _id: string;
  fieldName: string;
  fieldLabel: string;
  dataType: string;
  lovEnabled: boolean;
  lovItems?: any[];
}

// Draggable Field Card in Sidebar
function DraggableFieldCard({ field }: { field: CustomFieldData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `custom-field-${field._id}`,
    data: {
      from: "custom-field",
      customFieldId: field._id,
      type: field.dataType,
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      lovEnabled: field.lovEnabled,
      lovItems: field.lovItems,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-grab transition hover:shadow-md active:cursor-grabbing bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-700 truncate">{field.fieldLabel}</div>
        <div className="text-xs text-slate-400 truncate capitalize">{field.dataType}</div>
      </div>
    </div>
  );
}

// Field Sidebar Component
function FieldSidebar({
  customFields,
  searchTerm,
  onSearchChange,
}: {
  customFields: CustomFieldData[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  const filteredFields = customFields.filter(
    (field) =>
      field.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
        />
      </div>
      
      {/* Fields List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {filteredFields.map((field) => (
            <DraggableFieldCard key={field._id} field={field} />
          ))}
          {filteredFields.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No fields found</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default function BoxLayoutBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [layoutData, setLayoutData] = useState<LayoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Builder state
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [undoStack, setUndoStack] = useState<Box[][]>([]);
  const [redoStack, setRedoStack] = useState<Box[][]>([]);

  const [boxes, setBoxes] = useState<Box[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrag, setActiveDrag] = useState<{ type: string; label: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const selectedField = boxes[0]?.fields.find((f) => f.id === selectedFieldId) || null;

  // Fetch layout data
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(`/api/form-layouts/${resolvedParams.id}`);
        const data = await response.json();

        if (data.success) {
          setLayoutData(data.data);
          const config = data.data.layoutConfig || { boxes: [{ id: "box-1", title: "Box 1", fields: [] }] };
          setBoxes(config.boxes || [{ id: "box-1", title: "Box 1", fields: [] }]);
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

  // Fetch custom fields
  useEffect(() => {
    const fetchCustomFields = async () => {
      try {
        const response = await fetch("/api/custom-fields");
        const data = await response.json();
        if (data.success) {
          setCustomFields(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch custom fields:", err);
      }
    };
    fetchCustomFields();
  }, []);

  // Track changes
  useEffect(() => {
    if (layoutData) {
      const currentConfig = { boxes };
      const originalConfig = layoutData.layoutConfig || { boxes: [] };
      setHasUnsavedChanges(JSON.stringify(currentConfig) !== JSON.stringify(originalConfig));
    }
  }, [boxes, layoutData]);

  // Push to undo stack
  const pushUndo = () => {
    setUndoStack((stack) => [...stack.slice(-19), JSON.parse(JSON.stringify(boxes))]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, JSON.parse(JSON.stringify(boxes))]);
    setUndoStack((stack) => stack.slice(0, -1));
    setBoxes(prev);
    setSelectedFieldId(null);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, JSON.parse(JSON.stringify(boxes))]);
    setRedoStack((stack) => stack.slice(0, -1));
    setBoxes(next);
    setSelectedFieldId(null);
  };

  // Update box title
  const handleUpdateBoxTitle = (boxId: string, title: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, title } : b))
    );
  };

  // Field operations - always work with the first box (template)
  const templateBox = boxes[0];
  
  const handleDeleteField = (fieldId: string) => {
    if (!templateBox) return;
    pushUndo();
    setBoxes((prev) =>
      prev.map((box, index) => {
        if (index === 0) {
          return { ...box, fields: box.fields.filter((f) => f.id !== fieldId) };
        }
        return box;
      })
    );
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleDuplicateField = (fieldId: string) => {
    if (!templateBox) return;
    const fieldIndex = templateBox.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;
    
    pushUndo();
    const fieldToDuplicate = templateBox.fields[fieldIndex];
    const duplicatedField = { ...fieldToDuplicate, id: nanoid() };
    
    setBoxes((prev) =>
      prev.map((box, index) => {
        if (index === 0) {
          const newFields = [...box.fields];
          newFields.splice(fieldIndex + 1, 0, duplicatedField);
          return { ...box, fields: newFields };
        }
        return box;
      })
    );
    setSelectedFieldId(duplicatedField.id);
  };

  const handleMoveFieldUp = (fieldId: string) => {
    if (!templateBox) return;
    const fieldIndex = templateBox.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex <= 0) return;
    
    pushUndo();
    setBoxes((prev) =>
      prev.map((box, index) => {
        if (index === 0) {
          return { ...box, fields: arrayMove(box.fields, fieldIndex, fieldIndex - 1) };
        }
        return box;
      })
    );
  };

  const handleMoveFieldDown = (fieldId: string) => {
    if (!templateBox) return;
    const fieldIndex = templateBox.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1 || fieldIndex >= templateBox.fields.length - 1) return;
    
    pushUndo();
    setBoxes((prev) =>
      prev.map((box, index) => {
        if (index === 0) {
          return { ...box, fields: arrayMove(box.fields, fieldIndex, fieldIndex + 1) };
        }
        return box;
      })
    );
  };

  const handleUpdateField = (updates: Partial<LayoutField>) => {
    if (!selectedFieldId) return;
    setBoxes((prev) =>
      prev.map((box, index) => {
        if (index === 0) {
          return {
            ...box,
            fields: box.fields.map((f) =>
              f.id === selectedFieldId ? { ...f, ...updates } : f
            ),
          };
        }
        return box;
      })
    );
  };

  // Handle drag start
  const handleDragStart = (event: any) => {
    const data = event.active.data.current;
    if (data?.from === "custom-field") {
      setActiveDrag({ type: data.type, label: data.fieldLabel || "Field" });
    } else if (data?.from === "canvas-field") {
      setActiveDrag({ type: "field", label: "Field" });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;

    const activeData = active.data.current;

    // Drop custom field into box canvas
    if (activeData?.from === "custom-field" && boxes[0]) {
      const newField: LayoutField = {
        id: nanoid(),
        type: activeData.type,
        label: activeData.fieldLabel || activeData.fieldName,
        widthColumns: 12,
        customFieldId: activeData.customFieldId,
        lovItems: activeData.lovItems,
      };

      if (activeData.lovItems && activeData.lovItems.length > 0) {
        newField.items = activeData.lovItems
          .filter((item: any) => item.status === "Active")
          .map((item: any) => ({
            value: item.code,
            label: item.shortName,
          }));
      }

      pushUndo();
      setBoxes((prev) =>
        prev.map((box, index) => {
          if (index === 0) {
            return { ...box, fields: [...box.fields, newField] };
          }
          return box;
        })
      );
      setSelectedFieldId(newField.id);
    }

    // Reorder fields within box
    if (activeData?.from === "canvas-field" && boxes[0] && active.id !== over.id) {
      pushUndo();
      setBoxes((prev) =>
        prev.map((box, index) => {
          if (index === 0) {
            const oldIndex = box.fields.findIndex((f) => f.id === active.id);
            const newIndex = box.fields.findIndex((f) => f.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
              return { ...box, fields: arrayMove(box.fields, oldIndex, newIndex) };
            }
          }
          return box;
        })
      );
    }
  };

  // Save layout
  const handleSave = async () => {
    if (!layoutData) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/form-layouts/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutConfig: { boxes },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-slate-100 flex-col">
        {/* Builder Navbar */}
        <BuilderNavbar
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
          onUndo={handleUndo}
          onRedo={handleRedo}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={handleSave}
          saving={saving}
          isLeftSidebarOpen={isLeftSidebarOpen}
          onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
          isRightSidebarOpen={isRightSidebarOpen}
          onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
        />

        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Left Sidebar - Custom Fields */}
          <div
            className={`flex h-full flex-col bg-white border-r border-slate-200 transition-[width] duration-300 ease-out ${
              isLeftSidebarOpen ? "w-72" : "w-0 min-w-0 overflow-hidden"
            }`}
          >
            <div
              className={`flex h-full w-72 flex-col ${
                isLeftSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              } transition-opacity duration-200 ${isLeftSidebarOpen ? "delay-100" : ""}`}
            >
              <FieldSidebar
                customFields={customFields}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>



          {/* Main Content - Canvas */}
          <main className="flex-1 overflow-auto p-6 bg-slate-100">
            <div className="max-w-5xl mx-auto">
              {boxes[0] && (
                <LayoutCanvas
                  fields={boxes[0].fields}
                  selectedId={selectedFieldId}
                  onSelect={setSelectedFieldId}
                  onDelete={handleDeleteField}
                  onDuplicate={handleDuplicateField}
                  onMoveUp={handleMoveFieldUp}
                  onMoveDown={handleMoveFieldDown}
                  droppableId={`box-${boxes[0].id}`}
                  emptyMessage=""
                />
              )}
            </div>
          </main>

          {/* Right Sidebar - Field Inspector */}
          <div
            className={`flex h-full flex-col border-l border-slate-200 bg-white transition-[width] duration-300 ease-out ${
              isRightSidebarOpen ? "w-72" : "w-0 min-w-0 overflow-hidden"
            }`}
          >
            <div
              className={`flex h-full w-72 flex-col ${
                isRightSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              } transition-opacity duration-200 ${isRightSidebarOpen ? "delay-100" : ""}`}
            >
              <LayoutFieldInspector
                field={selectedField}
                onUpdate={handleUpdateField}
                onClose={() => setSelectedFieldId(null)}
              />
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="flex items-center gap-2 border rounded-lg border-sky-300 bg-white px-3 py-2 text-slate-900 shadow-xl">
              <div className="text-sm font-medium text-slate-700 truncate">{activeDrag.label}</div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
