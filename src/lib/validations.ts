import { z } from "zod";
import { AVAILABILITY, PRODUCT_UNITS, REQUEST_STATUSES } from "@/db/schema";

export const quoteRequestSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "Numele trebuie să aibă cel puțin 3 caractere")
    .max(100, "Numele este prea lung"),
  phone: z
    .string()
    .trim()
    .min(8, "Numărul de telefon nu este valid")
    .max(20, "Numărul de telefon nu este valid")
    .regex(/^[+0-9 ().-]+$/, "Numărul de telefon nu este valid"),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, "Adresa de livrare trebuie să aibă cel puțin 5 caractere")
    .max(300, "Adresa este prea lungă"),
  customerNotes: z.string().trim().max(1000, "Observațiile sunt prea lungi").optional(),
  desiredDeliveryDate: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().positive("Cantitatea trebuie să fie pozitivă").max(100000),
      })
    )
    .min(1, "Adaugă cel puțin un produs în cerere"),
});
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Adresa de email nu este validă"),
  password: z.string().min(1, "Parola este obligatorie"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Numele produsului este obligatoriu").max(150),
  categoryId: z.number().int().positive("Selectează o categorie"),
  description: z.string().trim().max(1000).optional(),
  unit: z.enum(PRODUCT_UNITS),
  price: z.number().nonnegative("Prețul nu poate fi negativ").nullable(),
  availability: z.enum(AVAILABILITY),
  isActive: z.boolean(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Numele categoriei este obligatoriu").max(100),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const statusSchema = z.enum(REQUEST_STATUSES);

export const noteSchema = z.object({
  content: z.string().trim().min(1, "Notița nu poate fi goală").max(1000),
});
