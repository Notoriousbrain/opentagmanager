"use client";

import { useState } from "react";
import type { InstallSnippetKind } from "@/lib/snippets/osstag-snippets";
import { getInstallSnippets } from "@/lib/snippets/osstag-snippets";
import { Button } from "@otm/ui";
import { SendTestEvent } from "./send-test-event";

const TABS: { id: InstallSnippetKind; label: string }[] = [
  { id: "html", label: "HTML <script>" },
  { id: "next", label: "Next.js" },
  { id: "react", label: "React" },
  { id: "vanilla", label: "Vanilla JS" },
];

interface InstallSnippetsProps {
  projectId: string;
}

export function InstallSnippets({ projectId }: InstallSnippetsProps) {
  const [active, setActive] = useState<InstallSnippetKind>("html");
  const snippets = getInstallSnippets(projectId);
  const code = snippets[active];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      console.log("[osstag] snippet copied");
    } catch (err) {
      console.warn("[osstag] failed to copy snippet", err);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`px-3 py-1 text-sm rounded-md border ${
                active === tab.id
                  ? "bg-neutral-900 text-neutral-50 border-neutral-900"
                  : "bg-neutral-900/5 text-neutral-300 border-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button size="sm" onClick={handleCopy}>
          Copy
        </Button>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-950/60">
        <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-neutral-100">
          <code>{code}</code>
        </pre>
      </div>
      <SendTestEvent projectId={projectId} />
    </div>
  );
}
