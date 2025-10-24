"use client";

type Politeness = "polite" | "assertive";

export function LiveRegion(props: {
  message: string | null;
  politeness?: Politeness;
}) {
  const { message, politeness = "polite" } = props;
  return (
    <div aria-live={politeness} aria-atomic="true" className="sr-only">
      {message ?? ""}
    </div>
  );
}
