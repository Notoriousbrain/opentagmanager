// apps/dashboard/app/dashboard/projects/[id]/install/page.tsx
import { InstallSnippets } from "@/components/install/install-snippets";
import Link from "next/link";

interface InstallPageProps {
  params: {
    id: string;
  };
}

export default function ProjectInstallPage({ params }: InstallPageProps) {
  const projectId = params.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-neutral-50">
            Install OSSTag
          </h1>
          <p className="text-sm text-neutral-400">
            Use one of the snippets below to connect your site to this project.
          </p>
        </div>

        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-sm text-neutral-400 hover:text-neutral-200 underline-offset-4 hover:underline"
        >
          ← Back to project
        </Link>
      </div>

      <InstallSnippets projectId={projectId} />
    </div>
  );
}
