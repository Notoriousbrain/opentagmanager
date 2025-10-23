"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@otm/ui";
import { appSignOut } from "@/lib/signout";

type UserAccount = {
  email?: string | null;
  name?: string | null;
};

export function UserMenu(props: { account: UserAccount }) {
  const label = props.account.email ?? props.account.name ?? "Account";

  async function signOut() {
    await appSignOut("/signin");
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
      <DropdownMenuContent align="end" className="space-y-2 py-2 w-full">
        <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
