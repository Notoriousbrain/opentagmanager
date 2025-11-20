export async function fetchAllEvents(
  projectId: string,
  filters: Record<string, any>
) {
  const all: any[] = [];
  let cursor: string | undefined = undefined;

  while (true) {
    const url: string =
      `/api/trpc/relay.getEventsByProject?batch=1&input=` +
      encodeURIComponent(
        JSON.stringify({
          0: { json: { projectId, cursor, ...filters } },
        })
      );

    const res: Response = await fetch(url);
    const json: any = await res.json();

    const batch:
      | {
          items: any[];
          nextCursor: string | null;
        }
      | null
      | undefined = json?.[0]?.result?.data?.json;

    if (!batch) break;

    all.push(...batch.items);

    if (!batch.nextCursor) break;
    cursor = batch.nextCursor;

    // small micro-delay to avoid hammering server
    await new Promise((r) => setTimeout(r, 30));
  }

  return all;
}
