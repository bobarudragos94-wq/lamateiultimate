"use client";

import { useMemo, useState } from "react";
import { PackageSearch, Search, X } from "lucide-react";
import type { Category, Product } from "@/db/schema";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";

export function CatalogClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  const categoryNames = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryId !== null && product.categoryId !== categoryId) return false;
      if (!q) return true;
      return (
        product.name.toLowerCase().includes(q) ||
        (product.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, query, categoryId]);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută produse: ciment, OSB, rigips..."
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-10 text-sm shadow-sm transition-all placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          aria-label="Caută produse"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Șterge căutarea"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <CategoryChip active={categoryId === null} onClick={() => setCategoryId(null)}>
          Toate
        </CategoryChip>
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            active={categoryId === category.id}
            onClick={() => setCategoryId(category.id === categoryId ? null : category.id)}
          >
            {category.name}
          </CategoryChip>
        ))}
      </div>

      <p className="mb-4 text-sm text-zinc-500" aria-live="polite">
        {filtered.length === 1 ? "1 produs" : `${filtered.length} produse`}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Niciun produs găsit"
          description="Încearcă alt termen de căutare sau altă categorie. Dacă nu găsești ce cauți, sună-ne — îți facem rost."
        />
      ) : (
        <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryNames.get(product.categoryId) ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-95",
        active
          ? "bg-zinc-900 text-white shadow-sm"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
      )}
    >
      {children}
    </button>
  );
}
