"use client";

import { useState } from "react";
import type { FormTemplate } from "../../lib/form";

export function TemplatesSidebar({
  templates,
  onSelect,
  collapsed = false,
}: {
  templates: FormTemplate[];
  onSelect: (template: FormTemplate) => void;
  collapsed?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"templates" | "saved">("templates");
  const [selectedId, setSelectedId] = useState<string>("blank");

  const handleSelect = (template: FormTemplate) => {
    setSelectedId(template.id);
    onSelect(template);
  };

  return (
    <aside
      className={`flex h-full flex-col bg-white transition-[width] duration-300 ease-out ${
        collapsed
          ? "w-0 min-w-0 overflow-hidden border-r border-transparent"
          : "w-52 border-r border-slate-200"
      }`}
    >
      <div
        className={`flex h-full flex-col ${
          collapsed ? "pointer-events-none opacity-0" : "opacity-100"
        } transition-opacity duration-200 ${collapsed ? "" : "delay-100"}`}
      >
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex-1 px-3 py-3 text-sm font-medium transition ${
              activeTab === "templates"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 px-3 py-3 text-sm font-medium transition ${
              activeTab === "saved"
                ? "border-b-2 border-sky-500 text-sky-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Saved
          </button>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === "templates" ? (
            <div className="space-y-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left transition ${
                    selectedId === template.id
                      ? "bg-sky-500 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      selectedId === template.id ? "text-sky-100" : "text-slate-500"
                    }`}
                  >
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 bg-slate-100 p-3">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">No saved forms yet</p>
              <p className="text-xs text-slate-400 mt-1">Your saved forms will appear here</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
