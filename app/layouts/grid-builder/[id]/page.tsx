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
import { nanoid } from "nanoid";
import { BuilderNavbar } from "@/app/components/builder/BuilderNavbar";
import type { WorkspaceView } from "@/app/lib/types";

interface GridColumnDef {
  id: string;
  name: string;
  label: string;
  type: string;
  customFieldId?: string;
  lovItems?: any[];
  options?: any[];
  placeholder?: string;
  required?: boolean;
}

interface GridRowData {
  id: string;
  values: Record<string, any>;
}

interface LayoutConfig {
  gridColumns: number;
  columnDefs: GridColumnDef[];
  rows: GridRowData[];
}

interface LayoutData {
  _id: string;
  layoutName: string;
  layoutType: "grid-layout";
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
  tableColumns?: any[];
}

// Draggable Field Card for sidebar
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
      className={`flex items-center gap-2 border rounded-lg px-2 py-2 cursor-grab transition hover:shadow-sm active:cursor-grabbing bg-white border-slate-200 hover:bg-slate-50 ${
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

// Droppable Column Header
function DroppableColumnHeader({
  index,
  columnDef,
  isSelected,
  onSelect,
  onRemove,
}: {
  index: number;
  columnDef: GridColumnDef | null;
  isSelected?: boolean;
  onSelect?: (index: number) => void;
  onRemove: (index: number) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-header-${index}`,
    data: { type: "column-header", index },
  });

  return (
    <th
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(index);
      }}
      className={`border border-slate-200 px-3 py-3 text-left text-sm font-medium min-w-37.5 relative group cursor-pointer transition-colors ${
        isSelected ? "bg-sky-50 border-sky-300 ring-2 ring-inset ring-sky-300" : "hover:bg-slate-50"
      }`}
    >
      {columnDef ? (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className={`font-medium truncate ${isSelected ? "text-sky-700" : "text-slate-700"}`}>
              {columnDef.label}
            </div>
            <div className={`text-xs truncate ${isSelected ? "text-sky-500" : "text-slate-400"}`}>
              {columnDef.type}
              {columnDef.required && <span className="text-red-500 ml-1">*</span>}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className={`p-1 transition-colors shrink-0 ${
              isSelected ? "text-sky-400 hover:text-red-500" : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="text-slate-400 text-center py-2 relative">
           <div className={`absolute inset-0 bg-sky-50 opacity-0 transition-opacity ${isOver ? "opacity-30" : ""}`} />
          <div className="text-xs">Drop field here</div>
          <div className="text-[10px] text-slate-300">Column {index + 1}</div>
        </div>
      )}
    </th>
  );
}

// Field Sidebar Component (Custom Fields Only)
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
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
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

// Inspector Sidebar for Grid Settings
function GridInspectorSidebar({
  layoutName,
  gridColumns,
  columnDefs,
  rowCount,
  selectedColumnIndex,
  onUpdateColumn,
}: {
  layoutName: string;
  gridColumns: number;
  columnDefs: GridColumnDef[];
  rowCount: number;
  selectedColumnIndex: number | null;
  onUpdateColumn: (index: number, updates: Partial<GridColumnDef>) => void;
}) {
  const selectedColumn = selectedColumnIndex !== null ? columnDefs[selectedColumnIndex] : null;

  if (selectedColumnIndex !== null && selectedColumn) {
    return (
      <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Label</label>
            <input
              type="text"
              value={selectedColumn.label}
              onChange={(e) => onUpdateColumn(selectedColumnIndex, { label: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Placeholder */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Placeholder</label>
            <input
              type="text"
              value={selectedColumn.placeholder || ""}
              onChange={(e) => onUpdateColumn(selectedColumnIndex, { placeholder: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter placeholder..."
            />
          </div>
          
          <div className="pt-4 mt-auto">
             <button
               onClick={() => onUpdateColumn(selectedColumnIndex, {})}
             />
          </div>
        </div>
      </aside>
    );
  }

  const definedColumns = columnDefs.filter((c) => c !== null).length;

  return (
    <aside className="w-72 bg-white border-l border-slate-200 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Layout Name</label>
          <div className="text-sm text-slate-700 font-medium">{layoutName}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Total Columns</label>
          <div className="text-sm text-slate-700">{gridColumns}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Defined Columns</label>
          <div className="text-sm text-slate-700">{definedColumns} of {gridColumns}</div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Rows</label>
          <div className="text-sm text-slate-700">{rowCount}</div>
        </div>
      </div>
    </aside>
  );
}

export default function GridLayoutBuilderPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("edit");
  const [undoStack, setUndoStack] = useState<LayoutConfig[]>([]);
  const [redoStack, setRedoStack] = useState<LayoutConfig[]>([]);

  // Grid state
  const [gridColumns, setGridColumns] = useState(5);
  const [columnDefs, setColumnDefs] = useState<(GridColumnDef | null)[]>([]);
  const [rows, setRows] = useState<GridRowData[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDrag, setActiveDrag] = useState<{ type: string; label: string } | null>(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    if (gridColumns > 0 && columnDefs.length !== gridColumns) {
      setColumnDefs(Array(gridColumns).fill(null));
    }
  }, [gridColumns]);

  const handleUpdateColumn = (index: number, updates: Partial<GridColumnDef>) => {
    setColumnDefs((prev) => {
        const newDefs = [...prev];
        if (newDefs[index]) {
            newDefs[index] = { ...newDefs[index]!, ...updates };
        }
        return newDefs;
    });
    setHasUnsavedChanges(true);
  };

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch(`/api/form-layouts/${resolvedParams.id}`);
        const data = await response.json();

        if (data.success) {
          setLayoutData(data.data);
          const config = data.data.layoutConfig || { gridColumns: 5, columnDefs: [], rows: [] };
          setGridColumns(config.gridColumns || 5);
          
          // Initialize columnDefs from saved config
          if (config.columnDefs && config.columnDefs.length > 0) {
            const savedDefs = [...config.columnDefs];
            while (savedDefs.length < (config.gridColumns || 5)) {
              savedDefs.push(null);
            }
            setColumnDefs(savedDefs);
          } else {
            setColumnDefs(Array(config.gridColumns || 5).fill(null));
          }
          
          setRows(config.rows || []);
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

  useEffect(() => {
    if (layoutData) {
      const currentConfig = { gridColumns, columnDefs, rows };
      const originalConfig = layoutData.layoutConfig || { gridColumns: 5, columnDefs: [], rows: [] };
      setHasUnsavedChanges(JSON.stringify(currentConfig) !== JSON.stringify(originalConfig));
    }
  }, [gridColumns, columnDefs, rows, layoutData]);

  const pushUndo = () => {
    setUndoStack((stack) => [...stack.slice(-19), { gridColumns, columnDefs: [...columnDefs] as GridColumnDef[], rows: [...rows] }]);
    setRedoStack([]);
  };

  // Undo
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((stack) => [...stack, { gridColumns, columnDefs: columnDefs.filter((c): c is GridColumnDef => c !== null), rows }]);
    setUndoStack((stack) => stack.slice(0, -1));
    setGridColumns(prev.gridColumns);
    setColumnDefs(prev.columnDefs);
    setRows(prev.rows);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((stack) => [...stack, { gridColumns, columnDefs: columnDefs.filter((c): c is GridColumnDef => c !== null), rows }]);
    setRedoStack((stack) => stack.slice(0, -1));
    setGridColumns(next.gridColumns);
    setColumnDefs(next.columnDefs);
    setRows(next.rows);
  };

  // Add row with the current column structure
  const handleAddRow = () => {
    pushUndo();
    const newRow: GridRowData = {
      id: nanoid(),
      values: {},
    };
    // Initialize values for each defined column
    columnDefs.forEach((col) => {
      if (col) {
        newRow.values[col.name] = "";
      }
    });
    setRows((prev) => [...prev, newRow]);
  };

  // Delete row
  const handleDeleteRow = (rowId: string) => {
    pushUndo();
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };
 
  // Handle drag start
  const handleDragStart = (event: any) => {
    const data = event.active.data.current;
    if (data?.from === "custom-field") {
      setActiveDrag({ type: data.type, label: data.fieldLabel || "Field" });
    }
  };

  // Handle drag end - drop onto column header
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Drop custom field onto column header
    if (activeData?.from === "custom-field" && overData?.type === "column-header") {
      const index = overData.index;
      
      pushUndo();

      const newColumnDef: GridColumnDef = {
        id: nanoid(),
        name: activeData.fieldName || `col_${index}`,
        label: activeData.fieldLabel || activeData.fieldName,
        type: activeData.type,
        customFieldId: activeData.customFieldId,
        lovItems: activeData.lovItems,
      };

      // Convert LOV items to options if present
      if (activeData.lovItems && activeData.lovItems.length > 0) {
        newColumnDef.options = activeData.lovItems
          .filter((item: any) => item.status === "Active")
          .map((item: any) => ({
            value: item.code,
            label: item.shortName,
          }));
      }

      setColumnDefs((prev) => {
        const newDefs = [...prev];
        newDefs[index] = newColumnDef;
        return newDefs;
      });
      // Auto select the new column
      setSelectedColumnIndex(index);
    }
  };

  // Save layout - convert to table-compatible format
  const handleSave = async () => {
    if (!layoutData) return;

    setSaving(true);
    try {
      const tableColumns = columnDefs
        .filter((col): col is GridColumnDef => col !== null)
        .map((col) => ({
          name: col.name,
          label: col.label,
          type: col.type as any,
          customFieldId: col.customFieldId,
          options: col.options,
          required: col.required,
          placeholder: col.placeholder,
        }));

      // Create a table field that represents this grid layout
      const gridAsTableField = {
        id: nanoid(),
        type: "table",
        label: layoutData.layoutName,
        name: layoutData.layoutName.toLowerCase().replace(/\s+/g, "_"),
        columns: tableColumns,
        tableRows: rows.map((row) => row.values),
        width: "full",
        widthColumns: 12,
      };

      const response = await fetch(`/api/form-layouts/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [gridAsTableField],
          layoutConfig: { 
            gridColumns, 
            columnDefs: columnDefs.filter((c) => c !== null),
            rows,
          },
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

  // Get column rendering for data rows
  const renderCellContent = (col: GridColumnDef | null, rowValues: Record<string, any>) => {
    if (!col) return null;
    
    const value = rowValues[col.name] || "";
    
    switch (col.type) {
      case "dropdown":
        return (
          <select className="w-full px-2 py-1 text-sm border border-slate-200 rounded bg-white">
            <option value="">Select...</option>
            {col.options?.map((opt: any, i: number) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="space-y-1">
            {col.options?.slice(0, 2).map((opt: any, i: number) => (
              <label key={i} className="flex items-center gap-1 text-xs">
                <input type="checkbox" className="rounded" />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-1">
            {col.options?.slice(0, 2).map((opt: any, i: number) => (
              <label key={i} className="flex items-center gap-1 text-xs">
                <input type="radio" name={`${col.name}`} />
                {opt.label}
              </label>
            ))}
          </div>
        );
      case "date":
        return <input type="date" className="w-full px-2 py-1 text-sm border border-slate-200 rounded" />;
      case "number":
        return <input type="number" className="w-full px-2 py-1 text-sm border border-slate-200 rounded" placeholder="0" />;
      case "email":
        return <input type="email" className="w-full px-2 py-1 text-sm border border-slate-200 rounded" placeholder="Email" />;
      case "textarea":
        return <textarea className="w-full px-2 py-1 text-sm border border-slate-200 rounded resize-none" rows={2} />;
      default:
        return <input type="text" className="w-full px-2 py-1 text-sm border border-slate-200 rounded" placeholder={col.placeholder || col.label} />;
    }
  };

  // Remove column definition
  const handleRemoveColumnDef = (index: number) => {
    pushUndo();
    setColumnDefs((prev) => {
      const newDefs = [...prev];
      newDefs[index] = null;
      return newDefs;
    });
    if (selectedColumnIndex === index) {
        setSelectedColumnIndex(null);
    }
  };



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

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6" onClick={() => setSelectedColumnIndex(null)}>
            <div 
                className="bg-white shadow-sm border border-slate-200 p-6 min-h-full"
            >

              <div className="overflow-x-auto border border-slate-200">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-r border-slate-200 px-3 py-3 text-left text-sm font-medium text-slate-600 bg-slate-100 w-20">
                        Actions
                      </th>
                      {Array.from({ length: gridColumns }, (_, i) => (
                        <DroppableColumnHeader
                          key={i}
                          index={i}
                          columnDef={columnDefs[i] || null}
                          isSelected={selectedColumnIndex === i}
                          onSelect={setSelectedColumnIndex}
                          onRemove={handleRemoveColumnDef}
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={gridColumns + 1}
                          className="border-t border-slate-200 px-6 py-3 text-center text-slate-400"
                        >
                          <p>No rows.</p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="border-t border-r border-slate-200 p-2 bg-slate-50">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete row"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                              </button>
                            </div>
                          </td>
                          {columnDefs.map((col, colIdx) => (
                            <td
                              key={colIdx}
                              className="border-t border-slate-200 p-2 min-w-37.5"
                            >
                              {col ? (
                                renderCellContent(col, row.values)
                              ) : (
                                <div className="text-xs text-slate-300 text-center">-</div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Row Button */}
              <button
                onClick={handleAddRow}
                disabled={!columnDefs.some((c) => c !== null)}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            </div>
          </main>

          {/* Right Sidebar */}
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
              <GridInspectorSidebar
                layoutName={layoutData?.layoutName || ""}
                gridColumns={gridColumns}
                columnDefs={columnDefs.filter((c): c is GridColumnDef => c !== null)}
                rowCount={rows.length}
                selectedColumnIndex={selectedColumnIndex}
                onUpdateColumn={handleUpdateColumn}
              />
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="flex items-center gap-2 border rounded-lg border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-lg">
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
