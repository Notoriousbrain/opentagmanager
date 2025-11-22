import type { EventProps } from "@otm/types";
import { enqueue } from "./queue";
import { identify as identifyUser } from "./identify";
import { flush } from "./flush";

export interface OsstagAPI {
  track<T extends EventProps>(name: string, props: T): void;
  identify(userId: string): void;
  flush(): Promise<void>;
}

export const api: OsstagAPI = {
  track: enqueue,
  identify: identifyUser,
  flush
};
