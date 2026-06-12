"use server";

import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, products, quoteRequests } from "@/db/schema";
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validations";

export type SubmitQuoteResult =
  | { success: true; code: string }
  | { success: false; error: string };

function generateRequestCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 36 ** 5)
    .toString(36)
    .toUpperCase()
    .padStart(5, "0");
  return `CMD-${year}-${random}`;
}

export async function submitQuoteRequest(input: QuoteRequestInput): Promise<SubmitQuoteResult> {
  const parsed = quoteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Date invalide" };
  }
  const data = parsed.data;

  try {
    const productIds = data.items.map((item) => item.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));
    for (const item of data.items) {
      if (!productMap.has(item.productId)) {
        return { success: false, error: "Unul dintre produse nu mai este disponibil. Reîncarcă pagina." };
      }
    }

    let estimatedTotal: number | null = 0;
    for (const item of data.items) {
      const product = productMap.get(item.productId)!;
      if (product.price == null) {
        estimatedTotal = null;
        break;
      }
      estimatedTotal += product.price * item.quantity;
    }

    const code = generateRequestCode();
    const [request] = await db
      .insert(quoteRequests)
      .values({
        code,
        customerName: data.customerName,
        phone: data.phone,
        deliveryAddress: data.deliveryAddress,
        customerNotes: data.customerNotes || null,
        desiredDeliveryDate: data.desiredDeliveryDate || null,
        estimatedTotal,
      })
      .returning();

    await db.insert(orderItems).values(
      data.items.map((item) => {
        const product = productMap.get(item.productId)!;
        return {
          requestId: request.id,
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity: item.quantity,
          unitPrice: product.price,
        };
      })
    );

    return { success: true, code };
  } catch (error) {
    console.error("Failed to submit quote request:", error);
    return { success: false, error: "A apărut o eroare. Te rugăm să încerci din nou." };
  }
}
