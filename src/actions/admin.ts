"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  categories,
  internalNotes,
  orderItems,
  products,
  quoteRequests,
  type RequestStatus,
} from "@/db/schema";
import { requireSession, type SessionPayload } from "@/lib/auth";
import {
  categorySchema,
  noteSchema,
  productSchema,
  statusSchema,
  type CategoryInput,
  type ProductInput,
} from "@/lib/validations";
import { slugify } from "@/lib/utils";

export type ActionResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "A apărut o eroare. Încearcă din nou.";

async function logAudit(
  session: SessionPayload,
  action: string,
  entity: string,
  entityId: number | null,
  details?: string
) {
  try {
    await db.insert(auditLogs).values({
      userId: session.userId,
      userName: session.name,
      action,
      entity,
      entityId,
      details: details ?? null,
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

// ---------- Quote requests ----------

export async function updateRequestStatus(
  requestId: number,
  status: RequestStatus
): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { success: false, error: "Status invalid" };

  try {
    await db
      .update(quoteRequests)
      .set({ status: parsed.data, updatedAt: new Date() })
      .where(eq(quoteRequests.id, requestId));
    await logAudit(session, "UPDATE_STATUS", "quote_request", requestId, parsed.data);
    revalidatePath("/admin");
    revalidatePath("/admin/cereri");
    revalidatePath(`/admin/cereri/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update request status:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function addInternalNote(requestId: number, content: string): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  const parsed = noteSchema.safeParse({ content });
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Notiță invalidă" };
  }

  try {
    await db.insert(internalNotes).values({
      requestId,
      authorId: session.userId,
      authorName: session.name,
      content: parsed.data.content,
    });
    revalidatePath(`/admin/cereri/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add internal note:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

// ---------- Products ----------

async function uniqueProductSlug(name: string, excludeId?: number): Promise<string> {
  const base = slugify(name) || "produs";
  let slug = base;
  let attempt = 1;
  // try base, base-2, base-3... until free
  for (;;) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!existing || existing.id === excludeId) return slug;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
}

export async function createProduct(input: ProductInput): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  try {
    const slug = await uniqueProductSlug(parsed.data.name);
    const [product] = await db
      .insert(products)
      .values({ ...parsed.data, description: parsed.data.description || null, slug })
      .returning();
    await logAudit(session, "CREATE", "product", product.id, product.name);
    revalidatePath("/admin/produse");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function updateProduct(id: number, input: ProductInput): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  try {
    const slug = await uniqueProductSlug(parsed.data.name, id);
    await db
      .update(products)
      .set({
        ...parsed.data,
        description: parsed.data.description || null,
        slug,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
    await logAudit(session, "UPDATE", "product", id, parsed.data.name);
    revalidatePath("/admin/produse");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function deleteProduct(id: number): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  try {
    const [used] = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(eq(orderItems.productId, id))
      .limit(1);

    if (used) {
      // product is referenced by orders — deactivate instead of deleting
      await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(products.id, id));
      await logAudit(session, "DEACTIVATE", "product", id);
    } else {
      await db.delete(products).where(eq(products.id, id));
      await logAudit(session, "DELETE", "product", id);
    }
    revalidatePath("/admin/produse");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

// ---------- Categories ----------

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  try {
    const slug = slugify(parsed.data.name) || "categorie";
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (existing) return { success: false, error: "Există deja o categorie cu acest nume" };

    const [category] = await db
      .insert(categories)
      .values({ ...parsed.data, description: parsed.data.description || null, slug })
      .returning();
    await logAudit(session, "CREATE", "category", category.id, category.name);
    revalidatePath("/admin/categorii");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function updateCategory(id: number, input: CategoryInput): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }

  try {
    const slug = slugify(parsed.data.name) || "categorie";
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (existing && existing.id !== id) {
      return { success: false, error: "Există deja o categorie cu acest nume" };
    }

    await db
      .update(categories)
      .set({ ...parsed.data, description: parsed.data.description || null, slug })
      .where(eq(categories.id, id));
    await logAudit(session, "UPDATE", "category", id, parsed.data.name);
    revalidatePath("/admin/categorii");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  let session;
  try {
    session = await requireSession();
  } catch {
    return { success: false, error: "Sesiune expirată. Autentifică-te din nou." };
  }

  try {
    const [used] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.categoryId, id))
      .limit(1);
    if (used) {
      return {
        success: false,
        error: "Categoria are produse asociate. Mută sau șterge produsele mai întâi.",
      };
    }

    await db.delete(categories).where(eq(categories.id, id));
    await logAudit(session, "DELETE", "category", id);
    revalidatePath("/admin/categorii");
    revalidatePath("/catalog");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: GENERIC_ERROR };
  }
}
