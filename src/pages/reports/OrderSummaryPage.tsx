import { PageHeader } from "@/components/shared/page-header"
import { OrderSummaryBuyerWiseTable } from "@/components/reports/order-summary-buyer-wise-table"
import { OrderSummaryMonthGaugeTable } from "@/components/reports/order-summary-month-gauge-table"
import { OrderSummaryMonthlyStatusTable } from "@/components/reports/order-summary-monthly-status-table"
import {
  computedOrderSummaryMonthGaugeRows,
  computedOrderSummaryBuyerWiseRows,
  computedOrderSummaryBuyerWiseFooterRows,
  computedOrderSummaryMonthlyStatusCapacities,
  computedOrderSummaryMonthlyStatusRows,
  computedOrderSummaryMonthlyStatusTotals,
} from "@/lib/unified-order-data"

export function OrderSummaryPage() {
  return (
    <div className="space-y-16">
      <PageHeader title="Order Summary" />
      <OrderSummaryMonthlyStatusTable
        capacities={computedOrderSummaryMonthlyStatusCapacities}
        rows={computedOrderSummaryMonthlyStatusRows}
        totals={computedOrderSummaryMonthlyStatusTotals}
      />
      <OrderSummaryMonthGaugeTable rows={computedOrderSummaryMonthGaugeRows} />
      <OrderSummaryBuyerWiseTable
        rows={computedOrderSummaryBuyerWiseRows}
        footerRows={computedOrderSummaryBuyerWiseFooterRows}
      />
    </div>
  )
}
