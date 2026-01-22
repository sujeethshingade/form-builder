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
  useDraggable,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { BuilderNavbar } from "@/app/components/builder/BuilderNavbar";
import { LayoutCanvas } from "@/app/components/canvas/LayoutCanvas";
import { LayoutField } from "@/app/components/canvas/LayoutCanvasCard";
import { LayoutFieldInspector } from "@/app/components/element/LayoutFieldInspector";

interface FormGroup {
  id: string;
  name: string;
  subtitle?: string;
  icon?: string;
  status?: "completed" | "in-progress" | "pending";
  fields: LayoutField[];
  subgroups?: { id: string; name: string }[];
}

interface LayoutConfig {
  groups: FormGroup[];
}

interface LayoutData {
  _id: string;
  layoutName: string;
  layoutType: "form-group";
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

interface FormLayoutData {
  _id: string;
  layoutName: string;
  layoutType: "grid-layout" | "box-layout";
  category?: string;
  fields?: any[];
  layoutConfig?: any;
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

// Draggable Layout Card
function DraggableLayoutCard({ layout }: { layout: FormLayoutData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `layout-${layout._id}`,
    data: {
      from: "layout",
      layoutId: layout._id,
      layoutType: layout.layoutType,
      layoutName: layout.layoutName,
      fields: layout.fields || [],
      layoutConfig: layout.layoutConfig,
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
        <div className="text-sm font-medium text-slate-700 truncate">{layout.layoutName}</div>
        <div className="text-xs text-slate-400 truncate">
          {layout.layoutType === "grid-layout" ? "Grid Layout" : "Box Layout"}
        </div>
      </div>
    </div>
  );
}

// Field Sidebar Component
function FieldSidebar({
  customFields,
  formLayouts,
  searchTerm,
  onSearchChange,
}: {
  customFields: CustomFieldData[];
  formLayouts: FormLayoutData[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"fields" | "layouts">("fields");
  
  const filteredFields = customFields.filter(
    (field) =>
      field.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      field.fieldName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLayouts = formLayouts.filter((layout) =>
    layout.layoutName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white flex flex-col h-full border-r border-slate-200">
      {/* Tabs - matching builder style */}
      <div className="border-b border-gray-200 px-2 py-2 flex gap-1">
        <button
          onClick={() => setActiveTab("fields")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "fields"
              ? "bg-sky-100 text-sky-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Fields
        </button>
        <button
          onClick={() => setActiveTab("layouts")}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === "layouts"
              ? "bg-sky-100 text-sky-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Layouts
        </button>
      </div>

      {/* Search inside tab */}
      <div className="p-3">
        <input
          type="text"
          placeholder={activeTab === "fields" ? "Search fields..." : "Search layouts..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "fields" ? (
          <div className="space-y-2">
            {filteredFields.map((field) => (
              <DraggableFieldCard key={field._id} field={field} />
            ))}
            {filteredFields.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-slate-500">No fields found</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLayouts.map((layout) => (
              <DraggableLayoutCard key={layout._id} layout={layout} />
            ))}
            {filteredLayouts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-slate-500">No layouts found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

// Group Navigation Item
function GroupNavItem({
  group,
  isActive,
  onClick,
  onDelete,
}: {
  group: FormGroup;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
        isActive
          ? "bg-white border-r-2 border-sky-500"
          : "hover:bg-slate-100"
      }`}
    >
      <span className="flex-1 text-sm text-slate-700 truncate">{group.name}</span>
      <span className="text-xs text-slate-400">{group.fields.length}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Group Inspector Sidebar
function GroupInspectorSidebar({
  activeGroup,
  onUpdateGroupName,
  onUpdateGroupSubtitle,
}: {
  activeGroup: FormGroup | null;
  onUpdateGroupName: (name: string) => void;
  onUpdateGroupSubtitle: (subtitle: string) => void;
}) {
  if (!activeGroup) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="mb-4 p-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700">No group selected</p>
        <p className="mt-2 text-xs text-slate-500">
          Select a group to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Group Name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Name</label>
          <input
            type="text"
            value={activeGroup.name}
            onChange={(e) => onUpdateGroupName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            placeholder="Group name"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Subtitle</label>
          <input
            type="text"
            value={activeGroup.subtitle || ""}
            onChange={(e) => onUpdateGroupSubtitle(e.target.value)}
            placeholder="Subtitle"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

export default function FormGroupBuilderPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [undoStack, setUndoStack] = useState<FormGroup[][]>([]);
  const [redoStack, setRedoStack] = useState<FormGroup[][]>([]);

  const [groups, setGroups] = useState<FormGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<"group" | "field">("group");
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [formLayouts, setFormLayouts] = useState<FormLayoutData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrag, setActiveDrag] = useState<{ type: string; label: string } | null>(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const activeGroup = groups.find((g) => g.id === activeGroupId);
  const selectedField = activeGroup?.fields.find((f) => f.id === selectedFieldId) || null;

  // Fetch layout data
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(`/api/form-layouts/${resolvedParams.id}`);
        const data = await response.json();

        if (data.success) {
          setLayoutData(data.data);
          const config = data.data.layoutConfig || {
            groups: [{ id: "group-1", name: "Group 1", fields: [] }],
          };
          setGroups(config.groups || [{ id: "group-1", name: "Group 1", fields: [] }]);
          if (config.groups && config.groups.length > 0) {
            setActiveGroupId(config.groups[0].id);
          }
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

  // Fetch custom fields and layouts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fieldsRes, layoutsRes] = await Promise.all([
          fetch("/api/custom-fields"),
          fetch("/api/form-layouts?type=grid-layout"),
        ]);

        const fieldsData = await fieldsRes.json();
        const layoutsData = await layoutsRes.json();

        if (fieldsData.success) {
          setCustomFields(fieldsData.data);
        }
        if (layoutsData.success) {
          // Also fetch box layouts
          const boxLayoutsRes = await fetch("/api/form-layouts?type=box-layout");
          const boxLayoutsData = await boxLayoutsRes.json();
          const allLayouts = [
            ...layoutsData.data,
            ...(boxLayoutsData.success ? boxLayoutsData.data : []),
          ].filter((l: FormLayoutData) => l._id !== resolvedParams.id);
          setFormLayouts(allLayouts);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [resolvedParams.id]);

  // Track changes
  useEffect(() => {
    if (layoutData) {
      const currentConfig = { groups };
      const originalConfig = layoutData.layoutConfig || { groups: [] };
      setHasUnsavedChanges(JSON.stringify(currentConfig) !== JSON.stringify(originalConfig));
    }
  }, [groups, layoutData]);

  // Push to undo stack
  const pushUndo = () => {
    setUndoStack((stack) => [...stack.slice(-19), JSON.parse(JSON.stringify(groups))]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, JSON.parse(JSON.stringify(groups))]);
    setUndoStack((stack) => stack.slice(0, -1));
    setGroups(prev);
    setSelectedFieldId(null);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, JSON.parse(JSON.stringify(groups))]);
    setRedoStack((stack) => stack.slice(0, -1));
    setGroups(next);
    setSelectedFieldId(null);
  };

  // Add new group
  const handleAddGroup = () => {
    if (!newGroupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    pushUndo();
    const newGroup: FormGroup = {
      id: nanoid(),
      name: newGroupName.trim(),
      status: "pending",
      fields: [],
    };

    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
    setNewGroupName("");
    setShowAddGroupModal(false);
  };

  // Delete group
  const handleDeleteGroup = (groupId: string) => {
    if (groups.length <= 1) {
      alert("You must have at least one group");
      return;
    }
    if (!confirm("Are you sure you want to delete this group?")) return;

    pushUndo();
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (activeGroupId === groupId) {
      setActiveGroupId(groups.find((g) => g.id !== groupId)?.id || null);
    }
    setSelectedFieldId(null);
  };

  // Update group name
  const handleUpdateGroupName = (name: string) => {
    if (!activeGroupId) return;
    setGroups((prev) =>
      prev.map((g) => (g.id === activeGroupId ? { ...g, name } : g))
    );
  };

  // Update group subtitle
  const handleUpdateGroupSubtitle = (subtitle: string) => {
    if (!activeGroupId) return;
    setGroups((prev) =>
      prev.map((g) => (g.id === activeGroupId ? { ...g, subtitle } : g))
    );
  };

  // Field operations
  const handleDeleteField = (fieldId: string) => {
    if (!activeGroupId) return;
    pushUndo();
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeGroupId) {
          return { ...group, fields: group.fields.filter((f) => f.id !== fieldId) };
        }
        return group;
      })
    );
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
      setInspectorMode("group");
    }
  };

  const handleDuplicateField = (fieldId: string) => {
    if (!activeGroupId || !activeGroup) return;
    const fieldIndex = activeGroup.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    pushUndo();
    const fieldToDuplicate = activeGroup.fields[fieldIndex];
    const duplicatedField = { ...fieldToDuplicate, id: nanoid() };

    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeGroupId) {
          const newFields = [...group.fields];
          newFields.splice(fieldIndex + 1, 0, duplicatedField);
          return { ...group, fields: newFields };
        }
        return group;
      })
    );
    setSelectedFieldId(duplicatedField.id);
    setInspectorMode("field");
  };

  const handleMoveFieldUp = (fieldId: string) => {
    if (!activeGroupId || !activeGroup) return;
    const fieldIndex = activeGroup.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex <= 0) return;

    pushUndo();
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeGroupId) {
          return { ...group, fields: arrayMove(group.fields, fieldIndex, fieldIndex - 1) };
        }
        return group;
      })
    );
  };

  const handleMoveFieldDown = (fieldId: string) => {
    if (!activeGroupId || !activeGroup) return;
    const fieldIndex = activeGroup.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1 || fieldIndex >= activeGroup.fields.length - 1) return;

    pushUndo();
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeGroupId) {
          return { ...group, fields: arrayMove(group.fields, fieldIndex, fieldIndex + 1) };
        }
        return group;
      })
    );
  };

  const handleUpdateField = (updates: Partial<LayoutField>) => {
    if (!activeGroupId || !selectedFieldId) return;
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeGroupId) {
          return {
            ...group,
            fields: group.fields.map((f) =>
              f.id === selectedFieldId ? { ...f, ...updates } : f
            ),
          };
        }
        return group;
      })
    );
  };

  // Handle adding a new box instance to a box layout field
  const handleAddBoxInstance = (fieldId: string) => {
    if (!activeGroupId) return;
    
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeGroupId) {
          return {
            ...group,
            fields: group.fields.map((f) => {
              if (f.id === fieldId && f.layoutConfig?.boxes) {
                const templateBox = f.layoutConfig.boxes[0];
                if (templateBox) {
                  const newBox = {
                    id: nanoid(),
                    title: `${templateBox.title || 'Box'} ${f.layoutConfig.boxes.length + 1}`,
                    fields: templateBox.fields.map((field: any) => ({ ...field, id: nanoid() })),
                  };
                  return {
                    ...f,
                    layoutConfig: {
                      ...f.layoutConfig,
                      boxes: [...f.layoutConfig.boxes, newBox],
                    },
                  };
                }
              }
              return f;
            }),
          };
        }
        return group;
      })
    );
  };

  // Handle field selection
  const handleSelectField = (fieldId: string | null) => {
    setSelectedFieldId(fieldId);
    setInspectorMode(fieldId ? "field" : "group");
  };

  // Handle drag start
  const handleDragStart = (event: any) => {
    const data = event.active.data.current;
    if (data?.from === "custom-field") {
      setActiveDrag({ type: data.type, label: data.fieldLabel || "Field" });
    } else if (data?.from === "layout") {
      setActiveDrag({ type: data.layoutType, label: data.layoutName || "Layout" });
    } else if (data?.from === "canvas-field") {
      setActiveDrag({ type: "field", label: "Field" });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over || !activeGroupId) return;

    const activeData = active.data.current;

    // Drop custom field into group
    if (activeData?.from === "custom-field") {
      pushUndo();
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

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === activeGroupId) {
            return { ...group, fields: [...group.fields, newField] };
          }
          return group;
        })
      );
      setSelectedFieldId(newField.id);
      setInspectorMode("field");
    }

    if (activeData?.from === "layout") {
      pushUndo();
      
      const layoutFields = activeData?.fields;
      
      if (layoutFields && Array.isArray(layoutFields) && layoutFields.length > 0) {
      const newFields: LayoutField[] = layoutFields.map((field: any) => ({
        ...field, 
        id: nanoid(),
        widthColumns: field.widthColumns || 12,
      }));

        setGroups((prev) =>
          prev.map((group) => {
            if (group.id === activeGroupId) {
              return { ...group, fields: [...group.fields, ...newFields] };
            }
            return group;
          })
        );
        
        if (newFields.length > 0) {
          setSelectedFieldId(newFields[0].id);
          setInspectorMode("field");
        }
      } else {
        const newField: LayoutField = {
          id: nanoid(),
          type: activeData.layoutType,
          label: activeData.layoutName,
          widthColumns: 12,
          isLayout: true,
          layoutType: activeData.layoutType,
          layoutId: activeData.layoutId,
          layoutConfig: activeData.layoutConfig,
        };

        setGroups((prev) =>
          prev.map((group) => {
            if (group.id === activeGroupId) {
              return { ...group, fields: [...group.fields, newField] };
            }
            return group;
          })
        );
        setSelectedFieldId(newField.id);
        setInspectorMode("field");
      }
    }

    if (activeData?.from === "canvas-field" && active.id !== over.id) {
      pushUndo();
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === activeGroupId) {
            const oldIndex = group.fields.findIndex((f) => f.id === active.id);
            const newIndex = group.fields.findIndex((f) => f.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
              return { ...group, fields: arrayMove(group.fields, oldIndex, newIndex) };
            }
          }
          return group;
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
          layoutConfig: { groups },
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
          {/* Left Sidebar - Custom Fields & Layouts */}
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
                formLayouts={formLayouts}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            </div>
          </div>

          {/* Group Navigation */}
          <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Groups</h3>
              <button
                onClick={() => setShowAddGroupModal(true)}
                className="p-1.5 text-sky-600 hover:bg-sky-50 rounded transition-colors"
                title="Add Group"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {groups.map((group) => (
                <GroupNavItem
                  key={group.id}
                  group={group}
                  isActive={activeGroupId === group.id}
                  onClick={() => {
                    setActiveGroupId(group.id);
                    setSelectedFieldId(null);
                    setInspectorMode("group");
                  }}
                  onDelete={() => handleDeleteGroup(group.id)}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-slate-100">
            <div className="max-w-5xl mx-auto">
              {/* Canvas */}
              {activeGroup && (
                <LayoutCanvas
                  fields={activeGroup.fields}
                  selectedId={selectedFieldId}
                  onSelect={handleSelectField}
                  onDelete={handleDeleteField}
                  onDuplicate={handleDuplicateField}
                  onMoveUp={handleMoveFieldUp}
                  onMoveDown={handleMoveFieldDown}
                  onAddBox={handleAddBoxInstance}
                  droppableId={`group-${activeGroup.id}`}
                  emptyMessage=""
                />
              )}
            </div>
          </main>

          {/* Right Sidebar - Inspector */}
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
              {/* Mode Tabs - matching builder style */}
              <div className="border-b border-gray-200 px-2 py-2 flex gap-1">
                <button
                  onClick={() => setInspectorMode("group")}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    inspectorMode === "group"
                      ? "bg-sky-100 text-sky-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Group
                </button>
                <button
                  onClick={() => setInspectorMode("field")}
                  disabled={!selectedField}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    inspectorMode === "field"
                      ? "bg-sky-100 text-sky-700"
                      : "text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                  }`}
                >
                  Field
                </button>
              </div>

              {inspectorMode === "group" ? (
                <GroupInspectorSidebar
                  activeGroup={activeGroup || null}
                  onUpdateGroupName={handleUpdateGroupName}
                  onUpdateGroupSubtitle={handleUpdateGroupSubtitle}
                />
              ) : (
                <LayoutFieldInspector
                  field={selectedField}
                  onUpdate={handleUpdateField}
                  onClose={() => {
                    setSelectedFieldId(null);
                    setInspectorMode("group");
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Add Group Modal */}
        {showAddGroupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New Group</h3>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGroup();
                  if (e.key === "Escape") setShowAddGroupModal(false);
                }}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddGroupModal(false);
                    setNewGroupName("");
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGroup}
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  Add Group
                </button>
              </div>
            </div>
          </div>
        )}

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
