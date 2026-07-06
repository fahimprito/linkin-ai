import type { POStatus } from "@/types/modules"

export const PO_WORKFLOW_STAGES = [
  "Draft",
  "Design",
  "Yarn",
  "Store",
  "Knitting",
  "Linking",
  "Finishing",
  "Ready to Ship",
  "Completed",
] as const

export const workflowProgressByStatus: Record<POStatus, number> = {
  Draft: 5,
  Created: 10,
  "Sent to Design": 18,
  "Design Completed": 25,
  "Sent to Yarn": 32,
  "Yarn Processing": 42,
  "Yarn Ready": 52,
  "Sent to Store": 58,
  "Store Processing": 64,
  "Store Ready": 70,
  "Sent to Knitting": 76,
  "Knitting In Progress": 82,
  "Knitting Completed": 86,
  "Sent to Linking": 89,
  "Linking In Progress": 92,
  "Linking Completed": 94,
  "Sent to Finishing": 96,
  "Finishing In Progress": 98,
  "Ready to Ship": 99,
  Completed: 100,
}

export function poStatusToWorkflowStage(status: string) {
  const mapping: Record<string, string> = {
    Draft: "Draft",
    Created: "Draft",
    "Sent to Design": "Design",
    "Design Completed": "Design",
    "Sent to Yarn": "Yarn",
    "Yarn Processing": "Yarn",
    "Yarn Ready": "Yarn",
    "Sent to Store": "Store",
    "Store Processing": "Store",
    "Store Ready": "Store",
    "Sent to Knitting": "Knitting",
    "Knitting In Progress": "Knitting",
    "Knitting Completed": "Knitting",
    "Sent to Linking": "Linking",
    "Linking In Progress": "Linking",
    "Linking Completed": "Linking",
    "Sent to Finishing": "Finishing",
    "Finishing In Progress": "Finishing",
    "Ready to Ship": "Ready to Ship",
    Completed: "Completed",
  }

  return mapping[status] ?? status
}

export function normalizeLegacyPoStatus(status: string): POStatus {
  const mapping: Record<string, POStatus> = {
    Draft: "Created",
    "Consumption Requested": "Sent to Design",
    "Pending Yarn Check": "Sent to Yarn",
    "Yarn Ordered": "Yarn Processing",
    "Yarn Receiving": "Yarn Processing",
    "Yarn Available": "Yarn Ready",
    "Ready for Production": "Sent to Knitting",
    Knitting: "Knitting In Progress",
    Linking: "Linking In Progress",
    Finishing: "Finishing In Progress",
    "Finished – Ready to Ship": "Ready to Ship",
    "Finished â€“ Ready to Ship": "Ready to Ship",
  }

  return (mapping[status] ?? status) as POStatus
}

export function isStatusAtOrAfterSentToYarn(status: string) {
  return [
    "Sent to Yarn",
    "Yarn Processing",
    "Yarn Ready",
    "Sent to Store",
    "Store Processing",
    "Store Ready",
    "Sent to Knitting",
    "Knitting In Progress",
    "Knitting Completed",
    "Sent to Linking",
    "Linking In Progress",
    "Linking Completed",
    "Sent to Finishing",
    "Finishing In Progress",
    "Ready to Ship",
    "Completed",
  ].includes(status)
}

export function isStatusInKnittingQueue(status: string) {
  return [
    "Sent to Knitting",
    "Knitting In Progress",
    "Knitting Completed",
    "Sent to Linking",
  ].includes(status)
}


