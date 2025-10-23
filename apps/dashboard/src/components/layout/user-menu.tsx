"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@otm/ui";
import { appSignOut } from "@/lib/signout";

type UserAccount = {
  email?: string | null;
  name?: string | null;
};

export function UserMenu(props: { account: UserAccount }) {
  const router = useRouter();
  const label = props.account.email ?? props.account.name ?? "Account";

  async function signOut() {
    await appSignOut("/auth/signin");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label="Account menu"
          className="max-w-[220px] truncate"
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="max-w-[220px] truncate">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/account")}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
