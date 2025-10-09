import { z } from "zod";

export const Slug = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9][a-z0-9-]*$/, "lowercase letters, numbers, and dashes only");

export const CreateProjectInput = z.object({
  orgId: z.string().min(1),
  name: z.string().min(1).max(120),
  slug: Slug,
});

export const CreateApiKeyInput = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1).max(120),
  type: z.enum(["public", "secret"]),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInput>;
export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInput>;
