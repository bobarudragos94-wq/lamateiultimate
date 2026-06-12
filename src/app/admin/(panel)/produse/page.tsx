import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { ProductManager } from "@/components/admin/product-manager";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  const [productList, categoryList] = await Promise.all([
    db.select().from(products).orderBy(asc(products.name)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Produse</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {productList.length} produse în catalog. Adaugă, editează sau dezactivează produse.
        </p>
      </div>
      <ProductManager products={productList} categories={categoryList} />
    </div>
  );
}
