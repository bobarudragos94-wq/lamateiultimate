import Link from "next/link";
import { Inbox } from "lucide-react";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, quoteRequests, REQUEST_STATUSES, type RequestStatus } from "@/db/schema";
import { cn, formatDateTime, formatPrice, STATUS_LABELS } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = REQUEST_STATUSES.includes(status as RequestStatus)
    ? (status as RequestStatus)
    : null;

  const [requests, statusCounts] = await Promise.all([
    activeStatus
      ? db
          .select()
          .from(quoteRequests)
          .where(eq(quoteRequests.status, activeStatus))
          .orderBy(desc(quoteRequests.createdAt))
      : db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)),
    db
      .select({ status: quoteRequests.status, count: sql<number>`count(*)` })
      .from(quoteRequests)
      .groupBy(quoteRequests.status),
  ]);

  const itemCounts =
    requests.length > 0
      ? await db
          .select({ requestId: orderItems.requestId, count: sql<number>`count(*)` })
          .from(orderItems)
          .groupBy(orderItems.requestId)
      : [];
  const itemCountMap = new Map(itemCounts.map((row) => [row.requestId, row.count]));

  const countMap = new Map(statusCounts.map((row) => [row.status, row.count]));
  const totalCount = statusCounts.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cereri și comenzi</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Toate cererile de ofertă, organizate pe statusuri.
        </p>
      </div>

      {/* Status filter */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <FilterChip href="/admin/cereri" active={activeStatus === null}>
          Toate <CountPill count={totalCount} />
        </FilterChip>
        {REQUEST_STATUSES.map((statusOption) => (
          <FilterChip
            key={statusOption}
            href={`/admin/cereri?status=${statusOption}`}
            active={activeStatus === statusOption}
          >
            {STATUS_LABELS[statusOption]} <CountPill count={countMap.get(statusOption) ?? 0} />
          </FilterChip>
        ))}
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={activeStatus ? `Nicio cerere „${STATUS_LABELS[activeStatus]}”` : "Nicio cerere"}
          description="Cererile trimise de clienți din site vor apărea aici."
        />
      ) : (
        <ul className="stagger space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`/admin/cereri/${request.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-zinc-400">
                      {request.code}
                    </span>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-1 truncate font-semibold text-zinc-900">
                    {request.customerName}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatDateTime(request.createdAt)} · {request.phone} ·{" "}
                    {itemCountMap.get(request.id) ?? 0} produse
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-400">
                    {request.deliveryAddress}
                  </p>
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-xs text-zinc-400">Total estimativ</p>
                  <p className="text-base font-bold text-zinc-900">
                    {request.estimatedTotal == null ? "La cerere" : formatPrice(request.estimatedTotal)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150 active:scale-95",
        active
          ? "bg-zinc-900 text-white shadow-sm"
          : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
      )}
    >
      {children}
    </Link>
  );
}

function CountPill({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[11px] font-bold leading-none">
      {count}
    </span>
  );
}
