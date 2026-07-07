import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import {
  orderSummaryMonthGaugeRows,
  reportMonths,
  type OrderSummaryMetricRow,
  type ReportMonth,
} from "@/mock/order-summary"

function isHighlightedMonth(row: OrderSummaryMetricRow, month: ReportMonth) {
  return row.highlightMonths?.includes(month)
}

function getRowBorderClassName(type: OrderSummaryMetricRow["type"]) {
  return type === "avg"
    ? "border-b-[3px] border-b-slate-400/90 dark:border-b-slate-200/80"
    : "border-b border-b-border/70"
}

function getRowClassName(type: OrderSummaryMetricRow["type"]) {
  if (type === "qty") {
    return "font-semibold text-slate-900 dark:text-slate-100"
  }

  if (type === "min") {
    return "text-slate-700 dark:text-slate-300"
  }

  return "text-slate-600 dark:text-slate-400"
}

export function OrderSummaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Order Summary" />

      <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/80 bg-slate-50 px-4 py-4 text-center dark:bg-slate-900/80">
          <h2 className="text-lg font-bold tracking-wide text-slate-900 dark:text-slate-100">
            Month/gauge wise qty + minutes (confirmed+pre-booked)
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Demo data for now. This table will later calculate from other module tables.
          </p>
        </div>

        {orderSummaryMonthGaugeRows.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1240px] border-separate border-spacing-0 text-xs">
              <thead>
                <tr className="bg-white dark:bg-slate-950">
                  <th className="min-w-40 border-b border-r border-border/80 bg-slate-100 px-2 py-2.5 text-left font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                    GG/Minute/Qty
                  </th>
                  {reportMonths.map((month) => (
                    <th
                      key={month}
                      className={`min-w-[5.9rem] border-b border-r border-border/80 px-2 py-2.5 text-center font-semibold ${
                        month === "Jun" || month === "July"
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                          : "bg-slate-50 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                      }`}
                    >
                      {month}
                    </th>
                  ))}
                  <th className="min-w-[7.25rem] border-b border-r border-border/80 bg-amber-50 px-2 py-2.5 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                    Yrly GG Wise TTL Qty+Min
                  </th>
                  <th className="min-w-[6rem] border-b border-border/80 bg-cyan-50 px-2 py-2.5 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                    Yrly Byr/Brnd Wise Ave. Min
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderSummaryMonthGaugeRows.map((row, index) => (
                  <tr key={`${row.label}-${index}`} className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                    <td className={`border-r bg-inherit px-2 py-2.5 font-semibold text-slate-800 dark:text-slate-100 ${getRowBorderClassName(row.type)}`}>
                      {row.label}
                    </td>
                    {reportMonths.map((month) => (
                      <td
                        key={`${row.label}-${month}`}
                        className={`border-r px-2 py-2.5 text-center ${getRowBorderClassName(row.type)} ${getRowClassName(row.type)} ${
                          isHighlightedMonth(row, month)
                            ? "text-red-600 dark:text-red-300"
                            : ""
                        }`}
                      >
                        {row.months[month] ?? "-"}
                      </td>
                    ))}
                    <td className={`border-r px-2 py-2.5 text-center font-bold italic text-slate-900 dark:text-slate-100 ${getRowBorderClassName(row.type)}`}>
                      {row.yearlyTotal ?? "-"}
                    </td>
                    <td className={`px-2 py-2.5 text-center font-bold text-slate-900 dark:text-slate-100 ${getRowBorderClassName(row.type)}`}>
                      {row.yearlyAverage ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No order summary data"
            description="Month/gauge wise summary will appear here when report data is ready."
          />
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="border-b border-border/80 bg-slate-50 px-4 py-4 dark:bg-slate-900/80">
          <h2 className="text-center text-lg font-bold tracking-wide text-slate-900 dark:text-slate-100">
            Buyer wise (confirmed+pre+booked)
          </h2>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            The second buyer-wise table will be added here in the next step.
          </p>
        </div>
        <div className="px-4 py-8">
          <EmptyState
            title="Buyer-wise table coming next"
            description="Heading is set. We can build the second table structure in the next pass."
          />
        </div>
      </section>
    </div>
  )
}




