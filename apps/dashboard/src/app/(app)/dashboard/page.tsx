import { ProjectsPanel } from "@/components/projects/projects-panel";

export default function DashboardPage() {
  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <ProjectsPanel />
      </div>
    </main>
  );
}
