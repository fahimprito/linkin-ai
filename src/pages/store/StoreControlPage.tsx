import { ClipboardList, Package2 } from "lucide-react"
import { Link } from "react-router"

import { STORE_SERVICE_STEPS, getStoreWorkflowGuidance } from "@/lib/store-workflow"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { WorkflowTrackerCard } from "@/components/shared/workflow-tracker-card"
import { useAppSelector } from "@/store/hooks"

export function StoreControlPage() {
  const requisitions = useAppSelector((state) => state.storeService.requisitions)
  const issueLogs = useAppSelector((state) => state.storeService.issueLogs)
  const openRequisitions = requisitions.filter(
    (requisition) => requisition.status !== "Issued"
  ).length
  const trackerStage =
    requisitions.length === 0
      ? "Incoming Requisition"
      : requisitions.some((requisition) => requisition.status === "Pending")
        ? "Review Need"
        : openRequisitions > 0
        ? "Issue Materials"
        : "Log"
  const guidance = getStoreWorkflowGuidance(trackerStage)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Control Service"
      />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="Open Requisitions"
          value={String(openRequisitions).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Issue Logs"
          value={String(issueLogs.length).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Source Modules"
          value="02"
          tone="default"
        />
      </section>

      <WorkflowTrackerCard
        trackerLabel="Shared Service Tracker"
        title="Store Controller service flow"
        summary={
          requisitions.length > 0
            ? guidance.summary
            : "No requisitions have arrived yet. This service module is ready for the same requisition -> issuance -> log flow whenever the next stage is enabled."
        }
        nextAction={guidance.nextAction}
        stages={STORE_SERVICE_STEPS}
        currentStage={trackerStage}
        helperText="This module is intentionally shared so later production stages reuse one consistent issue-and-log workflow."
      />

      <section className="grid gap-4 md:grid-cols-2">
        {[
          {
            to: "/store/requisitions",
            icon: ClipboardList,
            label: "Incoming Requisitions",
            desc: "Review material requests from production modules.",
          },
          {
            to: "/store/issue-log",
            icon: Package2,
            label: "Issue Log",
            desc: "Track all issued materials in one read-only history.",
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
              <p className="font-semibold group-hover:text-primary">
                {item.label}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </section>

      {requisitions.length === 0 ? (
        <EmptyState
          title="Store service is ready"
          description="No active module has sent a material requisition yet. Requests will appear here automatically when the next shared-service flow is enabled."
        />
      ) : (
        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Next service action</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open requisitions should be resolved from the requisitions page.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-2xl">
              <Link to="/store/requisitions">Open Requisitions</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

