import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { useGetReportsModuleQuery } from "@/services/linkin-api"

export function ReportsPage() {
  const { data, isLoading } = useGetReportsModuleQuery(undefined)

  if (isLoading || !data) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive analytics and reporting"
        description="Provide management visibility into production, yarn, store, shipment, and KPI performance with fast analytics."
      />
      <SearchFilterBar
        filters={[
          "Production Overview",
          "Yarn Overview",
          "Store Overview",
          "Shipment Overview",
          "KPI Cards",
          "Charts",
          "Analytics",
        ]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <DataTable
          columns={Object.keys(data.records[0] ?? {}).map((key) => ({
            key,
            header: key.charAt(0).toUpperCase() + key.slice(1),
          }))}
          data={data.records}
        />
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Analytics placeholders</h2>
          <div className="mt-6 grid gap-4">
            <div className="h-40 rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(59,130,246,0.16),_rgba(15,23,42,0))]" />
            <div className="h-28 rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(34,197,94,0.16),_rgba(15,23,42,0))]" />
            <div className="h-28 rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(245,158,11,0.16),_rgba(15,23,42,0))]" />
          </div>
        </div>
      </section>
    </div>
  )
}
