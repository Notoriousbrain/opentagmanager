"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Button,
} from "@otm/ui";
import { CreateProjectCard } from "@/components/projects/create-project-dialog";

export default function NewProjectPage() {
  const router = useRouter();

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex items-center justify-between gap-4 px-6 pt-6">
        <div>
          <CardTitle className="text-lg">New project</CardTitle>
          <CardDescription className="text-zinc-400">
            Create a project inside your active organization.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to projects
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <Separator className="mb-6 bg-white/10" />
        <CreateProjectCard />
      </CardContent>
    </Card>
  );
}
