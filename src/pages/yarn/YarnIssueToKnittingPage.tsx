import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { sumIssueLogQtyForPo } from "@/lib/knitting-metrics"
import {
  getKnittingWorkflowGuidance,
  getRequisitionResolutionSnapshot,
  KNITTING_STAGE_2_STEPS,
} from "@/lib/knitting-workflow"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { WorkflowTrackerCard } from "@/components/shared/workflow-tracker-card"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import {
  addIssueLog,
  updateRequisitionStatus,
} from "@/store/slices/knitting-slice"
import { addNotification } from "@/store/slices/notification-slice"
import { addStockMovement } from "@/store/slices/yarn-check-slice"
import type { KnittingYarnRequisition } from "@/types/production"

type IssueFormValues = {
  requisitionId: string
  poId: string
  poNumber: string
  issueQty: string
  issueDate: string
  remarks: string
}

const issueFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number (read-only)", placeholder: "LK-2099" },
  {
    name: "issueQty",
    label: "Issue Quantity (kg)",
    type: "number",
    placeholder: "450",
  },
  { name: "issueDate", label: "Issue Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Released against approved knitting requisition.",
  },
]

function createIssueLogId() {
  return `kil-${Date.now()}`
}

function createStockMovementId() {
  return `ysm-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

export function YarnIssueToKnittingPage() {
  const dispatch = useAppDispatch()
  const requisitions = useAppSelector((state) => state.knitting.requisitions)
  const issueLogs = useAppSelector((state) => state.knitting.issueLogs)
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const authUser = useAppSelector((state) => state.auth.user)
  const [selectedRequisition, setSelectedRequisition] =
    useState<KnittingYarnRequisition | null>(null)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("Needs Issue")
  const { register, handleSubmit, reset } = useForm<IssueFormValues>({
    defaultValues: {
      requisitionId: "",
      poId: "",
      poNumber: "",
      issueQty: "",
      issueDate: new Date().toISOString().split("T")[0],
      remarks: "",
    },
  })

  const requisitionRows = requisitions.map((requisition) => ({
    requisition,
    purchaseOrder: purchaseOrders.find((po) => po.id === requisition.poId),
    ...getRequisitionResolutionSnapshot({
      requisition,
      issueLogs,
      stockMovements,
    }),
  }))
  const openRequisitions = requisitionRows.filter(
    (row) => row.requisition.status !== "Issued"
  )
  const canSolveNowCount = requisitionRows.filter(
    (row) => row.remainingQty > 0 && row.availableQty > 0
  ).length
  const solvedCount = requisitionRows.filter(
    (row) => row.requisition.status === "Issued"
  ).length
  const filteredRequisitionRows = requisitionRows.filter((row) => {
    if (activeFilter === "Needs Issue") {
      return row.requisition.status === "Pending"
    }

    if (activeFilter === "Partially Issued") {
      return row.requisition.status === "Partially Issued"
    }

    if (activeFilter === "Solved") {
      return row.requisition.status === "Issued"
    }

    return true
  })
  const trackerStage =
    openRequisitions.length > 0 ? "Yarn Issue" : solvedCount > 0 ? "Plan" : "Queue"
  const trackerGuidance = getKnittingWorkflowGuidance(trackerStage)

  const openIssueModal = (requisition: KnittingYarnRequisition) => {
    const selectedRow = requisitionRows.find(
      (row) => row.requisition.id === requisition.id
    )
    const remainingQty = selectedRow?.remainingQty ?? requisition.requiredQty

    setSelectedRequisition(requisition)
    reset({
      requisitionId: requisition.id,
      poId: requisition.poId,
      poNumber: requisition.poNumber,
      issueQty: String(remainingQty),
      issueDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsIssueModalOpen(true)
  }

  const onSubmit = (values: IssueFormValues) => {
    if (!selectedRequisition) {
      return
    }

    const selectedRow = requisitionRows.find(
      (row) => row.requisition.id === values.requisitionId
    )
    const issueQty = Number(values.issueQty)
    const availableQty = selectedRow?.availableQty ?? 0
    const issuedQtyBefore = selectedRow?.issuedQty ?? 0
    const issuedQtyAfter = issuedQtyBefore + issueQty

    if (issueQty <= 0) {
      toast.error("Issue quantity must be greater than zero.")
      return
    }

    if (issueQty > availableQty) {
      toast.error(
        `Only ${availableQty} kg is available for ${values.poNumber}.`
      )
      return
    }

    dispatch(
      addIssueLog({
        id: createIssueLogId(),
        requisitionId: values.requisitionId,
        poId: values.poId,
        poNumber: values.poNumber,
        issuedQty: issueQty,
        issueDate: values.issueDate,
        issuedBy: authUser?.name ?? "Yarn Controller",
        remarks: values.remarks,
        createdAt: new Date().toISOString(),
      })
    )

    dispatch(
      addStockMovement({
        id: createStockMovementId(),
        poId: values.poId,
        poNumber: values.poNumber,
        yarnType:
          purchaseOrders.find((po) => po.id === values.poId)?.yarnComposition ??
          "",
        color: purchaseOrders.find((po) => po.id === values.poId)?.color ?? "",
        quantity: issueQty,
        movementType: "Issued to Knitting",
        movementDate: values.issueDate,
        referenceId: values.requisitionId,
        referenceLabel: "Knitting issue",
        createdBy: authUser?.name ?? "Yarn Controller",
        remarks: values.remarks || "Issued to knitting against requisition.",
      })
    )
    dispatch(
      addNotification({
        id: createNotificationId(),
        title: `Yarn issued for ${values.poNumber}`,
        description: `${issueQty} kg has been issued by Yarn Control to the knitting floor for PO ${values.poNumber}.`,
        time: "Just now",
        read: false,
      })
    )

    dispatch(
      updateRequisitionStatus({
        id: values.requisitionId,
        status:
          issuedQtyAfter >= selectedRequisition.requiredQty
            ? "Issued"
            : "Partially Issued",
      })
    )
    dispatch(updatePoStatus({ id: values.poId, status: "Knitting" }))

    toast.success(
      `Issued ${issueQty} kg to knitting for PO ${values.poNumber}.`
    )
    setIsIssueModalOpen(false)
    setSelectedRequisition(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Yarn to Knitting"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Open Requisitions"
          value={String(openRequisitions.length).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Can Solve Now"
          value={String(canSolveNowCount).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Issue Logs"
          value={String(issueLogs.length).padStart(2, "0")}
          tone="default"
        />
      </section>

      <WorkflowTrackerCard
        trackerLabel="Requisition Resolution Tracker"
        title="Yarn Control action flow"
        summary={
          openRequisitions.length > 0
            ? `Knitting has already raised requisitions. ${trackerGuidance.summary}`
            : "This tracker shows where requisitions stand between Knitting and Yarn Control."
        }
        nextAction={trackerGuidance.nextAction}
        stages={KNITTING_STAGE_2_STEPS}
        currentStage={trackerStage}
        helperText="Check stock / issue yarn / update requisition / move PO into knitting"
      />

      <SearchFilterBar
        filters={["Needs Issue", "Partially Issued", "Solved"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Knitting Requisitions</h2>
        {filteredRequisitionRows.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequisitionRows.map((row) => {
              const { requisition, availableQty, issuedQty, remainingQty } = row

              return (
                <div
                  key={requisition.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{requisition.poNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {requisition.buyer} Â· {requisition.style}
                      </p>
                    </div>
                    <StatusBadge value={requisition.status} />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>Required: {requisition.requiredQty} kg</p>
                    <p>Issued: {issuedQty} kg</p>
                    <p>Remaining: {remainingQty} kg</p>
                    <p>Available: {availableQty} kg</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Resolution progress</span>
                      <span>{row.percentIssued}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${row.percentIssued}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-secondary/60 px-3 py-2 text-sm">
                    <span className="font-medium">Resolution status:</span>{" "}
                    {row.actionLabel}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    disabled={availableQty <= 0 || remainingQty <= 0}
                    onClick={() => openIssueModal(requisition)}
                  >
                    {remainingQty <= 0 ? "Solved" : "Log Yarn Issue"}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No requisitions in this filter"
            description="Switch filters or wait for knitting to raise the next requisition."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Issuance History</h2>
        {issueLogs.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              {
                key: "issuedQty",
                header: "Issued Qty (kg)",
                render: (row) => String(row.issuedQty),
              },
              { key: "issueDate", header: "Issue Date" },
              { key: "issuedBy", header: "Issued By" },
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "-"),
              },
            ]}
            data={issueLogs}
          />
        ) : (
          <EmptyState
            title="No yarn issues logged"
            description="Once Yarn Control releases yarn against a requisition, the issuance log will appear here."
          />
        )}
      </section>

      <RecordFormModal
        open={isIssueModalOpen}
        title="Log Yarn Issue"
        description="Issue yarn against the selected knitting requisition. The requisition status updates automatically based on total issued quantity."
        fields={issueFields}
        register={register}
        onClose={() => {
          setIsIssueModalOpen(false)
          setSelectedRequisition(null)
        }}
        onReset={() => {
          if (!selectedRequisition) {
            return
          }

          const alreadyIssuedQty = sumIssueLogQtyForPo(
            issueLogs,
            selectedRequisition.poId
          )
          reset({
            requisitionId: selectedRequisition.id,
            poId: selectedRequisition.poId,
            poNumber: selectedRequisition.poNumber,
            issueQty: String(
              Math.max(0, selectedRequisition.requiredQty - alreadyIssuedQty)
            ),
            issueDate: new Date().toISOString().split("T")[0],
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Issue Yarn"
      />
    </div>
  )
}

