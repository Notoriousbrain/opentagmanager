import { authClient } from "./auth-client";
import { redirect } from "next/navigation";

export async function appSignOut(redirectTo = "/signin"): Promise<void> {
  try {
    await authClient.signOut();
  } catch (err) {
    console.warn("Sign-out error:", err);
  }
  try {
    await fetch("/api/auth/cleanup", {
      method: "POST",
      credentials: "include",
    });
  } catch {}

  try {
    await fetch("/api/auth/cleanup", {
      method: "POST",
      credentials: "include",
    });
    localStorage.removeItem("otm.org");
  } catch {}

  redirect(redirectTo);
}
