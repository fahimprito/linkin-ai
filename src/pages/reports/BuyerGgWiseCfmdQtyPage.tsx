import { ManagementSummaryTable } from "@/pages/reports/ManagementSummaryTable"

export function BuyerGgWiseCfmdQtyPage() {
  return (
    <ManagementSummaryTable
      title="Buyer.GG Wise CFMD Qty"
      description="Search buyer or GG to review confirmed quantities by buyer and gauge."
      mode="confirmed"
    />
  )
}
