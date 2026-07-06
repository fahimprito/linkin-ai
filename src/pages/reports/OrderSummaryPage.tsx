import { ManagementSummaryTable } from "@/pages/reports/ManagementSummaryTable"

export function OrderSummaryPage() {
  return (
    <ManagementSummaryTable
      title="Order Summary"
      description="Search buyer or GG to review booking quantity summary for 2026."
      mode="booking"
    />
  )
}
