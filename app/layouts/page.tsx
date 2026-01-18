"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface FormLayoutData {
  _id: string;
  layoutName: string;
  layoutType: "form-group" | "grid-layout" | "box-layout";
  category?: string;
  fields: any[];
  createdAt: string;
  updatedAt: string;
}

export default function LayoutsPage() {
  const router = useRouter();
  const [layouts, setLayouts] = useState<FormLayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");

  const fetchLayouts = useCallback(async () => {
    try {
      const url = filterType
        ? `/api/form-layouts?type=${encodeURIComponent(filterType)}`
        : "/api/form-layouts";
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setLayouts(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch layouts");
    }
  }, [filterType]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchLayouts();
      setLoading(false);
    };
    loadData();
  }, [fetchLayouts]);

  const handleDeleteLayout = async (id: string) => {
    if (!confirm("Are you sure you want to delete this layout?")) return;

    try {
      const response = await fetch(`/api/form-layouts/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchLayouts();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Failed to delete layout");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toISOString().replace("T", " ").slice(0, -5) + "Z";
  };

  const handleLayoutClick = (layoutId: string) => {
    router.push(`/layouts/builder/${layoutId}`);
  };

  const getLayoutTypeLabel = (type: string) => {
    switch (type) {
      case "form-group":
        return "Form Group";
      case "grid-layout":
        return "Grid Layout";
      case "box-layout":
        return "Box Layout";
      default:
        return type;
    }
  };

  const getLayoutTypeBadgeClass = (type: string) => {
    switch (type) {
      case "form-group":
        return "bg-sky-100 text-sky-700";
      case "grid-layout":
        return "bg-emerald-100 text-emerald-700";
      case "box-layout":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-slate-800">Form Layouts</h1>
          </div>
          <div className="flex items-center text-sm gap-3">
            <button
              onClick={() => router.push("/forms")}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Forms
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Filter by Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="form-group">Form Groups</option>
              <option value="grid-layout">Grid Layouts</option>
              <option value="box-layout">Box Layouts</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Layout Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Type</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Category</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Fields</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Created</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">Updated</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : layouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No layouts found. Create layouts from the form builder using &quot;Save as Form Group&quot; or &quot;Save as Grid Layout&quot;.
                  </td>
                </tr>
              ) : (
                layouts.map((layout) => (
                  <tr key={layout._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleLayoutClick(layout._id)}
                        className="text-sm text-sky-600 hover:underline font-medium"
                      >
                        {layout.layoutName}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLayoutTypeBadgeClass(layout.layoutType)}`}>
                        {getLayoutTypeLabel(layout.layoutType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {layout.category || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {layout.fields?.length || 0} fields
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(layout.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(layout.updatedAt)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleLayoutClick(layout._id)}
                        className="px-3 py-1.5 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLayout(layout._id)}
                        className="ml-2 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
