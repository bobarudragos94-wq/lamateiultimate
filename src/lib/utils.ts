import type { Availability, ProductUnit, RequestStatus } from "@/db/schema";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Preț la cerere";
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | number): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const UNIT_LABELS: Record<ProductUnit, string> = {
  sac: "sac",
  bucata: "buc",
  bax: "bax",
  mp: "mp",
  ml: "ml",
  palet: "palet",
  kg: "kg",
  rola: "rolă",
  set: "set",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  IN_STOCK: "În stoc",
  LIMITED: "Stoc limitat",
  ON_ORDER: "La comandă",
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  NEW: "Nouă",
  IN_REVIEW: "În verificare",
  QUOTED: "Ofertată",
  CONFIRMED: "Confirmată",
  PREPARED: "Pregătită",
  DELIVERED: "Livrată",
  CANCELLED: "Anulată",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  NEW: "bg-blue-100 text-blue-800 ring-blue-600/20",
  IN_REVIEW: "bg-amber-100 text-amber-800 ring-amber-600/20",
  QUOTED: "bg-violet-100 text-violet-800 ring-violet-600/20",
  CONFIRMED: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  PREPARED: "bg-cyan-100 text-cyan-800 ring-cyan-600/20",
  DELIVERED: "bg-zinc-200 text-zinc-700 ring-zinc-500/20",
  CANCELLED: "bg-red-100 text-red-800 ring-red-600/20",
};

export const AVAILABILITY_COLORS: Record<Availability, string> = {
  IN_STOCK: "bg-emerald-100 text-emerald-800",
  LIMITED: "bg-amber-100 text-amber-800",
  ON_ORDER: "bg-zinc-200 text-zinc-700",
};
