"use client";
import SignInCard from "./signin-card";

export default function SignInComponent() {
  return (
    <section className="w-full flex justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="mb-8 flex items-center gap-3 justify-center lg:justify-start">
          <div className="grid size-9 place-items-center rounded-lg border border-border">
            <span className="text-[10px] font-semibold tracking-widest">
              OTM
            </span>
          </div>
          <div className="h-5 w-px bg-border" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">
            One Click Privacy Tag Manager
          </span>
        </div>

        <div className="space-y-2 text-center lg:text-left">
          <h1 className="text-pretty text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            Sign in to manage tags, events, and deployments.
          </p>
        </div>

        <div className="mt-8 max-w-md mx-auto lg:mx-0">
          <SignInCard />
        </div>
      </div>
    </section>
  );
}
