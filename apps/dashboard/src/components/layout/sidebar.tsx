"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator, Button } from "@otm/ui";
import { cn } from "@otm/ui/lib/utils";

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Projects", exact: true },
  { href: "/org", label: "Organizations" },
  { href: "/account", label: "Account" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 shrink-0 px-3 py-4">
      <div className="mb-3 px-2 text-xs uppercase tracking-wide text-zinc-500">
        Navigation
      </div>
      <nav className="space-y-1">
        {NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant={isActive ? "inverse" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive ? "font-medium" : "text-zinc-300"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4 bg-white/10" />

      <div className="px-2 text-xs text-zinc-500"></div>
    </aside>
  );
}
