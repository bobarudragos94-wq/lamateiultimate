import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Package, Phone } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, quoteRequests } from "@/db/schema";
import { formatPrice, UNIT_LABELS } from "@/lib/utils";
import type { ProductUnit } from "@/db/schema";

export const metadata: Metadata = {
  title: "Cerere trimisă",
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [request] = await db
    .select()
    .from(quoteRequests)
    .where(eq(quoteRequests.code, decodeURIComponent(code)))
    .limit(1);

  if (!request) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.requestId, request.id));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="animate-fade-in-up text-center">
        <div className="mx-auto mb-6 flex size-20 animate-scale-in items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-10 text-emerald-600" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Cererea ta a fost trimisă!
        </h1>
        <p className="mt-3 text-zinc-500">
          Vei fi contactat pentru confirmare în cel mai scurt timp. Păstrează numărul cererii pentru
          referință.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 shadow-sm">
          <span className="text-sm text-zinc-500">Număr cerere:</span>
          <span className="font-mono text-base font-bold tracking-wide text-zinc-900">
            {request.code}
          </span>
        </div>
      </div>

      <div className="mt-10 animate-fade-in-up rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
          <Package className="size-4 text-orange-500" aria-hidden />
          Rezumatul cererii
        </h2>
        <ul className="divide-y divide-zinc-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="text-zinc-700">{item.productName}</span>
              <span className="shrink-0 font-semibold text-zinc-900">
                {item.quantity} {UNIT_LABELS[item.unit as ProductUnit] ?? item.unit}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-4">
          <span className="text-sm font-medium text-zinc-500">Total estimativ</span>
          <span className="text-base font-bold text-zinc-900">
            {request.estimatedTotal == null
              ? "Se calculează la ofertare"
              : formatPrice(request.estimatedTotal)}
          </span>
        </div>
      </div>

      <div className="mt-8 animate-fade-in-up rounded-2xl bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-600">
        <h3 className="mb-2 font-semibold text-zinc-900">Ce urmează?</h3>
        <ol className="list-inside list-decimal space-y-1.5">
          <li>Un coleg verifică stocul și calculează costul transportului.</li>
          <li>
            Te sunăm la numărul <strong>{request.phone}</strong> pentru confirmarea prețului final.
          </li>
          <li>Stabilim împreună data livrării sau ridicarea din depozit.</li>
        </ol>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
        >
          Înapoi la catalog
        </Link>
        <a
          href="tel:+40700000000"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-50 active:scale-[0.98]"
        >
          <Phone className="size-4" aria-hidden />
          Sună-ne pentru urgențe
        </a>
      </div>
    </div>
  );
}
