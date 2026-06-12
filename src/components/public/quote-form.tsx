"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cartEstimatedTotal, useCart } from "@/store/cart";
import { submitQuoteRequest } from "@/actions/public";
import { quoteRequestSchema } from "@/lib/validations";
import { formatPrice, UNIT_LABELS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductUnit } from "@/db/schema";

export function QuoteForm() {
  const router = useRouter();
  const { items, removeItem, setQuantity, clear } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // zustand persist hydrates after mount; avoid SSR/client mismatch
  useEffect(() => setHydrated(true), []);

  const total = cartEstimatedTotal(items);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const input = {
      customerName: String(formData.get("customerName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      deliveryAddress: String(formData.get("deliveryAddress") ?? ""),
      customerNotes: String(formData.get("customerNotes") ?? "") || undefined,
      desiredDeliveryDate: String(formData.get("desiredDeliveryDate") ?? "") || undefined,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };

    const parsed = quoteRequestSchema.safeParse(input);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.errors) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      toast.error(parsed.error.errors[0]?.message ?? "Verifică datele introduse");
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const result = await submitQuoteRequest(parsed.data);
    if (result.success) {
      clear();
      router.push(`/cerere/confirmare/${result.code}`);
    } else {
      setSubmitting(false);
      toast.error(result.error);
    }
  }

  if (!hydrated) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Cererea ta este goală"
        description="Adaugă produse din catalog ca să poți trimite o cerere de ofertă."
        action={
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center rounded-xl bg-orange-500 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Mergi la catalog
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {/* Items */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">
          Produse selectate <span className="text-zinc-400">({items.length})</span>
        </h2>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex animate-fade-in items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm sm:gap-4 sm:p-4"
            >
              <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 sm:flex">
                <Package className="size-5 text-zinc-400" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {item.price == null
                    ? "Preț la cerere"
                    : `${formatPrice(item.price)} / ${UNIT_LABELS[item.unit as ProductUnit] ?? item.unit}`}
                </p>
              </div>
              <div className="flex h-10 shrink-0 items-center rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="flex size-10 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 active:scale-90"
                  aria-label="Scade cantitatea"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    setQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-12 border-0 bg-transparent text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label={`Cantitate ${item.name}`}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  className="flex size-10 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 active:scale-90"
                  aria-label="Crește cantitatea"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeItem(item.productId);
                  toast.info(`${item.name} a fost scos din cerere`);
                }}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-90"
                aria-label={`Șterge ${item.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-900 px-5 py-4 text-white">
          <span className="text-sm font-medium text-zinc-300">Total estimativ</span>
          <span className="text-lg font-bold">
            {total == null ? "Se calculează la ofertare" : formatPrice(total)}
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Prețul final, inclusiv transportul, va fi confirmat telefonic de echipa noastră.
        </p>
      </div>

      {/* Customer data */}
      <div className="h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-zinc-900">Datele tale</h2>
        <div className="space-y-4">
          <Field label="Nume și prenume" required>
            <Input
              name="customerName"
              placeholder="ex: Ion Popescu"
              autoComplete="name"
              required
              aria-invalid={!!fieldErrors.customerName}
            />
            {fieldErrors.customerName && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.customerName}</span>
            )}
          </Field>
          <Field label="Telefon" required>
            <Input
              name="phone"
              type="tel"
              placeholder="ex: 0722 123 456"
              autoComplete="tel"
              required
              aria-invalid={!!fieldErrors.phone}
            />
            {fieldErrors.phone && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.phone}</span>
            )}
          </Field>
          <Field label="Adresă livrare" required>
            <Textarea
              name="deliveryAddress"
              placeholder="Strada, număr, localitate / punct de lucru"
              autoComplete="street-address"
              required
              className="min-h-20"
              aria-invalid={!!fieldErrors.deliveryAddress}
            />
            {fieldErrors.deliveryAddress && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.deliveryAddress}</span>
            )}
          </Field>
          <Field label="Dată dorită livrare">
            <Input
              name="desiredDeliveryDate"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
            />
          </Field>
          <Field label="Observații" hint="Acces, program, detalii utile pentru livrare">
            <Textarea
              name="customerNotes"
              placeholder="ex: Sunați cu 30 min înainte, descărcare cu macara..."
              className="min-h-20"
            />
          </Field>
          <Button type="submit" variant="secondary" size="lg" className="w-full" loading={submitting}>
            {submitting ? "Se trimite..." : "Trimite cererea de ofertă"}
          </Button>
          <p className="text-center text-xs text-zinc-400">
            Trimiterea cererii nu te obligă la nimic — confirmăm totul telefonic.
          </p>
        </div>
      </div>
    </form>
  );
}
