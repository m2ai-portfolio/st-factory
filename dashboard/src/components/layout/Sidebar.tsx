"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "◈" },
  { href: "/ecosystem", label: "3D View", icon: "◎" },
  { href: "/agents", label: "Agents", icon: "◉" },
  { href: "/pipeline", label: "Pipeline", icon: "◆" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`w-56 h-screen bg-surface border-r border-slate-700/50 flex flex-col fixed left-0 top-0 z-20 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="px-4 py-5 border-b border-slate-700/50">
          <h1 className="text-lg font-semibold text-slate-100">Snow-Town</h1>
          <p className="text-xs text-slate-500 mt-0.5">Ecosystem Dashboard</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={`sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-slate-700/50 text-xs text-slate-600">
          v0.1.0
        </div>
      </aside>
    </>
  );
}
