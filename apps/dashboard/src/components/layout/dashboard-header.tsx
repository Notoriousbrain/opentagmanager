"use client";

import { useRouter } from "next/navigation";
import { useOrgStore } from "@/store/org";
import { Button, Separator } from "@otm/ui";
import Image from "next/image";

export function DashboardHeader() {
  const router = useRouter();
  const { orgs, activeOrgId, reset } = useOrgStore();

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;

  const switchOrg = () => {
    reset();
    router.push("/org");
  };

  const goHome = () => router.push("/dashboard");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={goHome}
          className="text-sm font-semibold tracking-widest text-zinc-100 hover:text-white"
        >
          <Image src="/logo.svg" alt="OSS Tag" width={100} height={100} />
        </button>
        <Separator orientation="vertical" className="h-4 bg-white/10" />
        {activeOrg ? (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>{activeOrg.name}</span>
            <span className="text-xs text-zinc-500">({activeOrg.role})</span>
          </div>
        ) : (
          <span className="text-sm text-zinc-500">No org selected</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {activeOrg && (
          <Button
            variant="outline"
            className="rounded-md py-2 border-white/20 text-zinc-100 hover:bg-white/5"
            onClick={switchOrg}
          >
            Switch org
          </Button>
        )}

        <div className="rounded-md py-2 border border-white/20 px-3 text-xs text-zinc-400">
          you@otm.dev
        </div>
      </div>
    </header>
  );
}
