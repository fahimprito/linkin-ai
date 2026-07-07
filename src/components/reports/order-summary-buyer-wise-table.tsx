import { Fragment } from "react"

import {
  orderSummaryBuyerWiseFooterRows,
  reportMonths,
  type BuyerWiseOrderSummaryFooterRow,
  type BuyerWiseOrderSummaryRow,
  type ReportMonth,
} from "@/mock/order-summary"

function isHighlightMonth(month: ReportMonth) {
  return month === "Jun" || month === "July"
}

type OrderSummaryBuyerWiseTableProps = {
  rows: BuyerWiseOrderSummaryRow[]
}

function getFooterBorderClassName(label: string) {
  return label === "AVE. MIN/MONTH"
    ? "border-b-[3px] border-b-slate-400/90 dark:border-b-slate-200/80"
    : "border-b border-b-border/70"
}

function renderFooterRow(row: BuyerWiseOrderSummaryFooterRow) {
  return (
    <tr key={row.label} className="bg-card">
      <td
        colSpan={2}
        className={`border-r px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100 ${getFooterBorderClassName(row.label)}`}
      >
        {row.label}
      </td>
      {reportMonths.map((month) => (
        <td
          key={`${row.label}-${month}`}
          className={`border-r px-2 py-2 text-center font-bold ${
            isHighlightMonth(month) ? "text-red-600 dark:text-red-300" : "text-slate-900 dark:text-slate-100"
          } ${getFooterBorderClassName(row.label)}`}
        >
          {row.months[month] ?? ""}
        </td>
      ))}
      <td
        className={`border-r px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100 ${getFooterBorderClassName(row.label)}`}
      >
        {row.yearlyTotal ?? ""}
      </td>
      <td
        className={`px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100 ${getFooterBorderClassName(row.label)}`}
      >
        {row.yearlyAverage ?? ""}
      </td>
    </tr>
  )
}

export function OrderSummaryBuyerWiseTable({ rows }: OrderSummaryBuyerWiseTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="border-b border-border/80 bg-slate-50 px-4 py-4 text-center dark:bg-slate-900/80">
        <h2 className="text-lg font-bold tracking-wide text-slate-900 dark:text-slate-100">
          Buyer wise (confirmed+pre-booked) qty/min per month
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Demo data for now. This table will later calculate automatically from confirmed and pre-booked tables.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1540px] border-separate border-spacing-0 text-[11px]">
          <thead>
            <tr className="bg-white dark:bg-slate-950">
              <th className="min-w-[2.5rem] border-b border-r border-border/80 bg-slate-100 px-1.5 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                SL.
              </th>
              <th className="min-w-[10rem] border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                Buyer Name
              </th>
              {reportMonths.map((month) => (
                <th
                  key={month}
                  className={`min-w-[6.05rem] border-b border-r border-border/80 px-2 py-2 text-center font-semibold ${
                    isHighlightMonth(month)
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                      : "bg-slate-50 text-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                  }`}
                >
                  {month}
                </th>
              ))}
              <th className="min-w-[8.5rem] border-b border-r border-border/80 bg-amber-50 px-2 py-2 text-center font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                Yrly Byr/Brnd Wise TTL Qty+Min
              </th>
              <th className="min-w-[6.4rem] border-b border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                Yrly Byr/Brnd Ave. Min/Mon
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <Fragment key={row.serial}>
                <tr className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                  <td rowSpan={2} className="border-r border-b-[3px] border-b-slate-400/90 border-border/70 px-1.5 py-2 align-top text-center font-semibold text-violet-700 dark:border-b-slate-200/80 dark:text-violet-300">
                    {row.serial}
                  </td>
                  <td rowSpan={2} className={`border-r border-b-[3px] border-b-slate-400/90 border-border/70 px-2 py-2 align-top text-center font-semibold text-slate-900 dark:border-b-slate-200/80 dark:text-slate-100 ${row.buyerCellClassName ?? "bg-cyan-100/80 dark:bg-cyan-950/40"}`}>
                    {row.buyerName}
                  </td>
                  {reportMonths.map((month) => (
                    <td
                      key={`${row.serial}-${month}-qty`}
                      className="border-r border-b border-dotted border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100"
                    >
                      {row.months[month]?.qty ?? ""}
                    </td>
                  ))}
                  <td className="border-r border-b border-dotted border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                    {row.yearlyQty}
                  </td>
                  <td rowSpan={2} className="border-b-[3px] border-b-slate-400/90 px-2 py-2 align-middle text-center font-bold text-slate-900 dark:border-b-slate-200/80 dark:text-slate-100">
                    {row.yearlyAverage}
                  </td>
                </tr>
                <tr className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                  {reportMonths.map((month) => (
                    <td
                      key={`${row.serial}-${month}-min`}
                      className="border-r border-b-[3px] border-b-slate-400/90 border-dotted border-border/70 px-2 py-2 text-center font-semibold text-slate-700 dark:border-b-slate-200/80 dark:text-slate-300"
                    >
                      {row.months[month]?.min ?? ""}
                    </td>
                  ))}
                  <td className="border-r border-b-[3px] border-b-slate-400/90 border-dotted border-border/70 px-2 py-2 text-center font-bold text-slate-700 dark:border-b-slate-200/80 dark:text-slate-300">
                    {row.yearlyMin}
                  </td>
                </tr>
              </Fragment>
            ))}
            {orderSummaryBuyerWiseFooterRows.map(renderFooterRow)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
