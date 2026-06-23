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

export function MetricCard({
  label,
  value,
  delta,
  tone = "default",
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-border/70 p-5 shadow-sm",
        cardToneMap[tone]
      )}
    >
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
