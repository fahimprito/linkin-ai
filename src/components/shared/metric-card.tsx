import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  tone?: "default" | "success" | "warning" | "danger"
  icon?: LucideIcon
}

const cardToneMap = {
  default:
    "bg-[linear-gradient(135deg,_rgba(59,130,246,0.08),_rgba(255,255,255,0.88))] dark:bg-[linear-gradient(135deg,_rgba(59,130,246,0.10),_rgba(24,24,27,0.92))]",
  success:
    "bg-[linear-gradient(135deg,_rgba(34,197,94,0.09),_rgba(255,255,255,0.88))] dark:bg-[linear-gradient(135deg,_rgba(34,197,94,0.12),_rgba(24,24,27,0.92))]",
  warning:
    "bg-[linear-gradient(135deg,_rgba(245,158,11,0.10),_rgba(255,255,255,0.88))] dark:bg-[linear-gradient(135deg,_rgba(245,158,11,0.12),_rgba(24,24,27,0.92))]",
  danger:
    "bg-[linear-gradient(135deg,_rgba(244,63,94,0.08),_rgba(255,255,255,0.88))] dark:bg-[linear-gradient(135deg,_rgba(244,63,94,0.12),_rgba(24,24,27,0.92))]",
}

const iconToneMap = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
}

export function MetricCard({
  label,
  value,
  tone = "default",
  icon: Icon,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 p-5 shadow-sm",
        cardToneMap[tone]
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon ? (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              iconToneMap[tone]
            )}
          >
            <Icon className="size-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-1">
        <span className="text-3xl font-semibold tracking-tight">{value}</span>
      </div>
    </div>
  )
}
