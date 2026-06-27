import {
  PO_WORKFLOW_STAGES,
  poStatusToWorkflowStage,
} from "@/lib/workflow-status"

export const PO_LIFECYCLE_STAGES = [...PO_WORKFLOW_STAGES]

export function poStatusToStage(status: string): string {
  return poStatusToWorkflowStage(status)
}
