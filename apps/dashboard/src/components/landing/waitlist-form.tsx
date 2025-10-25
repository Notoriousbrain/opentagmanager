"use client";

import * as React from "react";
import { Button, Input } from "@otm/ui";
import { trpc } from "@/lib/trpc/react";
import { z } from "zod";

const EmailSchema = z.string().trim().toLowerCase().email();

export default function WaitlistForm() {
  const [email, setEmail] = React.useState("");
  const [hp, setHp] = React.useState("");
  const [msg, setMsg] = React.useState<null | {
    type: "ok" | "err";
    text: string;
  }>(null);

  const utils = trpc.useUtils();

  const { data: countData, isLoading: countLoading } =
    trpc.interest.count.useQuery(undefined, { refetchOnWindowFocus: false });

  const { mutate: register, isPending } = trpc.interest.register.useMutation({
    onMutate: async () => {
      await utils.interest.count.cancel();
      const prev = utils.interest.count.getData();
      utils.interest.count.setData(undefined, (curr) => ({
        count: (curr?.count ?? 0) + 1,
      }));
      return { prev };
    },
    onSuccess: async () => {
      setMsg({ type: "ok", text: "You're in. We'll be in touch soon." });
      setEmail("");
      await utils.interest.count.invalidate();
    },
    onError: (err, _input, ctx) => {
      if (ctx?.prev) utils.interest.count.setData(undefined, ctx.prev);

      const code = err.data?.code;

      if (code === "TOO_MANY_REQUESTS") {
        setMsg({
          type: "err",
          text: "Too many attempts. Please try again in a bit.",
        });
      } else if (code === "BAD_REQUEST") {
        setMsg({ type: "err", text: "Please enter a valid email." });
      } else if (code === "CONFLICT") {
        // 👇 new case: already in list
        setMsg({ type: "ok", text: "You're already in the list." });
      } else {
        setMsg({
          type: "err",
          text: "Something went wrong. Please try again.",
        });
      }
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;
    const parsed = EmailSchema.safeParse(email);
    if (!parsed.success) {
      setMsg({ type: "err", text: "Please enter a valid email." });
      return;
    }
    setMsg(null);
    register({ email: parsed.data });
  }

  const isEmailValid = EmailSchema.safeParse(email).success;

  return (
    <div className="w-full max-w-md mx-auto">
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          aria-hidden
          className="hidden"
        />

        <Input
          type="email"
          placeholder="Enter email"
          className="flex-1 border-gray-500 rounded-sm text-sm h-10 px-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          aria-label="Email address"
        />
        <Button
          type="submit"
          disabled={isPending || !isEmailValid}
          className="px-3 md:px-6 w-[100px] md:w-[130px] text-xs md:text-sm font-light cursor-pointer border border-gray-500 rounded-sm h-10 hover:bg-white hover:text-black"
        >
          {isPending ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>

      <div className="text-xs mt-3 text-gray-500">
        {msg ? (
          <span
            className={msg.type === "ok" ? "text-green-400" : "text-red-400"}
          >
            {msg.text}
          </span>
        ) : (
          <span>
            {countLoading ? (
              <>
                <span className="inline-block w-3 h-3 bg-gray-700 rounded animate-pulse align-middle"></span>{" "}
                people have already joined.
              </>
            ) : (
              <>{countData?.count ?? 0} people have already joined.</>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
