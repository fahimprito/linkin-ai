import { Link } from "react-router"

import { FINISHING_SUB_STAGES, getFinishingSubStageGuidance } from "@/lib/finishing-workflow"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { WorkflowTrackerCard } from "@/components/shared/workflow-tracker-card"
import { useGetFinishingModuleQuery } from "@/services/linkin-api"
import { useAppSelector } from "@/store/hooks"
import { selectFinishingDashboardMetrics } from "@/store/selectors/dashboard-metrics"
import { StatusBadge } from "@/components/shared/status-badge"

export function FinishingPage() {
  const { data, isLoading } = useGetFinishingModuleQuery(undefined)
  const metrics = useAppSelector(selectFinishingDashboardMetrics)
  const dailyUpdates = useAppSelector(
    (state) => state.formSubmissions.recordsByKey["form-finishing-daily-update"] ?? []
  )
  const storeRequisitions = useAppSelector((state) => state.storeService.requisitions)

  if (isLoading || !data) {
    return <LoadingState />
  }

  const currentSubStage = data.records.some((record) => record.section === "Packing")
    ? "Pack"
    : data.records.some((record) => record.section === "Ironing")
      ? "Iron"
      : dailyUpdates.length > 0
        ? "Sew"
        : "Wash"
  const guidance = getFinishingSubStageGuidance(currentSubStage)
  const finishingRequisitions = storeRequisitions.filter(
    (requisition) => requisition.sourceModule === "Finishing"
  )

  const subStageCards = [
    {
      title: "Wash",
      description: "Clean and prepare the lot before finishing corrections.",
      tone: currentSubStage === "Wash" ? "border-primary/40 bg-primary/5" : "",
    },
    {
      title: "Sew",
      description: "Handle labels, attachments, and sewing fixes.",
      tone: currentSubStage === "Sew" ? "border-primary/40 bg-primary/5" : "",
    },
    {
      title: "Iron",
      description: "Press garments to final shape and appearance.",
      tone: currentSubStage === "Iron" ? "border-primary/40 bg-primary/5" : "",
    },
    {
      title: "Pack",
      description: "Prepare final packed quantity and shipment readiness.",
      tone: currentSubStage === "Pack" ? "border-primary/40 bg-primary/5" : "",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finishing sub-stage control"
      />

      <SearchFilterBar
        filters={[
          "Wash Queue",
          "Sewing Tasks",
          "Ironing",
          "Packing",
          "Store Requisitions",
          "Daily Reports",
        ]}
      />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </section>

      <WorkflowTrackerCard
        trackerLabel="Nested Sub-Stage Tracker"
        title="Finishing module progress"
        summary={guidance.summary}
        nextAction={guidance.nextAction}
        stages={FINISHING_SUB_STAGES}
        currentStage={currentSubStage}
        helperText="Daily finishing updates feed both the local module dashboard and the management super-dashboard."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {subStageCards.map((stage) => (
          <div
            key={stage.title}
            className={`rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm ${stage.tone}`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {stage.title}
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {stage.description}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Current finishing lots</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Module records stay visible while finishing moves lot by lot through the nested stages.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/finishing/daily-update">Open Daily Update</Link>
            </Button>
          </div>
          <div className="mt-5">
            <DataTable
              columns={[
                { key: "batch", header: "Batch" },
                { key: "section", header: "Section" },
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
              <h2 className="text-lg font-semibold">Store service dependency</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Finishing calls Store Control through the shared requisition, issuance, and log pattern.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/finishing/store-issuance-log">Open Issue Log</Link>
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
              Active finishing requisitions: {String(finishingRequisitions.length).padStart(2, "0")}
            </div>
            <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              Use one shared material request flow here so Linking and Finishing do not diverge later.
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

