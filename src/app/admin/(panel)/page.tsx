import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  Inbox,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { and, desc, eq, gte, inArray, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, quoteRequests } from "@/db/schema";
import { formatDateTime, formatPrice, UNIT_LABELS } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProductUnit } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [newTodayRow, confirmedMonthRow, valueMonthRow, topProducts, recentRequests] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(quoteRequests)
        .where(gte(quoteRequests.createdAt, startOfToday)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(quoteRequests)
        .where(
          and(
            inArray(quoteRequests.status, ["CONFIRMED", "PREPARED", "DELIVERED"]),
            gte(quoteRequests.createdAt, startOfMonth)
          )
        ),
      db
        .select({ total: sql<number | null>`sum(${quoteRequests.estimatedTotal})` })
        .from(quoteRequests)
        .where(
          and(ne(quoteRequests.status, "CANCELLED"), gte(quoteRequests.createdAt, startOfMonth))
        ),
      db
        .select({
          productName: orderItems.productName,
          unit: orderItems.unit,
          totalQuantity: sql<number>`sum(${orderItems.quantity})`,
          requestCount: sql<number>`count(distinct ${orderItems.requestId})`,
        })
        .from(orderItems)
        .innerJoin(quoteRequests, eq(orderItems.requestId, quoteRequests.id))
        .where(ne(quoteRequests.status, "CANCELLED"))
        .groupBy(orderItems.productName, orderItems.unit)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5),
      db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)).limit(6),
    ]);

  const stats = [
    {
      label: "Cereri noi azi",
      value: String(newTodayRow[0]?.count ?? 0),
      icon: Inbox,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Confirmate luna asta",
      value: String(confirmedMonthRow[0]?.count ?? 0),
      icon: BadgeCheck,
      accent: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Valoare estimată (luna)",
      value: formatPrice(valueMonthRow[0]?.total ?? 0),
      icon: Wallet,
      accent: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Privire de ansamblu asupra cererilor și produselor.
        </p>
      </div>

      {/* Stats */}
      <div className="stagger grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-3 flex size-11 items-center justify-center rounded-xl ${accent}`}>
              <Icon className="size-5" aria-hidden />
            </div>
            <p className="text-2xl font-bold tracking-tight text-zinc-900">{value}</p>
            <p className="mt-0.5 text-sm text-zinc-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Recent requests */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
              <ClipboardList className="size-5 text-orange-500" aria-hidden />
              Cereri recente
            </h2>
            <Link
              href="/admin/cereri"
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition-colors hover:text-orange-700"
            >
              Vezi toate <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Nicio cerere încă"
              description="Cererile trimise de clienți vor apărea aici."
            />
          ) : (
            <ul className="stagger space-y-3">
              {recentRequests.map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/admin/cereri/${request.id}`}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-400">
                          {request.code}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate font-semibold text-zinc-900">
                        {request.customerName}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {formatDateTime(request.createdAt)} · {request.phone}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={request.status} />
                      <span className="text-sm font-semibold text-zinc-700">
                        {request.estimatedTotal == null
                          ? "—"
                          : formatPrice(request.estimatedTotal)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top products */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <TrendingUp className="size-5 text-orange-500" aria-hidden />
            Cele mai cerute produse
          </h2>
          <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
            {topProducts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                Încă nu există date despre produse.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {topProducts.map((product, index) => (
                  <li key={product.productName} className="flex items-center gap-3 px-3 py-3.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {product.productName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {product.requestCount}{" "}
                        {product.requestCount === 1 ? "cerere" : "cereri"}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                      {product.totalQuantity}{" "}
                      {UNIT_LABELS[product.unit as ProductUnit] ?? product.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
