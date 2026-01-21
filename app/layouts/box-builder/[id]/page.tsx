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
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import { BuilderNavbar } from "@/app/components/builder/BuilderNavbar";

interface BoxField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  width?: "full" | "half";
  widthColumns?: number;
  customFieldId?: string;
  lovItems?: any[];
  items?: any[];
}

interface Box {
  id: string;
  title: string;
  fields: BoxField[];
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

// Draggable Field Card
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
      className={`flex items-center gap-2 border rounded-sm px-2 py-2 cursor-grab transition hover:shadow-sm active:cursor-grabbing bg-white border-slate-200 hover:bg-slate-50 ${
        isDragging ? "opacity-50 shadow-md" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-slate-700 truncate">{field.fieldLabel}</div>
        <div className="text-xs text-slate-400 truncate">{field.dataType}</div>
      </div>
    </div>
  );
}

// Sortable Field in Box
function SortableBoxField({
  field,
  onRemove,
  onUpdateWidth,
}: {
  field: BoxField;
  onRemove: () => void;
  onUpdateWidth: (width: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { from: "box-field", fieldId: field.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${field.widthColumns || 6}`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-slate-200 rounded-md p-3 ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="cursor-grab p-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-700 truncate">{field.label}</div>
          <div className="text-xs text-slate-400 truncate">{field.type}</div>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={field.widthColumns || 6}
            onChange={(e) => onUpdateWidth(parseInt(e.target.value))}
            className="text-xs border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
          >
            <option value={3}>1/4</option>
            <option value={4}>1/3</option>
            <option value={6}>1/2</option>
            <option value={8}>2/3</option>
            <option value={12}>Full</option>
          </select>
          <button
            onClick={onRemove}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Box Component with Droppable Area
function BoxComponent({
  box,
  boxIndex,
  onRemoveBox,
  onUpdateBoxTitle,
  onRemoveField,
  onUpdateFieldWidth,
  isTemplate,
}: {
  box: Box;
  boxIndex: number;
  onRemoveBox: () => void;
  onUpdateBoxTitle: (title: string) => void;
  onRemoveField: (fieldId: string) => void;
  onUpdateFieldWidth: (fieldId: string, width: number) => void;
  isTemplate: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `box-${box.id}`,
    data: { boxId: box.id },
  });

  return (
    <div className={`bg-slate-50 rounded-lg border ${isTemplate ? "border-sky-300" : "border-slate-200"} overflow-hidden`}>
      {/* Box Header */}
      <div className={`px-4 py-3 ${isTemplate ? "bg-sky-50" : "bg-slate-100"} border-b border-slate-200 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={box.title}
            onChange={(e) => onUpdateBoxTitle(e.target.value)}
            className="text-sm font-medium text-slate-700 bg-transparent border-none focus:outline-none focus:ring-0"
            placeholder={`Box ${boxIndex + 1}`}
          />
        </div>
        {!isTemplate && (
          <button
            onClick={onRemoveBox}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
            title="Remove this instance"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Box Content */}
      <div
        ref={setNodeRef}
        className={`p-4 min-h-30 ${isOver ? "bg-sky-50" : ""}`}
      >
        {box.fields.length > 0 ? (
          <SortableContext items={box.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-12 gap-3">
              {box.fields.map((field) => (
                <SortableBoxField
                  key={field.id}
                  field={field}
                  onRemove={() => onRemoveField(field.id)}
                  onUpdateWidth={(width) => onUpdateFieldWidth(field.id, width)}
                />
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="flex items-center justify-center h-20 text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-md">
            {isTemplate ? "Drag and drop fields here" : "Fields will be copied from template"}
          </div>
        )}
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
  const excludedDataTypes = ["heading", "spacer", "divider", "table"];
  const filteredFields = customFields.filter(
    (field) =>
      !excludedDataTypes.includes(field.dataType.toLowerCase()) &&
      (field.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-3">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {filteredFields.map((field) => (
            <DraggableFieldCard key={field._id} field={field} />
          ))}
          {filteredFields.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No fields found</p>
          )}
        </div>
      </div>
    </aside>
  );
}

// Inspector Sidebar
function BoxInspectorSidebar({
  layoutName,
  boxCount,
  templateFieldCount,
}: {
  layoutName: string;
  boxCount: number;
  templateFieldCount: number;
}) {
  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Layout Name</label>
          <div className="text-sm text-slate-700">{layoutName}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Total Boxes</label>
          <div className="text-sm text-slate-700">{boxCount}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Template Fields</label>
          <div className="text-sm text-slate-700">{templateFieldCount}</div>
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
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrag, setActiveDrag] = useState<{ type: string; label: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

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
    setUndoStack((stack) => [...stack.slice(-19), [...boxes]]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, boxes]);
    setUndoStack((stack) => stack.slice(0, -1));
    setBoxes(prev);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, boxes]);
    setRedoStack((stack) => stack.slice(0, -1));
    setBoxes(next);
  };

  // Add new box (duplicate from template)
  const handleAddBox = () => {
    pushUndo();
    if (boxes.length === 0) {
      setBoxes([{ id: nanoid(), title: "Box 1", fields: [] }]);
      return;
    }

    // Duplicate the template (first box)
    const template = boxes[0];
    const newBox: Box = {
      id: nanoid(),
      title: `Box ${boxes.length + 1}`,
      fields: template.fields.map((f) => ({ ...f, id: nanoid() })),
    };
    setBoxes((prev) => [...prev, newBox]);
  };

  // Remove box
  const handleRemoveBox = (boxId: string) => {
    if (boxes.length <= 1) return;
    pushUndo();
    setBoxes((prev) => prev.filter((b) => b.id !== boxId));
  };

  // Update box title
  const handleUpdateBoxTitle = (boxId: string, title: string) => {
    setBoxes((prev) =>
      prev.map((b) => (b.id === boxId ? { ...b, title } : b))
    );
  };

  // Remove field from box
  const handleRemoveField = (boxId: string, fieldId: string) => {
    pushUndo();
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id === boxId) {
          return { ...box, fields: box.fields.filter((f) => f.id !== fieldId) };
        }
        return box;
      })
    );
  };

  // Update field width
  const handleUpdateFieldWidth = (boxId: string, fieldId: string, width: number) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id === boxId) {
          return {
            ...box,
            fields: box.fields.map((f) =>
              f.id === fieldId ? { ...f, widthColumns: width } : f
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
    } else if (data?.from === "box-field") {
      setActiveDrag({ type: "field", label: "Field" });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Drop custom field into box
    if (activeData?.from === "custom-field" && overData?.boxId) {
      const newField: BoxField = {
        id: nanoid(),
        type: activeData.type,
        label: activeData.fieldLabel || activeData.fieldName,
        widthColumns: 6,
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

      // Only add to template (first box)
      const templateBoxId = boxes[0]?.id;
      if (overData.boxId === templateBoxId) {
        pushUndo();
        setBoxes((prev) =>
          prev.map((box) => {
            if (box.id === templateBoxId) {
              return { ...box, fields: [...box.fields, newField] };
            }
            return box;
          })
        );
      }
    }

    // Reorder fields within box
    if (activeData?.from === "box-field" && active.id !== over.id) {
      pushUndo();
      setBoxes((prev) =>
        prev.map((box) => {
          const oldIndex = box.fields.findIndex((f) => f.id === active.id);
          const newIndex = box.fields.findIndex((f) => f.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            return { ...box, fields: arrayMove(box.fields, oldIndex, newIndex) };
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

          {/* Main Content - Boxes */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {boxes.map((box, index) => (
                <BoxComponent
                  key={box.id}
                  box={box}
                  boxIndex={index}
                  onRemoveBox={() => handleRemoveBox(box.id)}
                  onUpdateBoxTitle={(title) => handleUpdateBoxTitle(box.id, title)}
                  onRemoveField={(fieldId) => handleRemoveField(box.id, fieldId)}
                  onUpdateFieldWidth={(fieldId, width) => handleUpdateFieldWidth(box.id, fieldId, width)}
                  isTemplate={index === 0}
                />
              ))}

              {/* Add Box Button */}
              <button
                onClick={handleAddBox}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-sky-400 hover:text-sky-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Box
              </button>
            </div>
          </main>

          {/* Right Sidebar - Inspector */}
          <div
            className={`flex h-full flex-col border-l border-slate-200 bg-white transition-[width] duration-300 ease-out ${
              isRightSidebarOpen ? "w-72" : "w-0 min-w-0 overflow-hidden"
            }`}
          >
            <div
              className={`flex h-full flex-col ${
                isRightSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
              } transition-opacity duration-200 ${isRightSidebarOpen ? "delay-100" : ""}`}
            >
              <BoxInspectorSidebar
                layoutName={layoutData?.layoutName || ""}
                boxCount={boxes.length}
                templateFieldCount={boxes[0]?.fields.length || 0}
              />
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="flex items-center gap-2 border rounded-sm border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-lg">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-700 truncate">{activeDrag.label}</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
