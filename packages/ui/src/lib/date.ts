
export type DateLike = Date | string | null | undefined;

function toDate(d: DateLike): Date | null {
  if (!d) return null;
  return d instanceof Date ? d : new Date(d);
}

export function formatDateWithRelative(d: DateLike): string {
  const date = toDate(d);
  if (!date || isNaN(date.getTime())) return "—";

  const abs = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

  const nowMs = Date.now();
  const diffSec = Math.round((date.getTime() - nowMs) / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  let value: number;
  let unit: Intl.RelativeTimeFormatUnit;

  if (absSec < 60) {
    value = diffSec;
    unit = "second";
  } else if (absSec < 3600) {
    value = Math.round(diffSec / 60);
    unit = "minute";
  } else if (absSec < 86400) {
    value = Math.round(diffSec / 3600);
    unit = "hour";
  } else if (absSec < 86400 * 30) {
    value = Math.round(diffSec / 86400);
    unit = "day";
  } else if (absSec < 86400 * 365) {
    value = Math.round(diffSec / (86400 * 30));
    unit = "month";
  } else {
    value = Math.round(diffSec / (86400 * 365));
    unit = "year";
  }

  return `${abs} (${rtf.format(value, unit)})`;
}
