import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import type { DashboardMetric } from "@/types/modules"
import type { GenericModuleSummary } from "@/types/modules"

type ModuleOverviewPageProps = {
  title: string
  description: string
  filters: string[]
  data?: GenericModuleSummary & { inspections?: Array<Record<string, string>> }
  isLoading: boolean
  extraTableTitle?: string
  metrics?: DashboardMetric[]
}

export function ModuleOverviewPage(props: ModuleOverviewPageProps) {
  const { title, filters, data, isLoading, extraTableTitle, metrics } = props
  if (isLoading || !data) {
    return <LoadingState />
  }

  const tableColumns = Object.keys(data.records[0] ?? {}).map((key) => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
    render: (row: Record<string, string>) =>
      key === "status" ? <StatusBadge value={row[key]} /> : row[key],
  }))

  const inspectionColumns = Object.keys(data.inspections?.[0] ?? {}).map((key) => ({
    key,
    header: key.charAt(0).toUpperCase() + key.slice(1),
  }))

  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <SearchFilterBar filters={filters} />
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        {(metrics ?? data.metrics).map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </section>
      <DataTable columns={tableColumns} data={data.records} />
      {data.inspections?.length ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{extraTableTitle ?? "Inspection records"}</h2>
          <DataTable columns={inspectionColumns} data={data.inspections} />
        </div>
      ) : null}
    </div>
  )
}

