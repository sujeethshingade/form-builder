"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Survey, SurveyModel } from "survey-react-ui";
import "survey-core/defaultV2.min.css";

import { FormCanvas } from "./components/canvas/FormCanvas";
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { LibraryPanel } from "./components/library/LibraryPanel";
import { TopBar } from "./components/navbar/TopBar";
import { fieldToSurveyJSON, library, makeField } from "./lib/form";
import type { FormField, LibraryItem } from "./lib/form";

export default function Home() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeDrag, setActiveDrag] = useState<LibraryItem | FormField | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const selectedField = fields.find((f) => f.id === selectedId) ?? null;

  const surveyJson = useMemo(() => fieldToSurveyJSON(fields), [fields]);
  const surveyModel = useMemo(() => new SurveyModel(surveyJson), [surveyJson]);

  const handleDragStart = (event: any) => {
    const activeType = event?.active?.data?.current?.type;
    const fromCanvas = event?.active?.data?.current?.from === "canvas";

    if (fromCanvas) {
      const field = fields.find((f) => f.id === event.active.id);
      if (field) setActiveDrag(field);
    } else if (activeType) {
      const libItem = library.find((l) => l.type === activeType);
      if (libItem) setActiveDrag(libItem);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const activeData = active?.data?.current;
    const overId = over?.id as string | undefined;

    // Drop from palette
    if (activeData?.from === "palette") {
      const libItem = library.find((l) => l.type === activeData.type);
      if (!libItem) return;

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

    // Reorder inside canvas
    if (activeData?.from === "canvas" && overId && active.id !== overId) {
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
    setFields((prev) =>
      prev.map((f) => (f.id === selectedId ? { ...f, ...patch } : f))
    );
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setFields((prev) => prev.filter((f) => f.id !== selectedId));
    setSelectedId(null);
  };

  const exportString = useMemo(
    () => JSON.stringify(surveyJson, null, 2),
    [surveyJson]
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <TopBar
        onPreview={() => setPreviewOpen(true)}
        onExport={() => setExportOpen(true)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-[260px,1fr,260px] gap-4 px-6 py-6">
          <LibraryPanel items={library} />
          <FormCanvas
            fields={fields}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <InspectorPanel
            selectedField={selectedField}
            onUpdate={handleFieldUpdate}
            onDelete={handleDelete}
          />
        </main>

        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <div className="rounded-2xl border border-sky-200 bg-white px-4 py-3 text-slate-900 shadow-lg">
              {activeDrag.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {previewOpen ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Preview</p>
                <h3 className="text-lg font-semibold text-slate-900">SurveyJS runtime</h3>
              </div>
              <button
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:border-slate-300"
                onClick={() => setPreviewOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-y-auto">
              <Survey model={surveyModel} />
            </div>
          </div>
        </div>
      ) : null}

      {exportOpen ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/60 backdrop-blur">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Export</p>
                <h3 className="text-lg font-semibold text-slate-900">Survey JSON</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:border-slate-300"
                  onClick={() => navigator.clipboard.writeText(exportString)}
                >
                  Copy
                </button>
                <button
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:border-slate-300"
                  onClick={() => setExportOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="max-h-[60vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800">
              {exportString}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
