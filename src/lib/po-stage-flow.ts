export const PO_LIFECYCLE_STAGES = [
  "Draft",
  "Yarn Check",
  "Yarn Ordered",
  "Receiving",
  "Ready for Production",
]

export function poStatusToStage(status: string): string {
  const mapping: Record<string, string> = {
    Draft: "Draft",
    "Pending Yarn Check": "Yarn Check",
    "Yarn Available": "Ready for Production",
    "Yarn Ordered": "Yarn Ordered",
    "Yarn Receiving": "Receiving",
    "Ready for Production": "Ready for Production",
    Knitting: "Ready for Production",
    Linking: "Ready for Production",
    Finishing: "Ready for Production",
    "Finished â€“ Ready to Ship": "Shipped",
  }

  return mapping[status] ?? status
}
