import { useOrgStore } from "@/store/org";

export async function appSignOut(redirectTo = "/auth/signin"): Promise<void> {
  try {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
  } catch {}

  try {
    useOrgStore.getState().reset();
  } catch {}

  if (typeof window !== "undefined") {
    window.location.assign(redirectTo);
  }
}
