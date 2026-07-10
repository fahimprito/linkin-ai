import type {
  OrderSummaryMonthlyStatusCapacityRow,
  OrderSummaryMonthlyStatusRow,
  OrderSummaryMonthlyStatusTotals,
} from "@/types/order-summary"

type CapacityDisplay = {
  label: string
  value: string
  isSectionHeader?: boolean
  isGrandTotal?: boolean
}

type OrderSummaryMonthlyStatusTableProps = {
  capacities: OrderSummaryMonthlyStatusCapacityRow[]
  rows: OrderSummaryMonthlyStatusRow[]
  totals: OrderSummaryMonthlyStatusTotals
}

function getCapacityDisplay(capacities: OrderSummaryMonthlyStatusCapacityRow[], index: number): CapacityDisplay {
  if (index < 5) {
    const capacity = capacities[index]

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

  const qtyCapacity = capacities[index - 6]

  return {
    label: qtyCapacity?.label ?? "",
    value: qtyCapacity?.qtyCapacity ?? "",
    isGrandTotal: qtyCapacity?.label === "G.T",
  }
}

function getCapacityCellClassName(capacityDisplay: CapacityDisplay) {
  return [
    "border-r border-b border-border/70 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100",
    capacityDisplay.isGrandTotal || capacityDisplay.isSectionHeader
      ? "bg-slate-100 dark:bg-slate-800/80"
      : "",
    capacityDisplay.isSectionHeader ? "not-italic" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export function OrderSummaryMonthlyStatusTable({ capacities, rows, totals }: OrderSummaryMonthlyStatusTableProps) {
  const totalQtyCapacity = capacities.find((capacity) => capacity.label === "G.T")?.qtyCapacity ?? ""

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
        <table className="w-full min-w-[1600px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-white dark:bg-slate-950">
              <th className="w-[4%] min-w-[2.5rem] border-b border-r border-border/80 bg-slate-100 px-1.5 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                GG
              </th>
              <th className="w-[17%] min-w-[12rem] border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                GG/MIN WISE CAPACITY/MONTH
              </th>
              <th className="w-[5%] min-w-[3rem] border-b border-r border-border/80 bg-slate-100 px-1.5 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                SL
              </th>
              <th className="w-[8%] min-w-[6rem] border-b border-r border-border/80 bg-slate-100 px-2 py-2 text-center font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                MONTH
              </th>
              <th className="w-[15%] min-w-[11rem] border-b border-r border-border/80 bg-cyan-50 px-2 py-2 text-center font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                QTY/MONTH(CFMD+PRE-BOOKED)
              </th>
              <th className="w-[15%] min-w-[11rem] border-b border-r border-border/80 bg-indigo-50 px-2 py-2 text-center font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200">
                MIN/MONTH(CFMD+PRE-BOOKED)
              </th>
              <th className="w-[14%] min-w-[11rem] border-b border-r border-border/80 bg-rose-50 px-2 py-2 text-center font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-200">
                LEFT/OVER MIN/MON
              </th>
              <th className="w-[9%] min-w-[7.5rem] border-b border-r border-border/80 bg-lime-100 px-2 py-2 text-center font-semibold text-lime-900 dark:bg-lime-950/40 dark:text-lime-100">
                ORDER QTY/INV
              </th>
              <th className="w-[9%] min-w-[7.5rem] border-b border-r border-border/80 bg-lime-100 px-2 py-2 text-center font-semibold text-lime-900 dark:bg-lime-950/40 dark:text-lime-100">
                SHIPPED QTY/INV
              </th>
              <th className="w-[8%] min-w-[7rem] border-b border-r border-border/80 bg-lime-100 px-2 py-2 text-center font-semibold text-lime-900 dark:bg-lime-950/40 dark:text-lime-100">
                EXCESS QTY/INV
              </th>
              <th className="w-[10%] min-w-[9rem] border-b border-border/80 bg-lime-200 px-2 py-2 text-center font-semibold text-lime-950 dark:bg-lime-900/60 dark:text-lime-50">
                SHIPPED VALUE/INV
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const capacityDisplay = getCapacityDisplay(capacities, index)

              return (
                <tr key={row.serial} className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                  <td className={getCapacityCellClassName(capacityDisplay)}>{capacityDisplay.label}</td>
                  <td className={getCapacityCellClassName(capacityDisplay)}>{capacityDisplay.value}</td>
                  <td className="border-r border-b border-border/70 px-1.5 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                    {row.serial}
                  </td>
                  <td className="border-r border-b border-border/70 px-2 py-2 text-center font-semibold text-slate-900 dark:text-slate-100">
                    {row.month}
                  </td>
                  <td className="border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                    {row.totalQty}
                  </td>
                  <td className="border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                    {row.totalMin}
                  </td>
                  <td className="border-r border-b border-border/70 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100">
                    {row.leftOverMin}
                  </td>
                  <td className="border-r border-b border-border/70 bg-lime-50 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-950/20 dark:text-slate-100">
                    {row.orderQtyInv}
                  </td>
                  <td className="border-r border-b border-border/70 bg-lime-50 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-950/20 dark:text-slate-100">
                    {row.shippedQtyInv}
                  </td>
                  <td className="border-r border-b border-border/70 bg-lime-50 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-950/20 dark:text-slate-100">
                    {row.excessQtyInv}
                  </td>
                  <td className="border-b border-border/70 bg-lime-100 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-900/30 dark:text-slate-100">
                    {row.shippedValueInv}
                  </td>
                </tr>
              )
            })}
            <tr className="bg-slate-100 dark:bg-slate-900/80">
              <td className="border-r border-b-[3px] border-border/80 px-1.5 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                G.T
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                {totalQtyCapacity}
              </td>
              <td
                colSpan={2}
                className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100"
              >
                TOTAL
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                {totals.totalQty}
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold italic text-slate-900 dark:text-slate-100">
                {totals.totalMin}
              </td>
              <td className="border-r border-b-[3px] border-border/80 px-2 py-2 text-center font-bold text-slate-900 dark:text-slate-100" />
              <td className="border-r border-b-[3px] border-border/80 bg-lime-100 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-900/30 dark:text-slate-100">
                {totals.orderQtyInv}
              </td>
              <td className="border-r border-b-[3px] border-border/80 bg-lime-100 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-900/30 dark:text-slate-100">
                {totals.shippedQtyInv}
              </td>
              <td className="border-r border-b-[3px] border-border/80 bg-lime-100 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-900/30 dark:text-slate-100">
                {totals.excessQtyInv}
              </td>
              <td className="border-b-[3px] border-border/80 bg-lime-200 px-2 py-2 text-center font-bold text-slate-900 dark:bg-lime-900/50 dark:text-slate-100">
                {totals.shippedValueInv}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
