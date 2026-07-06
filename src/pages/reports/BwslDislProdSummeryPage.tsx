import { ManagementSummaryTable } from "@/pages/reports/ManagementSummaryTable"

export function BwslDislProdSummeryPage() {
  return (
    <ManagementSummaryTable
      title="BWSL&DISL Prod Summery"
      description="Search buyer or GG to review production summary for 2026."
      mode="production"
    />
  )
}
