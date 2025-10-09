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
import { Chrome, Github } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const SignInCard = () => {
  const handleGithub = () =>
    authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" });

  const handleGoogle = () =>
    authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });

  return (
    <Card className="rounded-xl border-0 bg-[#0f0f0f] px-4 py-8">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl tracking-tight">Sign in</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Continue with one of the providers below.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <Button
            className="border w-full py-4 rounded-md "
            aria-label="Continur with Github"
          >
            <span className="font-"> Github</span>
          </Button>

          <Button
            className="border w-full py-4 rounded-md "
            aria-label="Continur with Github"
          >
            <span className="font-"> Google</span>
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3">
          <Separator className="flex-1" aria-hidden="true" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <Separator className="flex-1" aria-hidden="true" />
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
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
