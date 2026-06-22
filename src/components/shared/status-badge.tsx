import { cn } from "@/lib/utils"

type StatusBadgeProps = {
  value: string
}

const toneMap: Record<string, string> = {
  knitting: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  linking: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  finishing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  low: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  healthy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  released: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  default: "bg-secondary text-secondary-foreground",
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const tone = toneMap[value.toLowerCase()] ?? toneMap.default

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        tone
      )}
    >
      {value}
    </span>
  )
}
