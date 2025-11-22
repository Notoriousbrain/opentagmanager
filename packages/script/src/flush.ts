import { getQueue, clearQueue } from "./queue";

export async function flush(): Promise<void> {
  console.debug("[osstag] flush (placeholder)", getQueue());
  clearQueue();
}
