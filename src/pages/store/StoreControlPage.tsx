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
  const todayIso = new Date().toISOString().split("T")[0]
  const issuesToday = issueLogs.filter((log) => log.issueDate === todayIso).length
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
        description="Store Control is a shared service module for Linking and Finishing. It receives material requisitions, issues items, and keeps the issuance log."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Open Requisitions"
          value={String(openRequisitions).padStart(2, "0")}
          delta="Awaiting issue"
          tone="warning"
        />
        <MetricCard
          label="Issue Logs"
          value={String(issueLogs.length).padStart(2, "0")}
          delta={`${String(issuesToday).padStart(2, "0")} today`}
          tone="success"
        />
        <MetricCard
          label="Source Modules"
          value="02"
          delta="Linking and Finishing"
          tone="default"
        />
      </section>

      <WorkflowTrackerCard
        trackerLabel="Shared Service Tracker"
        title="Store Controller service flow"
        summary={
          requisitions.length > 0
            ? guidance.summary
            : "No requisitions have arrived yet. This service module will be used by Linking and Finishing through the same requisition -> issuance -> log pattern."
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
          description="Linking and Finishing have not sent any material requisitions yet. Once Stage 3 and Stage 4 are live, requests will appear here automatically."
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
