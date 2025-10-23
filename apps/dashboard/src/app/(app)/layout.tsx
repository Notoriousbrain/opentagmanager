import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-black text-zinc-100"
      style={
        {
          ["--header-h"]: "56px",
          ["--sidebar-w"]: "224px",
        } as React.CSSProperties
      }
    >
      <div className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] bg-black">
        <DashboardHeader />
      </div>

      <div className="fixed left-0 top-[var(--header-h)] z-40 hidden h-[calc(100vh-var(--header-h))] w-[var(--sidebar-w)] border-r border-white/10 bg-black md:block">
        <Sidebar />
      </div>

      <main className="h-[100vh] overflow-y-auto pt-[var(--header-h)] md:pl-[var(--sidebar-w)]">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
