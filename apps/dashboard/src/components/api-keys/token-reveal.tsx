"use client";

import { useState } from "react";
import { Input, Button } from "@otm/ui";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

function maskToken(token: string, keepStart = 6, keepEnd = 4): string {
  if (token.length <= keepStart + keepEnd) return token;
  const start = token.slice(0, keepStart);
  const end = token.slice(-keepEnd);
  const middleLen = token.length - keepStart - keepEnd;
  return `${start}${"•".repeat(middleLen)}${end}`;
}

export function TokenReveal(props: {
  token: string;
  onDone: () => void;
  onCopySuccess?: () => void;
  onCopyError?: (message: string) => void;
}) {
  const { token, onDone, onCopySuccess, onCopyError } = props;
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 1200);
      onCopySuccess?.();
    } catch {
      const msg = "Failed to copy. Select & ⌘/Ctrl+C instead.";
      setCopyError(msg);
      onCopyError?.(msg);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="mb-2 text-sm text-emerald-300">
        Save this token now — you won’t be able to see it again.
      </div>

      <div className="relative">
        <Input
          readOnly
          value={revealed ? token : maskToken(token)}
          className="h-10 w-full rounded-lg border-white/20 bg-zinc-900/50 pl-3 pr-20 font-mono text-xs tracking-wider text-zinc-100"
        />
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "Hide token" : "Reveal token"}
          className="absolute right-12 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-transparent text-zinc-200 hover:bg-white/5"
        >
          {revealed ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </button>
        <button
          type="button"
          onClick={copyToken}
          aria-label="Copy token"
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-white/15 bg-transparent text-zinc-200 hover:bg-white/5"
        >
          {copied ? (
            <Check className="size-4 text-emerald-400" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>

      {copyError && (
        <div className="mt-2 text-xs text-red-300" role="alert">
          {copyError}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button className="rounded-lg bg-black" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
