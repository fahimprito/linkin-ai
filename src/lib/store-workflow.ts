export const STORE_SERVICE_STEPS = [
  "Incoming Requisition",
  "Review Need",
  "Issue Materials",
  "Log",
]

export function getStoreWorkflowGuidance(currentStage: string) {
  const guidance: Record<string, { summary: string; nextAction: string }> = {
    "Incoming Requisition": {
      summary: "Store Controller is waiting for a requisition from Linking or Finishing.",
      nextAction: "Review the next incoming requisition when production requests materials.",
    },
    "Review Need": {
      summary: "A requisition is available and Store Controller should confirm the required materials and quantities.",
      nextAction: "Prepare the requested materials for issuing.",
    },
    "Issue Materials": {
      summary: "Store Controller can issue the requested items to production.",
      nextAction: "Log the issued quantity and update the requisition status.",
    },
    Log: {
      summary: "Material issuance has been completed and the log is now part of the audit trail.",
      nextAction: "Wait for the next requisition or continue issuing remaining quantities.",
    },
  }

  return (
    guidance[currentStage] ?? {
      summary: "Store service workflow is active.",
      nextAction: "Continue the next store control step.",
    }
  )
}
