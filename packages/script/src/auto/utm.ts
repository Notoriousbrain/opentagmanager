export interface UTM {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export function getUTM(): UTM {
  const url = new URL(window.location.href);
  const p = url.searchParams;

  const utm: UTM = {};

  if (p.has("utm_source")) utm.source = p.get("utm_source") ?? undefined;
  if (p.has("utm_medium")) utm.medium = p.get("utm_medium") ?? undefined;
  if (p.has("utm_campaign")) utm.campaign = p.get("utm_campaign") ?? undefined;
  if (p.has("utm_term")) utm.term = p.get("utm_term") ?? undefined;
  if (p.has("utm_content")) utm.content = p.get("utm_content") ?? undefined;

  return utm;
}
