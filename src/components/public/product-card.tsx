"use client";

import { useState } from "react";
import { Check, Minus, Package, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/db/schema";
import { useCart } from "@/store/cart";
import { formatPrice, UNIT_LABELS } from "@/lib/utils";
import { AvailabilityBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CursorImagePreview,
  supportsHoverPreview,
} from "./cursor-image-preview";

export function ProductCard({ product, categoryName }: { product: Product; categoryName: string }) {
  const addItem = useCart((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  function trackCursor(e: React.MouseEvent) {
    if (!product.imageUrl || !supportsHoverPreview()) return;
    setCursor({ x: e.clientX, y: e.clientY });
  }

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        unit: product.unit,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity
    );
    setJustAdded(true);
    setQuantity(1);
    toast.success(`${product.name} adăugat în cerere`);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5"
      onMouseEnter={trackCursor}
      onMouseMove={trackCursor}
      onMouseLeave={() => setCursor(null)}
    >
      {/* image background matches the SVG illustrations' own backdrop */}
      <div className="relative mb-3 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-[#f2f2f0]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package
            className="size-10 text-zinc-300 transition-transform duration-300 group-hover:scale-110 group-hover:text-orange-400"
            aria-hidden
          />
        )}
        <span className="absolute left-2 top-2">
          <AvailabilityBadge availability={product.availability} />
        </span>
      </div>
      {cursor && product.imageUrl && (
        <CursorImagePreview
          x={cursor.x}
          y={cursor.y}
          src={product.imageUrl}
          title={product.name}
        />
      )}

      <div className="flex-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          {categoryName}
        </p>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-zinc-900">{product.name}</h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
            {product.description}
          </p>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-base font-bold text-zinc-900">
          {product.price == null ? (
            <span className="text-sm font-semibold text-orange-600">Preț la cerere</span>
          ) : (
            formatPrice(product.price)
          )}
        </span>
        <span className="font-mono text-xs text-zinc-500">/ {UNIT_LABELS[product.unit]}</span>
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
