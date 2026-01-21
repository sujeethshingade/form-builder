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

interface GroupField {
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
  // For nested layouts
  isLayout?: boolean;
  layoutType?: "grid-layout" | "box-layout";
  layoutId?: string;
  layoutConfig?: any;
}

interface FormGroup {
  id: string;
  name: string;
  subtitle?: string;
  icon?: string;
  status?: "completed" | "in-progress" | "pending";
  fields: GroupField[];
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

// Draggable Layout Card
function DraggableLayoutCard({ layout }: { layout: FormLayoutData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `layout-${layout._id}`,
    data: {
      from: "layout",
      layoutId: layout._id,
      layoutType: layout.layoutType,
      layoutName: layout.layoutName,
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
        <div className="text-sm font-medium text-slate-700 truncate">{layout.layoutName}</div>
        <div className="text-xs text-slate-400 truncate">
          {layout.layoutType === "grid-layout" ? "Grid Layout" : "Box Layout"}
        </div>
      </div>
    </div>
  );
}

// Sortable Field in Group
function SortableGroupField({
  field,
  onRemove,
  onUpdateWidth,
}: {
  field: GroupField;
  onRemove: () => void;
  onUpdateWidth: (width: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
    data: { from: "group-field", fieldId: field.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${field.widthColumns || 6}`,
  };

  const isLayoutField = field.isLayout;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-md p-3 ${
        isLayoutField
          ? field.layoutType === "grid-layout"
            ? "border-sky-300 bg-sky-50"
            : "border-amber-300 bg-amber-50"
          : "border-slate-200"
      } ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div {...attributes} {...listeners} className="cursor-grab p-1">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isLayoutField && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                field.layoutType === "grid-layout" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"
              }`}>
                {field.layoutType === "grid-layout" ? "Grid" : "Box"}
              </span>
            )}
            <div className="text-sm font-medium text-slate-700 truncate">{field.label}</div>
          </div>
          <div className="text-xs text-slate-400 truncate">{field.type}</div>
        </div>
        <div className="flex items-center gap-1">
          {!isLayoutField && (
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
          )}
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

// Group Content Area
function GroupContent({
  group,
  onRemoveField,
  onUpdateFieldWidth,
}: {
  group: FormGroup;
  onRemoveField: (fieldId: string) => void;
  onUpdateFieldWidth: (fieldId: string, width: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: { groupId: group.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 p-6 min-h-75 ${isOver ? "bg-sky-50" : "bg-white"} transition-colors`}
    >
      {group.fields.length > 0 ? (
        <SortableContext items={group.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-12 gap-3">
            {group.fields.map((field) => (
              <SortableGroupField
                key={field.id}
                field={field}
                onRemove={() => onRemoveField(field.id)}
                onUpdateWidth={(width) => onUpdateFieldWidth(field.id, width)}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          Drag and drop fields or layouts here
        </div>
      )}
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
  const excludedDataTypes = ["heading", "spacer", "divider", "table"];
  const filteredFields = customFields.filter(
    (field) =>
      !excludedDataTypes.includes(field.dataType.toLowerCase()) &&
      (field.fieldLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.fieldName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredLayouts = formLayouts.filter((layout) =>
    layout.layoutName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white flex flex-col h-full border-r border-slate-200">
      <div className="p-3">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {/* Custom Fields */}
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Custom Fields
        </h3>
        <div className="space-y-2 mb-6">
          {filteredFields.map((field) => (
            <DraggableFieldCard key={field._id} field={field} />
          ))}
          {filteredFields.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">No fields found</p>
          )}
        </div>

        {/* Layouts */}
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Layouts
        </h3>
        <div className="space-y-2">
          {filteredLayouts.map((layout) => (
            <DraggableLayoutCard key={layout._id} layout={layout} />
          ))}
          {filteredLayouts.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-2">No layouts found</p>
          )}
        </div>
      </div>
    </aside>
  );
}

// Group Inspector Sidebar
function GroupInspectorSidebar({
  layoutName,
  groupCount,
  activeGroup,
  onUpdateGroupName,
  onUpdateGroupSubtitle,
}: {
  layoutName: string;
  groupCount: number;
  activeGroup: FormGroup | null;
  onUpdateGroupName: (name: string) => void;
  onUpdateGroupSubtitle: (subtitle: string) => void;
}) {
  return (
    <aside className="w-72 bg-white flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Layout Name</label>
          <div className="text-sm text-slate-700">{layoutName}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Total Groups</label>
          <div className="text-sm text-slate-700">{groupCount}</div>
        </div>
        {activeGroup && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Group Name</label>
              <input
                type="text"
                value={activeGroup.name}
                onChange={(e) => onUpdateGroupName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle</label>
              <input
                type="text"
                value={activeGroup.subtitle || ""}
                onChange={(e) => onUpdateGroupSubtitle(e.target.value)}
                placeholder="Optional subtitle"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Fields Count</label>
              <div className="text-sm text-slate-700">{activeGroup.fields.length}</div>
            </div>
          </>
        )}
      </div>
    </aside>
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
    setUndoStack((stack) => [...stack.slice(-19), [...groups]]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, groups]);
    setUndoStack((stack) => stack.slice(0, -1));
    setGroups(prev);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, groups]);
    setRedoStack((stack) => stack.slice(0, -1));
    setGroups(next);
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
  };

  // Update group name
  const handleUpdateGroupName = (groupId: string, name: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, name } : g))
    );
  };

  // Update group subtitle
  const handleUpdateGroupSubtitle = (groupId: string, subtitle: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, subtitle } : g))
    );
  };

  // Remove field from group
  const handleRemoveField = (groupId: string, fieldId: string) => {
    pushUndo();
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return { ...group, fields: group.fields.filter((f) => f.id !== fieldId) };
        }
        return group;
      })
    );
  };

  // Update field width
  const handleUpdateFieldWidth = (groupId: string, fieldId: string, width: number) => {
    setGroups((prev) =>
      prev.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            fields: group.fields.map((f) =>
              f.id === fieldId ? { ...f, widthColumns: width } : f
            ),
          };
        }
        return group;
      })
    );
  };

  // Handle drag start
  const handleDragStart = (event: any) => {
    const data = event.active.data.current;
    if (data?.from === "custom-field") {
      setActiveDrag({ type: data.type, label: data.fieldLabel || "Field" });
    } else if (data?.from === "layout") {
      setActiveDrag({ type: data.layoutType, label: data.layoutName || "Layout" });
    } else if (data?.from === "group-field") {
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

    // Drop custom field into group
    if (activeData?.from === "custom-field" && overData?.groupId) {
      pushUndo();
      const newField: GroupField = {
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

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === overData.groupId) {
            return { ...group, fields: [...group.fields, newField] };
          }
          return group;
        })
      );
    }

    // Drop layout into group
    if (activeData?.from === "layout" && overData?.groupId) {
      pushUndo();
      const newField: GroupField = {
        id: nanoid(),
        type: activeData.layoutType,
        label: activeData.layoutName,
        widthColumns: 12,
        isLayout: true,
        layoutType: activeData.layoutType,
        layoutId: activeData.layoutId,
      };

      setGroups((prev) =>
        prev.map((group) => {
          if (group.id === overData.groupId) {
            return { ...group, fields: [...group.fields, newField] };
          }
          return group;
        })
      );
    }

    // Reorder fields within group
    if (activeData?.from === "group-field" && active.id !== over.id) {
      pushUndo();
      setGroups((prev) =>
        prev.map((group) => {
          const oldIndex = group.fields.findIndex((f) => f.id === active.id);
          const newIndex = group.fields.findIndex((f) => f.id === over.id);
          if (oldIndex !== -1 && newIndex !== -1) {
            return { ...group, fields: arrayMove(group.fields, oldIndex, newIndex) };
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

          {/* Vertical Navigation Bar for Groups */}
          <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-700">Groups</h3>
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
            <div className="flex-1 overflow-y-auto py-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`group flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                    activeGroupId === group.id
                      ? "bg-white border-r-2 border-sky-500"
                      : "hover:bg-slate-100"
                  }`}
                  onClick={() => setActiveGroupId(group.id)}
                >
                  <span className="flex-1 text-sm text-slate-700 truncate">{group.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Group Fields */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-100">
            {activeGroup && (
              <>
                {/* Group Content */}
                <GroupContent
                  group={activeGroup}
                  onRemoveField={(fieldId) => handleRemoveField(activeGroup.id, fieldId)}
                  onUpdateFieldWidth={(fieldId, width) =>
                    handleUpdateFieldWidth(activeGroup.id, fieldId, width)
                  }
                />
              </>
            )}
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
              <GroupInspectorSidebar
                layoutName={layoutData?.layoutName || ""}
                groupCount={groups.length}
                activeGroup={activeGroup || null}
                onUpdateGroupName={(name) => activeGroup && handleUpdateGroupName(activeGroup.id, name)}
                onUpdateGroupSubtitle={(subtitle) => activeGroup && handleUpdateGroupSubtitle(activeGroup.id, subtitle)}
              />
            </div>
          </div>
        </div>

        {/* Add Group Modal */}
        {showAddGroupModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
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
