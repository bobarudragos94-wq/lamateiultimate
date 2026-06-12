import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 text-center">
      <div className="mb-5 flex size-16 animate-scale-in items-center justify-center rounded-2xl bg-zinc-100">
        <SearchX className="size-8 text-zinc-400" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Pagina nu a fost găsită</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Linkul accesat nu există sau a fost mutat. Verifică adresa sau întoarce-te la pagina
        principală.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
      >
        Înapoi acasă
      </Link>
    </div>
  );
}
