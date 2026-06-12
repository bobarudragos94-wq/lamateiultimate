import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  MessageSquare,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { internalNotes, orderItems, quoteRequests, type ProductUnit } from "@/db/schema";
import { formatDate, formatDateTime, formatPrice, UNIT_LABELS } from "@/lib/utils";
import { StatusSelect } from "@/components/admin/status-select";
import { NoteForm } from "@/components/admin/note-form";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId)) notFound();

  const [request] = await db
    .select()
    .from(quoteRequests)
    .where(eq(quoteRequests.id, requestId))
    .limit(1);
  if (!request) notFound();

  const [items, notes] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.requestId, requestId)),
    db
      .select()
      .from(internalNotes)
      .where(eq(internalNotes.requestId, requestId))
      .orderBy(asc(internalNotes.createdAt)),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/cereri"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Înapoi la cereri
      </Link>

      <div className="mb-6 flex animate-fade-in-up flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-sm font-semibold text-zinc-400">{request.code}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
            {request.customerName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Trimisă pe {formatDateTime(request.createdAt)}
          </p>
        </div>
        <StatusSelect requestId={request.id} status={request.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Items */}
          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <h2 className="border-b border-zinc-100 px-5 py-4 text-base font-semibold text-zinc-900">
              Produse cerute <span className="text-zinc-400">({items.length})</span>
            </h2>
            <ul className="divide-y divide-zinc-100">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.unitPrice == null
                        ? "Preț la cerere"
                        : `${formatPrice(item.unitPrice)} / ${UNIT_LABELS[item.unit as ProductUnit] ?? item.unit}`}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-zinc-900">
                      {item.quantity} {UNIT_LABELS[item.unit as ProductUnit] ?? item.unit}
                    </p>
                    {item.unitPrice != null && (
                      <p className="text-xs text-zinc-500">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4">
              <span className="text-sm font-medium text-zinc-500">Total estimativ</span>
              <span className="text-lg font-bold text-zinc-900">
                {request.estimatedTotal == null
                  ? "Necesită ofertare"
                  : formatPrice(request.estimatedTotal)}
              </span>
            </div>
          </section>

          {/* Internal notes */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-900">
              <StickyNote className="size-4 text-orange-500" aria-hidden />
              Notițe interne
            </h2>
            {notes.length > 0 && (
              <ul className="mb-5 space-y-3">
                {notes.map((note) => (
                  <li key={note.id} className="animate-fade-in rounded-xl bg-amber-50 p-4">
                    <p className="text-sm leading-relaxed text-zinc-800">{note.content}</p>
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      {note.authorName} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <NoteForm requestId={request.id} />
          </section>
        </div>

        {/* Customer info */}
        <aside className="h-fit space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">Date client</h2>
          <InfoRow icon={User} label="Nume">
            {request.customerName}
          </InfoRow>
          <InfoRow icon={Phone} label="Telefon">
            <a
              href={`tel:${request.phone.replace(/\s/g, "")}`}
              className="font-semibold text-orange-600 transition-colors hover:text-orange-700"
            >
              {request.phone}
            </a>
          </InfoRow>
          <InfoRow icon={MapPin} label="Adresă livrare">
            {request.deliveryAddress}
          </InfoRow>
          <InfoRow icon={CalendarDays} label="Dată dorită livrare">
            {request.desiredDeliveryDate ? formatDate(request.desiredDeliveryDate) : "Nespecificată"}
          </InfoRow>
          <InfoRow icon={MessageSquare} label="Observații client">
            {request.customerNotes || "Fără observații"}
          </InfoRow>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
        <Icon className="size-4 text-zinc-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-zinc-800">{children}</p>
      </div>
    </div>
  );
}
