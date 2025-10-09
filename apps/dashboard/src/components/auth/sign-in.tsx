"use client";
import SignInCard from "./signin-card";

export default function SignInComponent() {
  return (
    <section className="flex items-center justify-center h-full">
      <div className="w-full px-6 py-10 md:px-10 lg:px-14">
        <div className="mb-8 flex items-center gap-3">
          <div className="size-9 rounded-lg border border-border grid place-items-center">
            <span className="text-[10px] font-semibold tracking-widest">
              OTM
            </span>
          </div>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">
            Privacy‑first Tag Manager
          </span>
        </div>

        <div className="max-w-xl space-y-3">
          <h1 className="text-pretty text-3xl font-semibold tracking-tight md:text-4xl">
            Sign in to OTM
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            Your privacy‑first tag manager.
          </p>
        </div>

        <div className="mt-8 max-w-md">
          <SignInCard />
        </div>
      </div>
    </section>
  );
}
