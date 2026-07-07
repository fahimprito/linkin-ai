import { PageHeader } from "@/components/shared/page-header"
import {
  bwslDislProductionSummaryRows,
  bwslDislProductionSummaryTotals,
  bwslDislProductionSummaryUpdatedOn,
} from "@/mock/bwsl-disl-production-summary"

export function BwslDislProdSummeryPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="BWSL&DISL Prod Summery" />

      <section className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">

        <div className="relative overflow-hidden border-b border-[#D8D3C9] bg-[#FAF9F6] px-4 pb-5 pt-4 text-center dark:border-slate-800 dark:bg-slate-950">
          {/* Updated-on tag, pinned to the corner */}
          <div className="absolute right-4 top-4 flex flex-col items-end gap-0.5 rounded-md border border-[#D8D3C9] bg-white px-2.5 py-1 text-right dark:border-slate-800 dark:bg-slate-900">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-400">
              Updated
            </span>
            <span className="font-mono text-xs font-semibold text-[#3F5765] dark:text-slate-300">
              {bwslDislProductionSummaryUpdatedOn}
            </span>
          </div>

          <h2 className="mt-1 text-lg font-bold tracking-wide text-[#C08552] dark:text-slate-100">
            Production Report
          </h2>


          {/* Stitched divider */}
          <div className="mx-auto mt-2 h-px w-14 border-t-2 border-dashed border-[#C08552]/60" />

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <span>BEST WOOL SWEATERS LTD. + EXTENSION</span>
            <span className="hidden h-4 w-px bg-slate-300 sm:block dark:bg-slate-700" />
            <span>DYNAMIC SWEATER INDUSTRIES LTD.</span>
          </div>

          <p className="mt-2 font-mono text-sm font-medium tracking-wide text-[#3F5765] dark:text-slate-400">
            Monthly Section-wise Production Summary
            <span className="ml-1 text-[#C08552]">&apos;26</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-white dark:bg-slate-950">
                <th className="min-w-[9rem] border-b border-r border-border/80 bg-slate-100 px-3 py-3 text-left font-semibold text-slate-800 dark:bg-slate-900 dark:text-slate-100">
                  Month
                </th>
                <th className="min-w-[9rem] border-b border-r border-border/80 bg-cyan-50 px-3 py-3 text-left font-semibold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-200">
                  Knitting
                </th>
                <th className="min-w-[9rem] border-b border-r border-border/80 bg-indigo-50 px-3 py-3 text-left font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-200">
                  Linking
                </th>
                <th className="min-w-[9rem] border-b border-r border-border/80 bg-emerald-50 px-3 py-3 text-left font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200">
                  Packing
                </th>
                <th className="min-w-[10rem] border-b border-border/80 bg-amber-50 px-3 py-3 text-left font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody>
              {bwslDislProductionSummaryRows.map((row, index) => (
                <tr key={row.month} className={index % 2 === 0 ? "bg-background/80" : "bg-card"}>
                  <td className="border-r border-b border-border/70 px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    {row.month}
                  </td>
                  <td className="border-r border-b border-border/70 px-3 py-3 text-left font-bold text-slate-900 dark:text-slate-100">
                    {row.knitting}
                  </td>
                  <td className="border-r border-b border-border/70 px-3 py-3 text-left font-bold text-slate-900 dark:text-slate-100">
                    {row.linking}
                  </td>
                  <td className="border-r border-b border-border/70 px-3 py-3 text-left font-bold text-slate-900 dark:text-slate-100">
                    {row.packing}
                  </td>
                  <td className="border-b border-border/70 px-3 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {row.remarks ?? "-"}
                  </td>
                </tr>
              ))}

              {bwslDislProductionSummaryTotals.map((row) => (
                <tr key={row.label} className={row.rowClassName}>
                  <td className="border-r border-b-[3px] border-border/80 px-3 py-3 font-bold text-slate-900 dark:text-slate-100">
                    {row.label}
                  </td>
                  <td className="border-r border-b-[3px] border-border/80 px-3 py-3 text-left text-lg font-black text-slate-950 dark:text-slate-100">
                    {row.knitting}
                  </td>
                  <td className="border-r border-b-[3px] border-border/80 px-3 py-3 text-left text-lg font-black text-slate-950 dark:text-slate-100">
                    {row.linking}
                  </td>
                  <td className="border-r border-b-[3px] border-border/80 px-3 py-3 text-left text-lg font-black text-slate-950 dark:text-slate-100">
                    {row.packing}
                  </td>
                  <td className="border-b-[3px] border-border/80 px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {row.remarks ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
