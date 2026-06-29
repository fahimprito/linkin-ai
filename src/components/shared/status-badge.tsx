import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  value: string
}

const toneMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  created: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "sent to design":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "design completed":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "sent to yarn":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "yarn processing":
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "yarn ready":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "sent to store":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "store processing":
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "store ready":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "sent to knitting":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "knitting in progress":
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "knitting completed":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "sent to linking":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "linking in progress":
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "linking completed":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "sent to finishing":
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  "finishing in progress":
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  "ready to ship":
    "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  completed:
    "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100",

  // legacy workflow aliases
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
  "finished â€“ ready to ship":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",

  // non-PO statuses
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
  ready:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  delayed:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "in progress":
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  queued:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  current:
    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  default: "bg-secondary text-secondary-foreground",
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const tone = toneMap[value.toLowerCase()] ?? toneMap.default

  return (
    <span
      className={cn(
        "inline-flex max-w-[6.5rem] whitespace-normal rounded-full px-2.5 py-1 text-center text-xs font-semibold leading-4 tracking-wide",
        tone
      )}
    >
      {value}
    </span>
  )
}
