import { useGetExecutiveDashboardQuery } from "@/services/linkin-api"
import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"

export function ExecutiveDashboardPage() {
  const { data, isLoading } = useGetExecutiveDashboardQuery(undefined)

  if (isLoading || !data) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational command center"
        description="Track production flow, inventory health, shipments, and department alerts across the entire Linkin AI workspace."
      />
      <SearchFilterBar
        filters={[
          "Search by PO Number",
          "Search by Buyer",
          "Search by Date",
          "Search by Production Status",
        ]}
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent activities</h2>
          <div className="mt-5 space-y-4">
            {data.activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{activity.title}</p>
                  <StatusBadge value={activity.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {activity.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Production overview</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(34,197,94,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Knitting output</p>
              <p className="mt-2 text-3xl font-semibold">74%</p>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(245,158,11,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Linking throughput</p>
              <p className="mt-2 text-3xl font-semibold">61%</p>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(59,130,246,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Finishing readiness</p>
              <p className="mt-2 text-3xl font-semibold">82%</p>
            </div>
          </div>
        </div>
      </section>
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "style", header: "Style" },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
          { key: "deliveryDate", header: "Delivery Date" },
        ]}
        data={data.orders}
      />
    </div>
  )
}
