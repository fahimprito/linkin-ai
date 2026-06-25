import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { calculateInclusiveDays, sumIssueLogQtyForPo } from "@/lib/knitting-metrics"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addProductionPlan } from "@/store/slices/knitting-slice"
import type { PurchaseOrder } from "@/types/modules"

type PlanningFormValues = {
  poId: string
  poNumber: string
  startDate: string
  endDate: string
  lineName: string
  remarks: string
}

const planningFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number (read-only)", placeholder: "LK-2099" },
  { name: "lineName", label: "Knitting Line", placeholder: "Line 05" },
  { name: "startDate", label: "Start Date", type: "date" },
  { name: "endDate", label: "End Date", type: "date" },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    placeholder: "Plan aligned with machine capacity and issued yarn.",
  },
]

function createPlanId() {
  return `kpl-${Date.now()}`
}

export function KnittingPlanningPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const issueLogs = useAppSelector((state) => state.knitting.issueLogs)
  const plans = useAppSelector((state) => state.knitting.productionPlans)
  const authUser = useAppSelector((state) => state.auth.user)
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<PlanningFormValues>({
    defaultValues: {
      poId: "",
      poNumber: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      lineName: "",
      remarks: "",
    },
  })

  const plannableOrders = purchaseOrders.filter((po) => {
    const issuedQty = sumIssueLogQtyForPo(issueLogs, po.id)
    return (
      (po.status === "Ready for Production" || po.status === "Knitting") &&
      issuedQty > 0
    )
  })

  const openCreateModal = (po: PurchaseOrder) => {
    setSelectedPo(po)
    reset({
      poId: po.id,
      poNumber: po.poNumber,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      lineName: "",
      remarks: "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (values: PlanningFormValues) => {
    if (!selectedPo) {
      return
    }

    const totalDays = calculateInclusiveDays(values.startDate, values.endDate)

    if (totalDays <= 0) {
      toast.error("End date must be on or after the start date.")
      return
    }

    dispatch(
      addProductionPlan({
        id: createPlanId(),
        poId: values.poId,
        poNumber: values.poNumber,
        lineName: values.lineName,
        startDate: values.startDate,
        endDate: values.endDate,
        totalDays,
        dailyTarget: Math.ceil(selectedPo.quantity / totalDays),
        remarks: values.remarks,
        createdAt: new Date().toISOString(),
        createdBy: authUser?.name ?? "Knitting Team",
      })
    )

    toast.success(`Production plan saved for PO ${values.poNumber}.`)
    setIsModalOpen(false)
    setSelectedPo(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knitting Production Planning"
        description="Create production plans after yarn has been issued. The system calculates total days and daily target automatically."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">POs Ready for Planning</h2>
        {plannableOrders.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {plannableOrders.map((po) => {
              const existingPlan = plans.find((plan) => plan.poId === po.id)
              const issuedQty = sumIssueLogQtyForPo(issueLogs, po.id)

              return (
                <div
                  key={po.id}
                  className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{po.poNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {po.buyer} · {po.style}
                      </p>
                    </div>
                    <StatusBadge value={po.status} />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>Order Qty: {po.quantity.toLocaleString()} pcs</p>
                    <p>Issued Yarn: {issuedQty} kg</p>
                    <p>Required Yarn: {po.requiredYarnQty ?? 0} kg</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    onClick={() => openCreateModal(po)}
                  >
                    {existingPlan ? "Update Plan" : "Create Plan"}
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No POs ready for planning"
            description="Issue yarn first from Yarn Control, then the PO becomes ready for a knitting production plan."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Production Plans</h2>
        {plans.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              { key: "lineName", header: "Line" },
              { key: "startDate", header: "Start Date" },
              { key: "endDate", header: "End Date" },
              {
                key: "totalDays",
                header: "Total Days",
                render: (row) => String(row.totalDays),
              },
              {
                key: "dailyTarget",
                header: "Daily Target",
                render: (row) => `${row.dailyTarget} pcs`,
              },
            ]}
            data={plans}
          />
        ) : (
          <EmptyState
            title="No plans saved yet"
            description="Create a production plan to establish the PO timeline and daily target."
          />
        )}
      </section>

      <RecordFormModal
        open={isModalOpen}
        title="Create Knitting Plan"
        description="Set the start/end dates and line assignment. The system will calculate total days and target output automatically."
        fields={planningFields}
        register={register}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPo(null)
        }}
        onReset={() => {
          if (!selectedPo) {
            return
          }

          reset({
            poId: selectedPo.id,
            poNumber: selectedPo.poNumber,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            lineName: "",
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Save Plan"
      />
    </div>
  )
}
