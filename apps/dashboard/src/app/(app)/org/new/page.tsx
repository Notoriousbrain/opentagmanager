"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Separator,
} from "@otm/ui";
import { CreateOrgCard } from "@/components/org/create-org-dialog";

export default function NewOrgPage() {
  const router = useRouter();

  return (
    <Card className="border-white/10 text-zinc-100">
      <CardHeader className="flex items-center justify-between gap-4 px-6 pt-6">
        <div>
          <CardTitle className="text-lg">New organization</CardTitle>
          <CardDescription className="text-zinc-400">
            Create an organization to group projects and API keys.
          </CardDescription>
        </div>
        <Button variant="outline" onClick={() => router.push("/org")}>
          Back to orgs
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <Separator className="mb-6 bg-white/10" />
        <CreateOrgCard />
      </CardContent>
    </Card>
  );
}
