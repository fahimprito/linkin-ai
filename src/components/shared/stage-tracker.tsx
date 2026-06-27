/* eslint-disable react-refresh/only-export-components */
import { Check } from "lucide-react"

import {
  PO_WORKFLOW_STAGES,
  poStatusToWorkflowStage,
} from "@/lib/workflow-status"
import { cn } from "@/lib/utils"

type StageTrackerProps = {
  stages: string[]
  currentStage: string
}

export function StageTracker({ stages, currentStage }: StageTrackerProps) {
  const currentIndex = stages.findIndex(
    (stage) => stage.toLowerCase() === currentStage.toLowerCase()
  )

  return (
    <div className="flex w-full items-center gap-0 overflow-x-auto py-2">
      {stages.map((stage, index) => {
        const isCompleted = currentIndex >= 0 && index < currentIndex
        const isCurrent = index === currentIndex
        const isUpcoming = currentIndex < 0 || index > currentIndex

        return (
          <div key={stage} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                  isCompleted &&
                    "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
                  isCurrent &&
                    "border-sky-500 bg-sky-500/10 text-sky-600 shadow-md shadow-sky-500/20 ring-4 ring-sky-500/15 dark:text-sky-400",
                  isUpcoming &&
                    "border-border/80 bg-secondary/60 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-4" strokeWidth={3} /> : index + 1}
              </div>
              <span
                className={cn(
                  "max-w-[80px] text-center text-[10px] font-medium leading-tight",
                  isCompleted && "text-emerald-600 dark:text-emerald-400",
                  isCurrent && "text-sky-600 dark:text-sky-400",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {stage}
              </span>
            </div>

            {index < stages.length - 1 && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded-full transition-all duration-300",
                  index < currentIndex ? "bg-emerald-500" : "bg-border/60"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export const PO_LIFECYCLE_STAGES = [...PO_WORKFLOW_STAGES]

export function poStatusToStage(status: string): string {
  return poStatusToWorkflowStage(status)
}
