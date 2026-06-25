export const PO_LIFECYCLE_STAGES = [
  "Draft",
  "Yarn Check",
  "Yarn Ordered",
  "Receiving",
  "Ready",
  "Knitting",
  "Linking",
  "Finishing",
  "Shipped",
]

export function poStatusToStage(status: string): string {
  const mapping: Record<string, string> = {
    Draft: "Draft",
    "Pending Yarn Check": "Yarn Check",
    "Yarn Available": "Ready",
    "Yarn Ordered": "Yarn Ordered",
    "Yarn Receiving": "Receiving",
    "Ready for Production": "Ready",
    Knitting: "Knitting",
    Linking: "Linking",
    Finishing: "Finishing",
    "Finished â€“ Ready to Ship": "Shipped",
  }

  return mapping[status] ?? status
}
