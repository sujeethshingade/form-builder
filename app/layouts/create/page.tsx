"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LayoutType = "grid-layout" | "box-layout" | "form-group";

export default function CreateLayoutPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<LayoutType | null>(null);
  const [step, setStep] = useState<"select" | "configure">("select");
  
  // Grid layout config
  const [gridColumns, setGridColumns] = useState(5);
  
  // Form group config
  const [formGroupName, setFormGroupName] = useState("");
  
  // Layout name for all types
  const [layoutName, setLayoutName] = useState("");
  const [category, setCategory] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSelectType = (type: LayoutType) => {
    setSelectedType(type);
    setStep("configure");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedType(null);
    setLayoutName("");
    setCategory("");
    setFormGroupName("");
    setGridColumns(5);
  };

  const handleCreate = async () => {
    if (!layoutName.trim()) {
      alert("Please enter a layout name");
      return;
    }

    if (selectedType === "form-group" && !formGroupName.trim()) {
      alert("Please enter a form group name");
      return;
    }

    setCreating(true);
    try {
      // Build initial fields/structure based on layout type
      let initialFields: any[] = [];
      let layoutConfig: any = {};

      if (selectedType === "grid-layout") {
        // Grid layout with specified columns (+ action column)
        layoutConfig = {
          gridColumns: gridColumns,
          rows: [],
        };
      } else if (selectedType === "box-layout") {
        // Box layout with nested content
        layoutConfig = {
          boxes: [{ id: "box-1", fields: [] }],
        };
      } else if (selectedType === "form-group") {
        // Form group with initial group
        layoutConfig = {
          groups: [
            {
              id: "group-1",
              name: formGroupName.trim(),
              fields: [],
            },
          ],
        };
      }

      const response = await fetch("/api/form-layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutName: layoutName.trim(),
          layoutType: selectedType,
          category: category.trim() || undefined,
          fields: initialFields,
          layoutConfig,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(data.error);
        return;
      }

      // Redirect to the appropriate builder
      if (selectedType === "grid-layout") {
        router.push(`/layouts/grid-builder/${data.data._id}`);
      } else if (selectedType === "box-layout") {
        router.push(`/layouts/box-builder/${data.data._id}`);
      } else {
        router.push(`/layouts/form-group-builder/${data.data._id}`);
      }
    } catch (err) {
      alert("Failed to create layout");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto p-8">
        {step === "select" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grid Layout */}
            <button
              onClick={() => handleSelectType("grid-layout")}
              className="group p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-sky-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Grid Layout</h3>
              <p className="text-sm text-slate-500">
                Create a table-like layout with fixed columns. Add rows dynamically with an action column for row management.
              </p>
            </button>

            {/* Box Layout */}
            <button
              onClick={() => handleSelectType("box-layout")}
              className="group p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-sky-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Box Layout</h3>
              <p className="text-sm text-slate-500">
                Create a flexible container with nested fields. Add multiple instances with a &quot;+ Add&quot; button.
              </p>
            </button>

            {/* Form Group */}
            <button
              onClick={() => handleSelectType("form-group")}
              className="group p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-sky-400 transition-all text-left"
            >
              <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-sky-100 transition-colors">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Form Group</h3>
              <p className="text-sm text-slate-500">
                Create a section with vertical navigation. Group multiple fields and layouts under named tabs.
              </p>
            </button>
          </div>
        )}

        {step === "configure" && selectedType && (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to selection
            </button>

            <div className="space-y-6">
              {/* Layout Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Layout Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder="Enter layout name..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Enter category..."
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>

              {/* Grid Layout Config */}
              {selectedType === "grid-layout" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Columns
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min={1}
                      value={gridColumns}
                      onChange={(e) => setGridColumns(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Form Group Config */}
              {selectedType === "form-group" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Group Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formGroupName}
                    onChange={(e) => setFormGroupName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                  />
                </div>
              )}

              {/* Create Button */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Layout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
