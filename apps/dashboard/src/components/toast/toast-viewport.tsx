"use client";

import type { Toast } from "./use-toasts";

export function ToastViewport(props: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
      {props.toasts.map((t) => {
        const color =
          t.kind === "success"
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
            : t.kind === "error"
            ? "border-red-400/30 bg-red-400/10 text-red-200"
            : "border-white/20 bg-white/10 text-white";
        return (
          <div
            key={t.id}
            className={`rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur ${color}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <span>{t.message}</span>
              <button
                className="rounded-md border border-white/20 px-2 py-0.5 text-xs hover:bg-white/10"
                onClick={() => props.dismiss(t.id)}
                aria-label="Dismiss"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
