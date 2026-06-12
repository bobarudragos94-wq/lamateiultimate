"use client";

import { useState } from "react";
import { Check, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/db/schema";
import { useCart } from "@/store/cart";
import { formatPrice, UNIT_LABELS } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProductCard({ product, categoryName }: { product: Product; categoryName: string }) {
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        unit: product.unit,
        price: product.price,
      },
      quantity
    );
    setJustAdded(true);
    setQuantity(1);
    toast.success(`${product.name} adăugat în cerere`);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5">
      <div className="relative mb-3 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50">
        <Package
          className="size-10 text-zinc-300 transition-transform duration-300 group-hover:scale-110 group-hover:text-orange-400"
          aria-hidden
        />
        <span className="absolute left-2 top-2">
          <AvailabilityBadge availability={product.availability} />
        </span>
      </div>

      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">{categoryName}</p>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-zinc-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {product.description}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-base font-bold text-zinc-900">
          {product.price == null ? (
            <span className="text-sm font-semibold text-orange-600">Preț la cerere</span>
          ) : (
            formatPrice(product.price)
          )}
        </span>
        <span className="text-xs text-zinc-500">/ {UNIT_LABELS[product.unit]}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-11 items-center rounded-xl border border-zinc-200">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-11 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 active:scale-90"
            aria-label="Scade cantitatea"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            className="w-10 border-0 bg-transparent text-center text-sm font-semibold focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Cantitate"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex size-11 items-center justify-center text-zinc-500 transition-colors hover:text-zinc-900 active:scale-90"
            aria-label="Crește cantitatea"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button
          variant={justAdded ? "primary" : "secondary"}
          className="flex-1"
          onClick={handleAdd}
          aria-label={`Adaugă ${product.name} în cerere`}
        >
          {justAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
          {justAdded ? "Adăugat" : "Adaugă"}
        </Button>
      </div>
    </article>
  );
}
