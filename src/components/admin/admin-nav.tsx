"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, FolderKanban, LayoutDashboard, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/cereri", label: "Cereri", icon: ClipboardList, exact: false },
  { href: "/admin/produse", label: "Produse", icon: Package, exact: false },
  { href: "/admin/categorii", label: "Categorii", icon: FolderKanban, exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1" aria-label="Navigare admin">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
            )}
          >
            <Icon className={cn("size-4.5", active && "text-orange-500")} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
      aria-label="Navigare admin mobilă"
    >
      <div className="grid h-16 grid-cols-4">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-orange-600" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Icon className="size-5" aria-hidden />
              {label}
              {active && (
                <span className="absolute top-0 h-0.5 w-8 animate-fade-in rounded-full bg-orange-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
