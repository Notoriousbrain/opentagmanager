import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from "@otm/ui";
import React from "react";
import { Chrome, Github, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const SignInCard = () => {
  const [loading, setLoading] = React.useState<"github" | "google" | null>(
    null
  );

  async function signInWith(provider: "github" | "google") {
    try {
      setLoading(provider);
      await authClient.signIn.social({ provider, callbackURL: "/dashboard" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="rounded-2xl border border-white/20 bg-gradient-to-b from-background/95 to-background/70 shadow-lg backdrop-blur-xl">
      <CardHeader className="space-y-3 ">
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Sign in
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Choose a provider to continue.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full py-4 rounded-lg cursor-pointer border border-white/30 text-base font-medium flex items-center justify-center"
            aria-label="Continue with GitHub"
            onClick={() => signInWith("github")}
            disabled={loading !== null}
          >
            {loading === "github" ? (
              <Loader2
                className="mr-2 size-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Github className="mr-2 size-5" aria-hidden="true" />
            )}
            Continue with GitHub
          </Button>

          <Button
            variant="outline"
            className="w-full py-4 rounded-lg text-base border cursor-pointer border-white/30 font-medium flex items-center justify-center"
            aria-label="Continue with Google"
            onClick={() => signInWith("google")}
            disabled={loading !== null}
          >
            {loading === "google" ? (
              <Loader2
                className="mr-2 size-5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Chrome className="mr-2 size-5" aria-hidden="true" />
            )}
            Continue with Google
          </Button>
        </div>

        <div className="my-8 flex items-center gap-3">
          <Separator className="flex-1" aria-hidden="true" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <Separator className="flex-1" aria-hidden="true" />
        </div>

        {/* Email/password slot (optional for later) */}
        {/* <EmailPasswordForm /> */}

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          By continuing, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4">
            Terms
          </a>{" "}
          and acknowledge our{" "}
          <a href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInCard;
