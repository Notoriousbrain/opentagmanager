import { isFeatureEnabled } from "../src/utils/feature-flags";
import { setFeatureFlag, clearFeatureFlag } from "../src/utils/feature-flags";

async function main() {
  await setFeatureFlag("beta_ui", true, 2);
  console.log("beta_ui (immediate):", await isFeatureEnabled("beta_ui"));
  await new Promise((r) => setTimeout(r, 2500));
  console.log("beta_ui (after 2.5s):", await isFeatureEnabled("beta_ui"));
  await clearFeatureFlag("beta_ui");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
