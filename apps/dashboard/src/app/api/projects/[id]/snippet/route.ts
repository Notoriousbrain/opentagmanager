export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@otm/auth";
import { assertProjectRole } from "@otm/api";
import { getClientUrl } from "@otm/env/utils";

export async function GET(req: Request) {
  // Auth (server-side)
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  // Extract :id from the pathname to avoid the typed ctx param
  // Example path: /api/projects/<id>/snippet
  const pathname = new URL(req.url).pathname;
  const match = pathname.match(/\/api\/projects\/([^/]+)\/snippet$/);
  const projectId = match?.[1];
  if (!projectId) return new NextResponse("Bad Request", { status: 400 });

  // RBAC
  await assertProjectRole({ session }, projectId, [
    "viewer",
    "editor",
    "admin",
    "owner",
  ]);

  const ingestUrl = `${getClientUrl()}/api/ingest`;

  const js = `
const ATTR = 'data-key';
const selfScript = document.currentScript || document.querySelector('script[src*="/api/projects/${projectId}/snippet"]');
const PUBLIC_KEY = selfScript?.getAttribute(ATTR);
if (!PUBLIC_KEY) {
  console.warn('[OSSTag] Missing public key. Add ' + ATTR + ' to the snippet script tag.');
}

const q = [];
let flushing = false;

function flush() {
  if (flushing || q.length === 0 || !PUBLIC_KEY) return;
  flushing = true;
  const batch = q.splice(0, q.length);
  fetch(${JSON.stringify(ingestUrl)}, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ key: PUBLIC_KEY, events: batch })
  }).catch(()=>{}).finally(()=>{ flushing = false; });
}

function push(ev){ q.push(ev); if(q.length>=10) flush(); }

export const osstag = {
  track(type, props){
    push({ type, ts: Date.now(), props: props||{} });
  },
  flush
};

window.osstag = osstag;

// Auto page_view + flush on hide
osstag.track('page_view', { path: location.pathname, title: document.title });
addEventListener('visibilitychange', ()=> { if(document.visibilityState==='hidden') flush(); });
`.trim();

  return new NextResponse(js, {
    status: 200,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
