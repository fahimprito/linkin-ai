import { ClipboardList, Package2 } from "lucide-react"
import { Link } from "react-router"

import { LINKING_STAGE_3_STEPS, getLinkingWorkflowGuidance } from "@/lib/linking-workflow"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { WorkflowTrackerCard } from "@/components/shared/workflow-tracker-card"
import { useGetLinkingModuleQuery } from "@/services/linkin-api"
import { useAppSelector } from "@/store/hooks"
import { selectLinkingDashboardMetrics } from "@/store/selectors/dashboard-metrics"

export function LinkingPage() {
  const { data, isLoading } = useGetLinkingModuleQuery(undefined)
  const metrics = useAppSelector(selectLinkingDashboardMetrics)
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const requisitions = useAppSelector(
    (state) => state.formSubmissions.recordsByKey["form-linking-store-requisition"] ?? []
  )
  const issueLogs = useAppSelector((state) =>
    state.storeService.issueLogs.filter((log) => log.sourceModule === "Linking")
  )
  const plans = useAppSelector(
    (state) => state.formSubmissions.recordsByKey["form-linking-planning"] ?? []
  )
  const dailyReports = useAppSelector(
    (state) => state.formSubmissions.recordsByKey["form-linking-daily-update"] ?? []
  )

  if (isLoading || !data) {
    return <LoadingState />
  }

  const queueOrders = purchaseOrders.filter(
    (po) => po.status === "Linking" || po.status === "Finishing"
  )
  const trackerStage =
    dailyReports.length > 0 && queueOrders.some((po) => po.status === "Finishing")
      ? "Transfer"
      : dailyReports.length > 0
        ? "Daily Progress"
        : plans.length > 0
          ? "Plan"
          : issueLogs.length > 0
            ? "Store Issue"
            : requisitions.length > 0
              ? "Store Requisition"
              : "Queue"
  const guidance = getLinkingWorkflowGuidance(trackerStage)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Linking production control"
      />

      <SearchFilterBar
        filters={[
          "Linking Queue",
          "Store Requisition",
          "Store Issue Log",
          "Planning",
          "Daily Reports",
        ]}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </section>

      <WorkflowTrackerCard
        trackerLabel="Stage 3 Tracker"
        title="Linking workflow"
        summary={guidance.summary}
        nextAction={guidance.nextAction}
        stages={LINKING_STAGE_3_STEPS}
        currentStage={trackerStage}
        helperText="Receive PO / raise store requisition / watch store issue / plan / submit daily progress / transfer to Finishing"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            to: "/linking/store-requisition",
            icon: ClipboardList,
            label: "Store Requisition",
            desc: "Request required materials from Store Control.",
          },
          {
            to: "/linking/store-issuance-log",
            icon: Package2,
            label: "Store Issuance Log",
            desc: "Read-only view of items issued by Store Control.",
          },
          {
            to: "/linking/planning",
            icon: ClipboardList,
            label: "Production Plan",
            desc: "Set the linking plan after materials are available.",
          },
          {
            to: "/linking/daily-progress",
            icon: Package2,
            label: "Daily Progress",
            desc: "Submit daily linking production output.",
          },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-start gap-4 rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
          >
            <div className="rounded-xl bg-primary/10 p-2.5">
              <item.icon className="size-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold group-hover:text-primary">{item.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Current linking lots</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Linking records remain visible while the stage tracker drives the next real action.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/linking/daily-progress">Open Daily Progress</Link>
            </Button>
          </div>
          <div className="mt-5">
            <DataTable
              columns={[
                { key: "order", header: "Order" },
                { key: "operator", header: "Operator" },
                { key: "progress", header: "Progress" },
                {
                  key: "status",
                  header: "Status",
                  render: (row) => <StatusBadge value={String(row.status)} />,
                },
              ]}
              data={data.records}
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Store service status</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Linking depends on the same shared Store Control issue pattern used by Finishing.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/linking/store-issuance-log">Open Issue Log</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
              Queue POs: {String(queueOrders.length).padStart(2, "0")}
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
              Store requisitions: {String(requisitions.length).padStart(2, "0")}
            </div>
            <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
              Store issue logs: {String(issueLogs.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

