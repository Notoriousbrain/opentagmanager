import { customType, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "editor",
  "viewer",
  "service",
]);

export const citext = customType<{ data: string; driverData: string }>({
  dataType() {
    return "citext";
  },
});
