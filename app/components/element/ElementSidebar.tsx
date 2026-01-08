"use client";

import { useState, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { ElementDefinition, TemplateData, FormField } from "../../lib/types";
import { elements } from "../../lib/elements";

function ElementCard({ element }: { element: ElementDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${element.type}`,
    data: { from: "palette", type: element.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-2 border rounded-sm border-slate-200 bg-white px-2 py-1.5 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
        {element.icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-700 truncate">{element.label}</div>
      </div>
    </div>
  );
}

function ElementIconCard({ element }: { element: ElementDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${element.type}`,
    data: { from: "palette", type: element.type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={element.label}
      className={`flex items-center justify-center border rounded-sm border-slate-200 bg-white py-1.5 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center text-slate-600 shrink-0">
        {element.icon}
      </div>
    </div>
  );
}

function TemplateCard({ template, onDragStart }: { template: TemplateData; onDragStart?: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${template._id}`,
    data: { from: "template", templateId: template._id, fields: template.fields },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`flex flex-col border rounded-sm border-slate-200 bg-white px-2 py-2 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center text-sky-500 shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-700 truncate">{template.name}</div>
          <div className="text-xs text-slate-500">{template.fields.length} fields</div>
        </div>
      </div>
    </div>
  );
}

function TemplateIconCard({ template }: { template: TemplateData }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `template-${template._id}`,
    data: { from: "template", templateId: template._id, fields: template.fields },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={`${template.name} (${template.fields.length} fields)`}
      className={`flex items-center justify-center border rounded-sm border-slate-200 bg-white py-1.5 cursor-grab transition hover:border-sky-300 hover:bg-sky-50 hover:shadow-sm active:cursor-grabbing ${
        isDragging ? "opacity-50 border-sky-400 shadow-md" : ""
      }`}
    >
      <div className="flex h-9 w-9 items-center justify-center text-sky-500 shrink-0">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
    </div>
  );
}

type SidebarMode = "elements" | "templates";

export function ElementSidebar({ 
  collapsed = false,
  formCategory 
}: { 
  collapsed?: boolean;
  formCategory?: string;
}) {
  const [mode, setMode] = useState<SidebarMode>("elements");
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const categoryParam = selectedCategory ? `?category=${encodeURIComponent(selectedCategory)}` : "";
        const response = await fetch(`/api/templates${categoryParam}`);
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoading(false);
      }
    };

    if (mode === "templates") {
      fetchTemplates();
    }
  }, [mode, selectedCategory]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/templates/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // Auto-select form category if provided
  useEffect(() => {
    if (formCategory && categories.includes(formCategory)) {
      setSelectedCategory(formCategory);
    }
  }, [formCategory, categories]);

  return (
    <aside
      className={`flex h-full flex-col bg-white transition-[width] duration-300 ease-out ${
        collapsed
          ? "w-16 border-r border-slate-200"
          : "w-52 border-r border-slate-200"
      }`}
    >
      {/* Mode Toggle Tabs */}
      {!collapsed && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setMode("elements")}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              mode === "elements"
                ? "text-sky-600 border-b-2 border-sky-500 bg-sky-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Elements
          </button>
          <button
            onClick={() => setMode("templates")}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              mode === "templates"
                ? "text-sky-600 border-b-2 border-sky-500 bg-sky-50"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Templates
          </button>
        </div>
      )}

      {/* Category Filter for Templates */}
      {!collapsed && mode === "templates" && (
        <div className="p-2 border-b border-slate-200">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-sky-300"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {collapsed ? (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {mode === "elements" ? (
              elements.map((element) => (
                <ElementIconCard key={element.type} element={element} />
              ))
            ) : loading ? (
              <div className="text-center py-4 text-slate-400 text-xs">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">No templates</div>
            ) : (
              templates.map((template) => (
                <TemplateIconCard key={template._id} template={template} />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {mode === "elements" ? (
              elements.map((element) => (
                <ElementCard key={element.type} element={element} />
              ))
            ) : loading ? (
              <div className="text-center py-8 text-slate-400 text-sm">Loading templates...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No templates found.
                <br />
                <span className="text-xs">Create templates from the Forms page.</span>
              </div>
            ) : (
              templates.map((template) => (
                <TemplateCard key={template._id} template={template} />
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
