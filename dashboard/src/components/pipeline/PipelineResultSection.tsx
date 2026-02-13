"use client";

import { useState } from "react";

interface PipelineResultSectionProps {
  title: string;
  data: Record<string, unknown> | null;
  defaultOpen?: boolean;
}

export function PipelineResultSection({ title, data, defaultOpen = false }: PipelineResultSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!data) return null;

  return (
    <div className="border border-slate-700/50 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-300 hover:bg-surface-overlay/30 transition-colors rounded-lg"
      >
        <span className="font-medium">{title}</span>
        <span className="text-slate-500">{isOpen ? "▾" : "▸"}</span>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 border-t border-slate-700/30">
          <pre className="text-xs text-slate-400 overflow-x-auto mt-2 whitespace-pre-wrap">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
