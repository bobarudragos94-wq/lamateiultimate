import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { CategoryManager } from "@/components/admin/category-manager";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const [categoryList, counts] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db
      .select({ categoryId: products.categoryId, count: sql<number>`count(*)` })
      .from(products)
      .groupBy(products.categoryId),
  ]);

  const productCounts = Object.fromEntries(counts.map((row) => [row.categoryId, row.count]));

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Categorii</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Organizează catalogul pe categorii. Ordinea afectează afișarea în site.
        </p>
      </div>
      <CategoryManager categories={categoryList} productCounts={productCounts} />
    </div>
  );
}
