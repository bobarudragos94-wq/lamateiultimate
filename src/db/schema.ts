import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const USER_ROLES = ["ADMIN", "STAFF"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const PRODUCT_UNITS = ["sac", "bucata", "bax", "mp", "ml", "palet", "kg", "rola", "set"] as const;
export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export const AVAILABILITY = ["IN_STOCK", "LIMITED", "ON_ORDER"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const REQUEST_STATUSES = [
  "NEW",
  "IN_REVIEW",
  "QUOTED",
  "CONFIRMED",
  "PREPARED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: USER_ROLES }).notNull().default("STAFF"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  unit: text("unit", { enum: PRODUCT_UNITS }).notNull().default("bucata"),
  // null price means "price on request"
  price: real("price"),
  availability: text("availability", { enum: AVAILABILITY }).notNull().default("IN_STOCK"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const quoteRequests = sqliteTable("quote_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  customerNotes: text("customer_notes"),
  desiredDeliveryDate: text("desired_delivery_date"),
  status: text("status", { enum: REQUEST_STATUSES }).notNull().default("NEW"),
  estimatedTotal: real("estimated_total"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: integer("request_id")
    .notNull()
    .references(() => quoteRequests.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  // snapshot of product data at request time
  productName: text("product_name").notNull(),
  unit: text("unit").notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price"),
});

export const internalNotes = sqliteTable("internal_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requestId: integer("request_id")
    .notNull()
    .references(() => quoteRequests.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => users.id),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name"),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type InternalNote = typeof internalNotes.$inferSelect;
