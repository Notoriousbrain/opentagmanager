"use client";

import { Separator, Button, Sheet, SheetTrigger, SheetContent } from "@otm/ui";
import { Menu } from "lucide-react";
import { OrgSwitcher } from "../org/org-switcher";

export function AppHeader() {
  return (
    <header className="border-b border-black/10 text-white">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center rounded-xl border border-black/15">
            <span className="text-[10px] font-semibold tracking-widest">
              OTM
            </span>
          </div>
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm">Dashboard</span>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <OrgSwitcher />
          {/* Placeholder for account menu / sign-out later */}
          <Button variant="outline" className="rounded-lg">
            Account
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="sm:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 space-y-4">
              <OrgSwitcher />
              <Button variant="outline" className="w-full rounded-lg">
                Account
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
