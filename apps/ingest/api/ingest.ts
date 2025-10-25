import { relayApp } from "@otm/relay-hono";

export const runtime = "nodejs22.x";

const handler: (req: Request) => Promise<Response> = async (req) => {
  return await relayApp.fetch(req);
};

export default handler;
