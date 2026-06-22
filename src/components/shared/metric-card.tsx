import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  delta: string
  tone?: "default" | "success" | "warning" | "danger"
}

const deltaToneMap = {
  default: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-rose-600 dark:text-rose-300",
}

export function MetricCard({
  label,
  value,
  delta,
  tone = "default",
}: MetricCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
        <span className={cn("text-sm font-semibold", deltaToneMap[tone])}>
          {delta}
        </span>
      </div>
    </div>
  )
}
