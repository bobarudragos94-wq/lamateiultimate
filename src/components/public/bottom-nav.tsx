"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, Package } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Acasă", icon: Home },
  { href: "/catalog", label: "Catalog", icon: Package },
  { href: "/cerere", label: "Cerere", icon: ClipboardList },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCart((state) => state.items.length);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden"
      aria-label="Navigare mobilă"
    >
      <div className="grid h-16 grid-cols-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                active ? "text-orange-600" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {href === "/cerere" && itemCount > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </span>
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
