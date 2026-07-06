import { getAvailableYarnForPo, sumIssueLogQtyForPo, sumOutputWeightForPo } from "@/lib/knitting-metrics"
import type { PurchaseOrder } from "@/types/modules"
import type {
  KnittingDailyProgress,
  KnittingProductionPlan,
  KnittingYarnIssueLog,
  KnittingYarnRequisition,
  YarnStockMovement,
} from "@/types/production"

export const KNITTING_STAGE_2_STEPS = [
  "Queue",
  "Requisition",
  "Yarn Issue",
  "Plan",
  "Daily Progress",
  "Waste Log",
  "Transfer",
]

export function getKnittingWorkflowStageForPo({
  po,
  requisitions,
  issueLogs,
  plans,
  progressEntries,
}: {
  po: PurchaseOrder
  requisitions: KnittingYarnRequisition[]
  issueLogs: KnittingYarnIssueLog[]
  plans: KnittingProductionPlan[]
  progressEntries: KnittingDailyProgress[]
}) {
  const hasRequisition = requisitions.some(
    (requisition) => requisition.poId === po.id
  )
  const issuedQty = sumIssueLogQtyForPo(issueLogs, po.id)
  const hasPlan = plans.some((plan) => plan.poId === po.id)
  const hasProgress = progressEntries.some((entry) => entry.poId === po.id)
  const outputWeight = sumOutputWeightForPo(progressEntries, po.id)

  if (po.status === "Linking" || po.status === "Finishing") {
    return "Transfer"
  }

  if (outputWeight > 0) {
    return "Waste Log"
  }

  if (hasProgress) {
    return "Daily Progress"
  }

  if (hasPlan) {
    return "Plan"
  }

  if (issuedQty > 0) {
    return "Yarn Issue"
  }

  if (hasRequisition) {
    return "Requisition"
  }

  return "Queue"
}

export function getKnittingWorkflowGuidance(currentStage: string) {
  const guidance: Record<
    string,
    { summary: string; nextAction: string }
  > = {
    Queue: {
      summary: "PO has entered Stage 2 and is waiting for knitting team action.",
      nextAction: "Create the yarn requisition from Knitting.",
    },
    Requisition: {
      summary: "Knitting has requested yarn and the requisition is waiting for Yarn Control.",
      nextAction: "Verify stock and issue yarn against the requisition.",
    },
    "Yarn Issue": {
      summary: "Yarn issuance has started and the PO is ready for planning once stock is enough.",
      nextAction: "Complete yarn issuing or move to production planning.",
    },
    Plan: {
      summary: "Yarn is available on the floor and the PO is waiting for its knitting plan.",
      nextAction: "Create the production plan with dates and daily target.",
    },
    "Daily Progress": {
      summary: "Knitting has started and the team should keep submitting daily production.",
      nextAction: "Log today's progress and finished output weight.",
    },
    "Waste Log": {
      summary: "Issued yarn and finished output are both logged, so waste tracking is active.",
      nextAction: "Continue progress updates until the PO transfers to Linking.",
    },
    Transfer: {
      summary: "Knitting is complete and the PO has been handed to Linking.",
      nextAction: "Continue with Stage 3 in the Linking module.",
    },
  }

  return (
    guidance[currentStage] ?? {
      summary: "Stage 2 workflow is active.",
      nextAction: "Continue the next operational step.",
    }
  )
}

export function getRequisitionResolutionSnapshot({
  requisition,
  issueLogs,
  stockMovements,
}: {
  requisition: KnittingYarnRequisition
  issueLogs: KnittingYarnIssueLog[]
  stockMovements: YarnStockMovement[]
}) {
  const issuedQty = sumIssueLogQtyForPo(issueLogs, requisition.poId)
  const remainingQty = Math.max(0, requisition.requiredQty - issuedQty)
  const availableQty = getAvailableYarnForPo(stockMovements, requisition.poId)
  const percentIssued =
    requisition.requiredQty > 0
      ? Math.min(100, Math.round((issuedQty / requisition.requiredQty) * 100))
      : 0

  let actionLabel = "Solved"
  let tone: "success" | "warning" | "danger" = "success"

  if (remainingQty > 0 && availableQty > 0 && issuedQty === 0) {
    actionLabel = "Issue Yarn Now"
    tone = "success"
  } else if (remainingQty > 0 && availableQty > 0) {
    actionLabel = "Issue Balance"
    tone = "warning"
  } else if (remainingQty > 0) {
    actionLabel = "Blocked by Stock"
    tone = "danger"
  }

  return {
    issuedQty,
    remainingQty,
    availableQty,
    percentIssued,
    actionLabel,
    tone,
  }
}


