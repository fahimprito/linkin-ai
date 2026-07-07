import { PageHeader } from "@/components/shared/page-header"
import { orderSummaryBuyerWiseRows, orderSummaryMonthGaugeRows } from "@/mock/order-summary"
import { OrderSummaryBuyerWiseTable } from "@/components/reports/order-summary-buyer-wise-table"
import { OrderSummaryMonthGaugeTable } from "@/components/reports/order-summary-month-gauge-table"
import { OrderSummaryMonthlyStatusTable } from "@/components/reports/order-summary-monthly-status-table"

export function OrderSummaryPage() {
  return (
    <div className="space-y-16">
      <PageHeader title="Order Summary" />
      <OrderSummaryMonthlyStatusTable />
      <OrderSummaryMonthGaugeTable rows={orderSummaryMonthGaugeRows} />
      <OrderSummaryBuyerWiseTable rows={orderSummaryBuyerWiseRows} />
    </div>
  )
}
