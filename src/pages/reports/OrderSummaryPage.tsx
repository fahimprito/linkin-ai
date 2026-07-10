import { PageHeader } from "@/components/shared/page-header"
import { OrderSummaryBuyerWiseTable } from "@/components/reports/order-summary-buyer-wise-table"
import { OrderSummaryMonthGaugeTable } from "@/components/reports/order-summary-month-gauge-table"
import { OrderSummaryMonthlyStatusTable } from "@/components/reports/order-summary-monthly-status-table"
import {
  computedOrderSummaryMonthGaugeRows,
  computedOrderSummaryBuyerWiseRows,
  computedOrderSummaryBuyerWiseFooterRows,
} from "@/lib/unified-order-data"
import {
  orderSummaryMonthlyStatusCapacities,
  orderSummaryMonthlyStatusRows,
  orderSummaryMonthlyStatusTotals,
} from "@/mock/order-summary"

export function OrderSummaryPage() {
  return (
    <div className="space-y-16">
      <PageHeader title="Order Summary" />
      <OrderSummaryMonthlyStatusTable
        capacities={orderSummaryMonthlyStatusCapacities}
        rows={orderSummaryMonthlyStatusRows}
        totals={orderSummaryMonthlyStatusTotals}
      />
      <OrderSummaryMonthGaugeTable rows={computedOrderSummaryMonthGaugeRows} />
      <OrderSummaryBuyerWiseTable
        rows={computedOrderSummaryBuyerWiseRows}
        footerRows={computedOrderSummaryBuyerWiseFooterRows}
      />
    </div>
  )
}
