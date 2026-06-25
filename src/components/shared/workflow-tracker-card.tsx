import { StageTracker } from "@/components/shared/stage-tracker"
import { StatusBadge } from "@/components/shared/status-badge"

type WorkflowTrackerCardProps = {
  badgeValue?: string
  helperText?: string
  nextAction: string
  stages: string[]
  summary: string
  title: string
  trackerLabel: string
  currentStage: string
}

export function WorkflowTrackerCard({
  badgeValue,
  helperText,
  nextAction,
  stages,
  summary,
  title,
  trackerLabel,
  currentStage,
}: WorkflowTrackerCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {trackerLabel}
          </p>
          <h2 className="mt-2 text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
          <p className="mt-2 text-sm font-medium text-primary">
            Next action: {nextAction}
          </p>
        </div>
        {badgeValue ? <StatusBadge value={badgeValue} /> : null}
      </div>
      {helperText ? (
        <div className="mt-4 rounded-2xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          {helperText}
        </div>
      ) : null}
      <div className="mt-4">
        <StageTracker stages={stages} currentStage={currentStage} />
      </div>
    </section>
  )
}
