"use client";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const signInGithub = () =>
    authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });

  const signInGoogle = () =>
    authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });

  return (
    <main className="mx-auto max-w-sm p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <button
        onClick={signInGithub}
        className="w-full rounded-xl border px-4 py-2"
      >
        Continue with GitHub
      </button>
      <button
        onClick={signInGoogle}
        className="w-full rounded-xl border px-4 py-2"
      >
        Continue with Google
      </button>
    </main>
  );
}
