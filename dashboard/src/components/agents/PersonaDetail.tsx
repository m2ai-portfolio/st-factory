"use client";

import type { AgentDetail } from "@/lib/types";

interface PersonaDetailProps {
  agent: AgentDetail;
}

export function PersonaDetail({ agent }: PersonaDetailProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Identity */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Identity</h3>
        <p className="text-sm text-slate-400">{agent.role}</p>
        {agent.era && (
          <p className="text-xs text-slate-500 mt-1">Era: {agent.era}</p>
        )}
        <p className="text-sm text-slate-300 mt-3 whitespace-pre-line">
          {agent.background}
        </p>
        {agent.notable_works.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-1">Notable Works</p>
            <ul className="text-sm text-slate-400 space-y-0.5">
              {agent.notable_works.map((w) => (
                <li key={w}>&bull; {w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Voice */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Voice</h3>

        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1">Tone</p>
          <div className="flex flex-wrap gap-1">
            {agent.voice_tone.map((t) => (
              <span
                key={t}
                className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1">Phrases</p>
          <ul className="text-sm text-slate-400 space-y-0.5">
            {agent.voice_phrases.slice(0, 5).map((p) => (
              <li key={p} className="italic">
                &ldquo;{p}&rdquo;
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Frameworks */}
      <div className="card">
        <h3 className="text-sm font-medium text-slate-300 mb-2">
          Frameworks ({agent.frameworks.length})
        </h3>
        <div className="space-y-1">
          {agent.frameworks.map((f) => (
            <div key={f} className="text-sm text-slate-400 py-1 border-b border-slate-700/30 last:border-0">
              {f.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      </div>

      {/* Case Studies */}
      {agent.case_studies.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-slate-300 mb-2">
            Case Studies ({agent.case_studies.length})
          </h3>
          <div className="space-y-1">
            {agent.case_studies.map((c) => (
              <div key={c} className="text-sm text-slate-400 py-1 border-b border-slate-700/30 last:border-0">
                {c.replace(/_/g, " ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata — responsive grid */}
      <div className="card col-span-full">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Version</p>
            <p className="text-slate-300">
              {(agent.metadata.version as string) || "\u2014"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Author</p>
            <p className="text-slate-300">
              {(agent.metadata.author as string) || "\u2014"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Created</p>
            <p className="text-slate-300">
              {(agent.metadata.created as string) || "\u2014"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Updated</p>
            <p className="text-slate-300">
              {(agent.metadata.updated as string) || "\u2014"}
            </p>
          </div>
        </div>
        {Array.isArray(agent.metadata.tags) && (
          <div className="mt-3 flex flex-wrap gap-1">
            {(agent.metadata.tags as string[]).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
