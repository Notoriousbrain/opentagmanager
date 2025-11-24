import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";
import { Suspense } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
    <div
      className="bg-black text-zinc-100"
      style={
        {
          ["--header-h"]: "56px",
          ["--sidebar-w"]: "224px",
        } as React.CSSProperties
      }
    >
      <div className="fixed inset-x-0 top-0 z-50 h-(--header-h) bg-black">
        <DashboardHeader />
      </div>

      <div className="fixed left-0 top-(--header-h) z-40 hidden h-[calc(100vh-var(--header-h))] w-(--sidebar-w) border-r border-white/10 bg-black md:block">
        <Sidebar />
      </div>

      <main className="h-screen overflow-y-auto pt-(--header-h) md:pl-(--sidebar-w)">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </main>
    </div>
    </Suspense>
  );
}
