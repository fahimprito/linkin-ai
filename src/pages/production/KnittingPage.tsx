import { CalendarRange, ClipboardList, Factory, Package2 } from "lucide-react"
import { Link } from "react-router"

import {
  calculateWastePercentage,
  getAvailableYarnForPo,
  sumIssueLogQtyForPo,
  sumOutputWeightForPo,
  sumProducedQtyForPo,
} from "@/lib/knitting-metrics"
import {
  getKnittingWorkflowGuidance,
  getKnittingWorkflowStageForPo,
  KNITTING_STAGE_2_STEPS,
} from "@/lib/knitting-workflow"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { WorkflowTrackerCard } from "@/components/shared/workflow-tracker-card"
import { useAppSelector } from "@/store/hooks"

export function KnittingPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const requisitions = useAppSelector((state) => state.knitting.requisitions)
  const issueLogs = useAppSelector((state) => state.knitting.issueLogs)
  const plans = useAppSelector((state) => state.knitting.productionPlans)
  const progressEntries = useAppSelector((state) => state.knitting.dailyProgress)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const queueOrders = purchaseOrders.filter(
    (po) => po.status === "Ready for Production" || po.status === "Knitting"
  )
  const activeRequisitions = requisitions.filter(
    (requisition) => requisition.status !== "Issued"
  ).length
  const activePlans = plans.length
  const todayIso = new Date().toISOString().split("T")[0]
  const todayOutput = progressEntries
    .filter((entry) => entry.entryDate === todayIso)
    .reduce((sum, entry) => sum + entry.producedQty, 0)
  const wasteRows = queueOrders
    .map((po) => {
      const issuedQty = sumIssueLogQtyForPo(issueLogs, po.id)
      const outputWeight = sumOutputWeightForPo(progressEntries, po.id)

      return {
        id: po.id,
        poNumber: po.poNumber,
        issuedQty,
        outputWeight,
        wastePercentage: calculateWastePercentage(issuedQty, outputWeight),
      }
    })
    .filter((row) => row.issuedQty > 0 || row.outputWeight > 0)
  const trackerPo = queueOrders[0]
  const currentStage = trackerPo
    ? getKnittingWorkflowStageForPo({
        po: trackerPo,
        requisitions,
        issueLogs,
        plans,
        progressEntries,
      })
    : "Queue"
  const trackerGuidance = getKnittingWorkflowGuidance(currentStage)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knitting Module"
        description="Receive released POs from Yarn Control, raise yarn requisitions, follow issued stock, build production plans, and report daily knitting progress."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Knitting Queue"
          value={String(queueOrders.length).padStart(2, "0")}
          delta="Ready or running"
          tone="default"
        />
        <MetricCard
          label="Open Requisitions"
          value={String(activeRequisitions).padStart(2, "0")}
          delta="Need Yarn Control issue"
          tone="warning"
        />
        <MetricCard
          label="Active Plans"
          value={String(activePlans).padStart(2, "0")}
          delta="Scheduled lines"
          tone="success"
        />
        <MetricCard
          label="Today's Output"
          value={`${todayOutput.toLocaleString()} pcs`}
          delta={todayIso}
          tone="success"
        />
      </section>

      <WorkflowTrackerCard
        trackerLabel="Stage 2 Workflow Tracker"
        title="Knitting operational flow"
        summary={
          trackerPo
            ? `Current focus PO: ${trackerPo.poNumber}. ${trackerGuidance.summary}`
            : "The step-by-step knitting flow will appear here when a PO reaches Stage 2."
        }
        nextAction={trackerGuidance.nextAction}
        stages={KNITTING_STAGE_2_STEPS}
        currentStage={currentStage}
        badgeValue={trackerPo?.status}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            to: "/knitting/requisition",
            icon: ClipboardList,
            label: "Yarn Requisition",
            desc: "Raise PO-level yarn requests",
          },
          {
            to: "/knitting/issuance-log",
            icon: Package2,
            label: "Yarn Issuance",
            desc: "Read-only issue tracking",
          },
          {
            to: "/knitting/planning",
            icon: CalendarRange,
            label: "Production Plan",
            desc: "Set dates and targets",
          },
          {
            to: "/knitting/daily-progress",
            icon: Factory,
            label: "Daily Progress",
            desc: "Track output and waste",
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

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Knitting Queue</h2>
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link to="/knitting/requisition">Create Requisition</Link>
          </Button>
        </div>
        {queueOrders.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              { key: "buyer", header: "Buyer" },
              { key: "style", header: "Style" },
              {
                key: "requiredYarnQty",
                header: "Required Yarn",
                render: (row) => `${row.requiredYarnQty ?? 0} kg`,
              },
              {
                key: "availableStock",
                header: "Available Stock",
                render: (row) =>
                  `${getAvailableYarnForPo(stockMovements, String(row.id))} kg`,
              },
              {
                key: "issuedQty",
                header: "Issued Yarn",
                render: (row) =>
                  `${sumIssueLogQtyForPo(issueLogs, String(row.id))} kg`,
              },
              {
                key: "producedQty",
                header: "Produced",
                render: (row) =>
                  `${sumProducedQtyForPo(progressEntries, String(row.id)).toLocaleString()} pcs`,
              },
              {
                key: "waste",
                header: "Waste %",
                render: (row) => {
                  const waste = calculateWastePercentage(
                    sumIssueLogQtyForPo(issueLogs, String(row.id)),
                    sumOutputWeightForPo(progressEntries, String(row.id))
                  )
                  return waste === null ? "-" : `${waste}%`
                },
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={String(row.status)} />,
              },
            ]}
            data={queueOrders}
          />
        ) : (
          <EmptyState
            title="No POs in the knitting queue"
            description="Stage 2 starts when Yarn Control marks a PO Ready for Production. Those released POs will appear here automatically."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Daily Progress</h2>
        {progressEntries.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              { key: "entryDate", header: "Date" },
              {
                key: "plannedQty",
                header: "Planned",
                render: (row) => `${row.plannedQty} pcs`,
              },
              {
                key: "producedQty",
                header: "Produced",
                render: (row) => `${row.producedQty} pcs`,
              },
              {
                key: "finishedOutputWeight",
                header: "Output Weight",
                render: (row) => `${row.finishedOutputWeight} kg`,
              },
            ]}
            data={progressEntries.slice(0, 5)}
          />
        ) : (
          <EmptyState
            title="No knitting progress reported yet"
            description="Daily production entries will surface here after the knitting team starts posting floor output."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Waste Watch</h2>
        {wasteRows.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              {
                key: "issuedQty",
                header: "Issued Yarn",
                render: (row) => `${row.issuedQty} kg`,
              },
              {
                key: "outputWeight",
                header: "Output Weight",
                render: (row) => `${row.outputWeight} kg`,
              },
              {
                key: "wastePercentage",
                header: "Waste %",
                render: (row) =>
                  row.wastePercentage === null
                    ? "-"
                    : `${row.wastePercentage}%`,
              },
            ]}
            data={wasteRows}
          />
        ) : (
          <EmptyState
            title="No waste data yet"
            description="Waste percentages will appear once Yarn Control has issued yarn and knitting has logged finished output weight."
          />
        )}
      </section>
    </div>
  )
}
