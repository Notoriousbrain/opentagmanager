import { cache } from "../src/index";

(async () => {
  await cache.set("k", "v", 1);
  console.log("GET:", await cache.get("k"));
})();
