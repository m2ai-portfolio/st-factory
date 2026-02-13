"use client";

import { useEcosystem } from "@/hooks/useEcosystem";
import { StatusBadge } from "./StatusBadge";
import { useSidebar } from "./SidebarContext";

export function Header() {
  const { data } = useEcosystem();
  const { toggle } = useSidebar();

  return (
    <header className="h-12 bg-surface border-b border-slate-700/50 flex items-center justify-between px-6 fixed top-0 lg:left-56 left-0 right-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="lg:hidden text-slate-400 hover:text-slate-100 -ml-2 p-2"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm text-slate-400">Feedback Loop</span>
        {data && <StatusBadge status={data.loop_health} />}
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        {data && <span>Cycles: {data.cycle_count}</span>}
      </div>
    </header>
  );
}
