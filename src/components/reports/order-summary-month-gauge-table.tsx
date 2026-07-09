import {
  reportMonths,
  type OrderSummaryMetricRow,
  type ReportMonth,
} from "@/types/order-summary"

function isHighlightedMonth(row: OrderSummaryMetricRow, month: ReportMonth) {
  return row.highlightMonths?.includes(month)
}

function isSummaryMonth(month: ReportMonth) {
  return month === "Jun" || month === "July"
}

function getRowBorderClassName(type: OrderSummaryMetricRow["type"]) {
  return type === "avg"
    ? "border-b-[3px] border-b-slate-400 dark:border-b-slate-200"
    : "border-b border-b-border/70"
}

function getRowClassName(type: OrderSummaryMetricRow["type"]) {
  if (type === "qty") {
    return "bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-100"
  }

  if (type === "min") {
    return "bg-slate-50/65 text-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
  }

  return "bg-blue-50/45 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
}

function getLabelCellClassName(type: OrderSummaryMetricRow["type"]) {
  if (type === "qty") {
    return "bg-sky-100/80 text-sky-950 dark:bg-sky-950/40 dark:text-sky-100"
  }

  if (type === "min") {
    return "bg-amber-100/75 text-amber-950 dark:bg-amber-950/35 dark:text-amber-100"
  }

  return "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
}

type OrderSummaryMonthGaugeTableProps = {
  rows: OrderSummaryMetricRow[]
}

export function OrderSummaryMonthGaugeTable({ rows }: OrderSummaryMonthGaugeTableProps) {
  return (
    <section className="w-full overflow-hidden rounded-[1.4rem] border border-border/80 bg-card shadow-sm">
      <div className="w-full border-b border-border/80 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_38%,#f8fbff_100%)] px-4 py-5 dark:bg-[linear-gradient(135deg,#0f172a_0%,#111827_38%,#0b1220_100%)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="mt-1 text-xl font-black tracking-wide text-slate-950 dark:text-slate-100">
              Month/gauge wise qty + minutes (confirmed+pre-booked)
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
              Qty row
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              Min row
            </span>
            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Average row
            </span>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.8)_0%,rgba(255,255,255,0.95)_100%)] dark:bg-none">
        <table className="w-full min-w-full border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="bg-white dark:bg-slate-950">
              <th className="w-[16%] min-w-[13rem] border-b-2 border-r border-slate-300 bg-violet-100 px-3 py-3 text-left text-[11px] font-black uppercase tracking-[0.14em] text-violet-800 dark:border-slate-700 dark:bg-violet-950/35 dark:text-violet-200">
                GG / Minute / Qty
              </th>
              {reportMonths.map((month) => (
                <th
                  key={month}
                  className={`w-[5.4%] min-w-[5.35rem] border-b-2 border-r border-slate-300 px-2 py-3 text-center text-[11px] font-black uppercase tracking-[0.08em] dark:border-slate-700 ${
                    isSummaryMonth(month)
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/35 dark:text-rose-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
                  }`}
                >
                  {month}
                </th>
              ))}
              <th className="w-[10%] min-w-[8.75rem] border-b-2 border-r border-slate-300 bg-amber-100 px-2 py-3 text-center text-[11px] font-black uppercase tracking-[0.08em] text-amber-800 dark:border-slate-700 dark:bg-amber-950/35 dark:text-amber-200">
                Yrly GG Wise TTL Qty+Min
              </th>
              <th className="w-[9%] min-w-[7.5rem] border-b-2 border-slate-300 bg-cyan-100 px-2 py-3 text-center text-[11px] font-black uppercase tracking-[0.08em] text-cyan-800 dark:border-slate-700 dark:bg-cyan-950/35 dark:text-cyan-200">
                Yrly Byr/Brnd Wise Ave. Min
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.label}-${index}`} className={getRowClassName(row.type)}>
                <td
                  className={`border-r border-slate-300 px-3 py-2.5 text-xs font-bold dark:border-slate-700 ${getLabelCellClassName(row.type)} ${getRowBorderClassName(row.type)}`}
                >
                  {row.label}
                </td>
                {reportMonths.map((month) => (
                  <td
                    key={`${row.label}-${month}`}
                    className={`border-r border-slate-300 px-2 py-2.5 text-center text-xs font-semibold dark:border-slate-700 ${getRowBorderClassName(row.type)} ${
                      isHighlightedMonth(row, month)
                        ? "bg-rose-50/70 text-red-600 dark:bg-rose-950/15 dark:text-red-300"
                        : row.type === "qty"
                          ? "text-slate-900 dark:text-slate-100"
                          : row.type === "min"
                            ? "text-slate-700 dark:text-slate-300"
                            : "text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {row.months[month] ?? "-"}
                  </td>
                ))}
                <td
                  className={`border-r border-slate-300 px-2 py-2.5 text-center text-xs font-black italic text-slate-950 dark:border-slate-700 dark:text-slate-100 ${getRowBorderClassName(row.type)}`}
                >
                  {row.yearlyTotal ?? "-"}
                </td>
                <td
                  className={`px-2 py-2.5 text-center text-xs font-black text-slate-950 dark:text-slate-100 ${getRowBorderClassName(row.type)}`}
                >
                  {row.yearlyAverage ?? "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

