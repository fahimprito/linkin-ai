import {
  orderSummaryMonthlyStatusCapacities,
  orderSummaryMonthlyStatusRows,
  orderSummaryMonthlyStatusTotals,
} from "@/mock/order-summary"

function getRowTextClassName(highlight?: boolean) {
  return highlight
    ? "text-red-600 dark:text-red-300"
    : "text-slate-900 dark:text-slate-100"
}

type CapacityDisplay = {
  label: string
  value: string
  isSectionHeader?: boolean
  isGrandTotal?: boolean
}

function getCapacityDisplay(index: number): CapacityDisplay {
  if (index < 5) {
    const capacity = orderSummaryMonthlyStatusCapacities[index]

    return {
      label: capacity?.label ?? "",
      value: capacity?.monthlyCapacity ?? "",
      isGrandTotal: capacity?.label === "G.T",
    }
  }

  if (index === 5) {
    return {
      label: "GG",
      value: "GG/Qty Wise Capacity Per Month",
      isSectionHeader: true,
    }
  }

  const qtyCapacity = orderSummaryMonthlyStatusCapacities[index - 6]

  return {
    label: qtyCapacity?.label ?? "",
    value: qtyCapacity?.qtyCapacity ?? "",
    isGrandTotal: qtyCapacity?.label === "G.T",
  }
}

export function OrderSummaryMonthlyStatusTable() {
  return (
    <section className="w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="w-full border-b border-border/80 bg-slate-50 px-4 py-4 text-center dark:bg-slate-900/80">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
          Monthly Operations Report
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-wide text-slate-900 dark:text-slate-100">
          Monthly Order Status 2026
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">Date: 6TH JAN 2026 TO 5TH JAN 2027</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
          <span>BEST WOOL SWEATERS LTD. + EXTENSION</span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
          <span>DYNAMIC SWEATER INDUSTRIES LTD.</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-white dark:bg-slate-950">
              <th className="w-[4%] min-w-[2.5rem] border-b border-r border-border/80 bg-slate-100 px-1.5 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                GG
              </th>
              <th className="w-[18%] min-w-[12rem] border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                GG/Min Wise Capacity Per Month
              </th>
              <th className="w-[5%] min-w-[3rem] border-b border-r border-border/80 bg-slate-100 px-1.5 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                SL
              </th>
              <th className="w-[12%] min-w-[8rem] border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                Month
              </th>
              <th className="w-[20%] min-w-[9rem] border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                TTL Qty/Month (CFMD+Booked)
              </th>
              <th className="w-[20%] min-w-[9rem] border-b border-r border-border/80 bg-indigo-50 px-2 py-2 text-center font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200">
                Total Min/Month
              </th>
              <th className="w-[21%] min-w-[8rem] border-b border-border/80 bg-rose-50 px-2 py-2 text-center font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
                Min/Mon (Left/Over)
              </th>
            </tr>
          </thead>
          <tbody>
            {orderSummaryMonthlyStatusRows.map((row, index) => {
              const capacityDisplay = getCapacityDisplay(index)
              const textClassName = getRowTextClassName(row.highlight)

              return (
                <tr key={row.serial} className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                  <td
                    className={`border-r border-b border-border/70 px-1.5 py-2 text-center font-semibold italic ${
                      capacityDisplay.isGrandTotal || capacityDisplay.isSectionHeader
                        ? "bg-slate-100 dark:bg-slate-800/80"
                        : ""
                    } ${capacityDisplay.isSectionHeader ? "not-italic" : ""} ${textClassName}`}
                  >
                    {capacityDisplay.label}
                  </td>
                  <td
                    className={`border-r border-b border-border/70 px-2 py-2 text-center font-bold italic ${
                      capacityDisplay.isGrandTotal || capacityDisplay.isSectionHeader
                        ? "bg-slate-100 dark:bg-slate-800/80"
                        : ""
                    } ${capacityDisplay.isSectionHeader ? "not-italic" : ""} ${textClassName}`}
                  >
                    {capacityDisplay.value}
                  </td>
                  <td className={`border-r border-b border-border/70 px-1.5 py-2 text-center font-semibold ${textClassName}`}>
                    {row.serial}
                  </td>
                  <td className={`border-r border-b border-border/70 px-2 py-2 text-center font-semibold ${textClassName}`}>
                    {row.month}
                  </td>
                  <td className={`border-r border-b border-border/70 px-2 py-2 text-center font-bold ${textClassName}`}>
                    {row.totalQty}
                  </td>
                  <td className={`border-r border-b border-border/70 px-2 py-2 text-center font-bold ${textClassName}`}>
                    {row.totalMin}
                  </td>
                  <td className={`border-b border-border/70 px-2 py-2 text-center font-bold ${textClassName}`}>
                    {row.leftOverMin}
                  </td>
                </tr>
              )
            })}
            <tr className="bg-slate-100 dark:bg-slate-900/80">
              <td className="border-r border-b-[3px] border-border/80 px-1.5 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                G.T
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                1443728 Pcs
              </td>
              <td
                colSpan={2}
                className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100"
              >
                TOTAL
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                {orderSummaryMonthlyStatusTotals.totalQty}
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                {orderSummaryMonthlyStatusTotals.totalMin}
              </td>
              <td className="border-b-[3px] border-border/80 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100" />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
