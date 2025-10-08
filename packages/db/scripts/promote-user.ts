// packages/db/scripts/promote-user.ts
import { db, schema } from "@otm/db";
import { eq } from "drizzle-orm";

// usage: bun packages/db/scripts/promote-user.ts <email> [owner|admin]
const email = process.argv[2];
const roleArg = (process.argv[3] ?? "owner").toLowerCase();

type Role = "owner" | "admin";
const ROLE_VALUES: Role[] = ["owner", "admin"];

if (!email || !ROLE_VALUES.includes(roleArg as Role)) {
  console.error(
    "Usage: bun packages/db/scripts/promote-user.ts <email> [owner|admin]"
  );
  process.exit(1);
}

const role = roleArg as Role;

const rows = await db
  .update(schema.user)
  .set({ role })
  .where(eq(schema.user.email, email))
  .returning({
    id: schema.user.id,
    email: schema.user.email,
    role: schema.user.role,
  });

if (rows.length === 0) {
  console.error(`No user found with email: ${email}`);
  process.exit(1);
}

console.log(`Promoted ${rows[0]?.email} -> ${rows[0]?.role} (id=${rows[0]?.id})`);
