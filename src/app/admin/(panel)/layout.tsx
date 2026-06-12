import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { AdminBottomNav, AdminSidebarNav } from "@/components/admin/admin-nav";
import { BrickMark } from "@/components/public/logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh bg-zinc-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-zinc-900 p-4 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-2.5 px-2 pt-2">
          <BrickMark className="bg-zinc-800" />
          <span className="font-bold tracking-tight text-white">
            Depozit<span className="text-orange-500">Construct</span>
          </span>
        </Link>
        <AdminSidebarNav />
        <div className="mt-auto space-y-1 border-t border-zinc-800 pt-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800/60 hover:text-white"
          >
            <ExternalLink className="size-4.5" aria-hidden />
            Vezi site-ul
          </Link>
          <div className="flex items-center justify-between gap-2 px-3.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{session.name}</p>
              <p className="truncate text-xs text-zinc-500">
                {session.role === "ADMIN" ? "Administrator" : "Angajat"}
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                aria-label="Deconectare"
                title="Deconectare"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-lg lg:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <BrickMark className="size-8 p-1.5" />
            <span className="text-sm font-bold tracking-tight text-zinc-900">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-500">{session.name}</span>
            <form action={logout}>
              <button
                type="submit"
                className="flex size-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-red-600"
                aria-label="Deconectare"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
