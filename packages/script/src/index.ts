import { enqueue } from "./queue";
import { identify as identifyUser } from "./identify";
import { flush as internalFlush } from "./flush";
import { bootstrap } from "./bootstrap";

declare global {
  interface Window {
    OSSTag?: any;
  }
}

const g = window as any;

if (!g.OSSTag) {
  g.OSSTag = {
    q: [],
    _ready: false, 
  };
}

const OSSTag = g.OSSTag;

function safe(fn: (...args: any[]) => any) {
  return (...args: any[]) => {
    try {
      fn(...args);
    } catch (err) {
      console.warn("[osstag] error:", err);
    }
  };
}

const track = safe((name: string, props: Record<string, any> = {}) => {
  enqueue(name, props);
});

const identify = safe((userId: string) => {
  identifyUser(userId);
});

const flush = safe(async () => {
  await internalFlush();
});

const init = safe(() => {
  if (OSSTag._ready) return;

  bootstrap();

  OSSTag._ready = true;

  for (const [method, ...args] of OSSTag.q) {
    const fn = (api as any)[method];
    if (typeof fn === "function") {
      try {
        fn(...args);
      } catch {}
    }
  }

  OSSTag.q.length = 0;
});

const api: {
  [key: string]: (...args: any[]) => any;
  init: (...args: any[]) => void;
  track: (...args: any[]) => void;
  identify: (...args: any[]) => void;
  flush: (...args: any[]) => void;
} = {
  init,
  track,
  identify,
  flush,
};

const proxyHandler = {
  get(_: any, key: string) {
    if (key in api) return api[key];

    return (...args: any[]) => {
      if (!OSSTag._ready) {
        OSSTag.q.push([key, ...args]);
      } else if (api[key]) {
        (api as any)[key](...args);
      }
    };
  },
};

window.OSSTag = new Proxy(api, proxyHandler);


window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flush();
  }
});
