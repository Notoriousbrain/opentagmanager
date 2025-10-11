import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <DashboardHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
