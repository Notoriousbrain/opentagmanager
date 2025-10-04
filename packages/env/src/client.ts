import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4";

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_OTM_RELAY_URL: z.string().url().optional(),
    NEXT_PUBLIC_OTM_PREVIEW_FLAG: z.string().default("otm_preview"),
  },

  runtimeEnv: {
    NEXT_PUBLIC_OTM_RELAY_URL: process.env.NEXT_PUBLIC_OTM_RELAY_URL,
    NEXT_PUBLIC_OTM_PREVIEW_FLAG: process.env.NEXT_PUBLIC_OTM_PREVIEW_FLAG,
  },

  skipValidation: process.env.VERCEL_ENV !== "production",
});
