import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrickMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 grid-cols-2 gap-0.5 rounded-xl bg-zinc-900 p-2",
        className
      )}
      aria-hidden
    >
      <span className="rounded-[2px] bg-orange-500" />
      <span className="rounded-[2px] bg-orange-500" />
      <span className="rounded-[2px] bg-white" />
      <span className="rounded-[2px] bg-orange-500" />
    </span>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
      <BrickMark />
      <span className="text-lg font-bold tracking-tight text-zinc-900">
        Depozit<span className="text-orange-500">Construct</span>
      </span>
    </Link>
  );
}
