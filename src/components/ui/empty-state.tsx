import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-zinc-100">
        <Icon className="size-7 text-zinc-400" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
