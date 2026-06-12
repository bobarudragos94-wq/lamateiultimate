import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, products, type Category, type Product } from "@/db/schema";
import { CatalogClient } from "@/components/public/catalog-client";

export const metadata: Metadata = {
  title: "Catalog produse",
  description: "Catalog complet de materiale de construcții: ciment, rigips, OSB, BCA, izolații.",
};

// Rendered on demand so the build never depends on a populated database.
export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let productList: Product[] = [];
  let categoryList: Category[] = [];
  try {
    [productList, categoryList] = await Promise.all([
      db.select().from(products).where(eq(products.isActive, true)).orderBy(asc(products.name)),
      db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder)),
    ]);
  } catch (error) {
    console.error("Failed to load catalog:", error);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          Catalog produse
        </h1>
        <p className="mt-1 text-zinc-500">
          Adaugă produsele în cerere și trimite-ne-o — revenim cu oferta finală.
        </p>
      </div>
      <CatalogClient products={productList} categories={categoryList} />
    </div>
  );
}
