import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  value: string
}

const toneMap: Record<string, string> = {
  // PO lifecycle statuses
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  "consumption requested":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "pending yarn check":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "yarn available":
    "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  "yarn ordered":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "yarn receiving":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  "ready for production":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "finished – ready to ship":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",

  // Production statuses
  knitting: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  linking:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  finishing:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",

  // Inspection / batch statuses
  pending:
    "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  checking:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  available:
    "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  "not available":
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  ordered:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  receiving:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  fulfilled:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  requested:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  submitted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  received:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  inspected:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  accepted:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",

  // Supplier order statuses
  placed:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "in transit":
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
  "partially received":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "fully received":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "partially issued":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  issued:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",

  // Inventory statuses
  low: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  critical:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  healthy:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  released:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  default: "bg-secondary text-secondary-foreground",
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const tone = toneMap[value.toLowerCase()] ?? toneMap.default

  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        tone
      )}
    >
      {value}
    </span>
  )
}
