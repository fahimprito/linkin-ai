import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { STORE_SERVICE_STEPS, getStoreWorkflowGuidance } from "@/lib/store-workflow"
import { DataTable } from "@/components/shared/data-table"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import {
  ServiceIssuanceBoard,
  type ServiceIssuanceRow,
} from "@/components/shared/service-issuance-board"
import { WorkflowTrackerCard } from "@/components/shared/workflow-tracker-card"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  addIssueLog,
  updateRequisitionStatus,
} from "@/store/slices/store-service-slice"
import type { StoreMaterialRequisition } from "@/types/production"

type IssueFormValues = {
  requisitionId: string
  poId: string
  poNumber: string
  itemName: string
  issueQty: string
  issueDate: string
  remarks: string
}

const issueFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number (read-only)", placeholder: "LK-2099" },
  { name: "itemName", label: "Item Name (read-only)", placeholder: "Hang Tag" },
  {
    name: "issueQty",
    label: "Issue Quantity",
    type: "number",
    placeholder: "5000",
  },
  { name: "issueDate", label: "Issue Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Issued from store against production requisition.",
  },
]

function createIssueLogId() {
  return `sil-${Date.now()}`
}

export function StoreRequisitionsPage() {
  const dispatch = useAppDispatch()
  const requisitions = useAppSelector((state) => state.storeService.requisitions)
  const issueLogs = useAppSelector((state) => state.storeService.issueLogs)
  const authUser = useAppSelector((state) => state.auth.user)
  const [selectedRequisition, setSelectedRequisition] =
    useState<StoreMaterialRequisition | null>(null)
  const [activeFilter, setActiveFilter] = useState("Needs Issue")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<IssueFormValues>({
    defaultValues: {
      requisitionId: "",
      poId: "",
      poNumber: "",
      itemName: "",
      issueQty: "",
      issueDate: new Date().toISOString().split("T")[0],
      remarks: "",
    },
  })

  const requisitionRows = requisitions.map((requisition) => {
    const issuedQty = issueLogs
      .filter((log) => log.requisitionId === requisition.id)
      .reduce((sum, log) => sum + log.issuedQty, 0)
    const remainingQty = Math.max(0, requisition.requiredQty - issuedQty)
    const progressPercent =
      requisition.requiredQty > 0
        ? Math.min(100, Math.round((issuedQty / requisition.requiredQty) * 100))
        : 0

    return {
      requisition,
      issuedQty,
      remainingQty,
      progressPercent,
      actionLabel:
        remainingQty === 0
          ? "Solved"
          : issuedQty > 0
            ? "Issue Balance"
            : "Issue Materials",
    }
  })

  const trackerStage =
    requisitions.length === 0
      ? "Incoming Requisition"
      : requisitions.some((requisition) => requisition.status === "Pending")
        ? "Review Need"
        : requisitionRows.some((row) => row.remainingQty > 0)
        ? "Issue Materials"
        : "Log"
  const guidance = getStoreWorkflowGuidance(trackerStage)
  const filteredRows = requisitionRows.filter((row) => {
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
  const serviceRows: ServiceIssuanceRow[] = filteredRows.map((row) => ({
    id: row.requisition.id,
    title: row.requisition.poNumber,
    subtitle: `${row.requisition.sourceModule} / ${row.requisition.itemName}`,
    status: row.requisition.status,
    requiredQty: row.requisition.requiredQty,
    issuedQty: row.issuedQty,
    remainingQty: row.remainingQty,
    progressPercent: row.progressPercent,
    actionLabel: row.actionLabel,
    canIssue: row.remainingQty > 0,
  }))

  const openIssueModal = (requisition: StoreMaterialRequisition) => {
    const selectedRow = requisitionRows.find((row) => row.requisition.id === requisition.id)
    setSelectedRequisition(requisition)
    reset({
      requisitionId: requisition.id,
      poId: requisition.poId,
      poNumber: requisition.poNumber,
      itemName: requisition.itemName,
      issueQty: String(selectedRow?.remainingQty ?? requisition.requiredQty),
      issueDate: new Date().toISOString().split("T")[0],
      remarks: "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (values: IssueFormValues) => {
    if (!selectedRequisition) {
      return
    }

    const issueQty = Number(values.issueQty)
    const selectedRow = requisitionRows.find(
      (row) => row.requisition.id === values.requisitionId
    )

    if (issueQty <= 0) {
      toast.error("Issue quantity must be greater than zero.")
      return
    }

    if (issueQty > (selectedRow?.remainingQty ?? 0)) {
      toast.error("Issue quantity cannot exceed the remaining requisition quantity.")
      return
    }

    dispatch(
      addIssueLog({
        id: createIssueLogId(),
        requisitionId: values.requisitionId,
        sourceModule: selectedRequisition.sourceModule,
        poId: values.poId,
        poNumber: values.poNumber,
        itemName: values.itemName,
        issuedQty: issueQty,
        issueDate: values.issueDate,
        issuedBy: authUser?.name ?? "Store Controller",
        remarks: values.remarks,
        createdAt: new Date().toISOString(),
      })
    )

    dispatch(
      updateRequisitionStatus({
        id: values.requisitionId,
        status:
          issueQty >= (selectedRow?.remainingQty ?? 0)
            ? "Issued"
            : "Partially Issued",
      })
    )

    toast.success(`Store issue logged for PO ${values.poNumber}.`)
    setIsModalOpen(false)
    setSelectedRequisition(null)
  }

  return (
    <div className="space-y-6">
      <WorkflowTrackerCard
        trackerLabel="Shared Service Tracker"
        title="Store Controller requisition flow"
        summary={guidance.summary}
        nextAction={guidance.nextAction}
        stages={STORE_SERVICE_STEPS}
        currentStage={trackerStage}
      />

      <SearchFilterBar
        filters={["Needs Issue", "Partially Issued", "Solved"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <ServiceIssuanceBoard
        title="Incoming Store Requisitions"
        rows={serviceRows}
        onIssue={(id) => {
          const requisition = requisitions.find((item) => item.id === id)
          if (requisition) {
            openIssueModal(requisition)
          }
        }}
        emptyTitle="No store requisitions in this filter"
        emptyDescription="Linking and Finishing requisitions will appear here when those stages start calling the shared store service."
        issueButtonLabel="Log Store Issue"
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Requisition Register</h2>
        <DataTable
          columns={[
            { key: "poNumber", header: "PO" },
            { key: "sourceModule", header: "Module" },
            { key: "itemName", header: "Item" },
            {
              key: "requiredQty",
              header: "Required Qty",
              render: (row) => String(row.requiredQty),
            },
            { key: "requestedDate", header: "Requested Date" },
            { key: "requestedBy", header: "Requested By" },
            { key: "status", header: "Status" },
          ]}
          data={requisitions}
        />
      </section>

      <RecordFormModal
        open={isModalOpen}
        title="Log Store Issue"
        description="Issue store materials against the selected production requisition."
        fields={issueFields}
        register={register}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRequisition(null)
        }}
        onReset={() => {
          if (!selectedRequisition) {
            return
          }

          const selectedRow = requisitionRows.find(
            (row) => row.requisition.id === selectedRequisition.id
          )
          reset({
            requisitionId: selectedRequisition.id,
            poId: selectedRequisition.poId,
            poNumber: selectedRequisition.poNumber,
            itemName: selectedRequisition.itemName,
            issueQty: String(
              selectedRow?.remainingQty ?? selectedRequisition.requiredQty
            ),
            issueDate: new Date().toISOString().split("T")[0],
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Save Issue Log"
      />
    </div>
  )
}
