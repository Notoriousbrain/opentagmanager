import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const interest = pgTable("interest", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  ip: text("ip"),
  userAgent: text("user_agent"),
});
