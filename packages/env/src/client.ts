import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod/v4';

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_VERCEL_ENV: z.enum(['development', 'test', 'production']),
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  },
  skipValidation: process.env.VERCEL_ENV !== 'production',
});
