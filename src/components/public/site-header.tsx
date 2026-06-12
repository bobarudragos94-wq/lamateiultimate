"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Logo } from "./logo";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/catalog", label: "Catalog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const itemCount = useCart((state) => state.items.length);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigare principală">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/cerere"
          className="relative inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.98]"
        >
          <ClipboardList className="size-4" aria-hidden />
          <span className="hidden sm:inline">Cererea mea</span>
          <span className="sm:hidden">Cerere</span>
          {itemCount > 0 && (
            <span
              key={itemCount}
              className="absolute -right-1.5 -top-1.5 flex size-5 animate-scale-in items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white"
            >
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
