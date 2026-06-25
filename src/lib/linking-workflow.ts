export const LINKING_STAGE_3_STEPS = [
  "Queue",
  "Store Requisition",
  "Store Issue",
  "Plan",
  "Daily Progress",
  "Transfer",
]

export function getLinkingWorkflowGuidance(currentStage: string) {
  const guidance: Record<string, { summary: string; nextAction: string }> = {
    Queue: {
      summary: "Linking is waiting for knitted output to arrive from Stage 2.",
      nextAction: "Receive the next PO into the Linking queue.",
    },
    "Store Requisition": {
      summary: "The PO is in Linking and the next action is to request supporting materials from Store Control.",
      nextAction: "Create the store requisition for the active PO.",
    },
    "Store Issue": {
      summary: "The requisition has been raised and Store Control now needs to resolve the issue request.",
      nextAction: "Track the Store issuance log and prepare planning after materials arrive.",
    },
    Plan: {
      summary: "Required materials are available and Linking can create the production plan.",
      nextAction: "Set the production start, end date, total days, and daily target.",
    },
    "Daily Progress": {
      summary: "Planning is complete and daily production progress should now be logged.",
      nextAction: "Submit the current daily production report.",
    },
    Transfer: {
      summary: "Linking output is complete and ready to move into the Finishing module.",
      nextAction: "Monitor the next PO entering the Linking queue.",
    },
  }

  return (
    guidance[currentStage] ?? {
      summary: "Linking workflow is active.",
      nextAction: "Continue the next Linking workflow step.",
    }
  )
}
