import { customType, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "editor",
  "viewer",
  "service",
]);

export const verificationPurposeEnum = pgEnum("verification_purpose", [
  "email-verify",
  "password-reset",
]);

export const citext = customType<{ data: string; driverData: string }>({
  dataType() {
    return "citext";
  },
});
