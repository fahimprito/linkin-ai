import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import {
  calculateWastePercentage,
  sumIssueLogQtyForPo,
  sumOutputWeightForPo,
  sumProducedQtyForPo,
} from "@/lib/knitting-metrics"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { DailyProductionEntryModal } from "@/components/shared/daily-production-entry-modal"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { addDailyProgress } from "@/store/slices/knitting-slice"
import { addNotification } from "@/store/slices/notification-slice"
import type { PurchaseOrder } from "@/types/modules"

type DailyProgressFormValues = {
  poId: string
  poNumber: string
  entryDate: string
  plannedQty: string
  producedQty: string
  finishedOutputWeight: string
  remarks: string
}

function createDailyProgressId() {
  return `kdp-${Date.now()}`
}

function createNotificationId() {
  return `notif-${Date.now()}`
}

export function KnittingDailyProgressPage() {
  const dispatch = useAppDispatch()
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const plans = useAppSelector((state) => state.knitting.productionPlans)
  const issueLogs = useAppSelector((state) => state.knitting.issueLogs)
  const progressEntries = useAppSelector((state) => state.knitting.dailyProgress)
  const authUser = useAppSelector((state) => state.auth.user)
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { register, handleSubmit, reset } = useForm<DailyProgressFormValues>({
    defaultValues: {
      poId: "",
      poNumber: "",
      entryDate: new Date().toISOString().split("T")[0],
      plannedQty: "",
      producedQty: "",
      finishedOutputWeight: "",
      remarks: "",
    },
  })

  const activeOrders = purchaseOrders.filter(
    (po) =>
      (po.status === "Ready for Production" || po.status === "Knitting") &&
      plans.some((plan) => plan.poId === po.id)
  )
  const todayIso = new Date().toISOString().split("T")[0]
  const todayOutput = progressEntries
    .filter((entry) => entry.entryDate === todayIso)
    .reduce((sum, entry) => sum + entry.producedQty, 0)
  const wasteLogRows = purchaseOrders
    .filter(
      (po) =>
        plans.some((plan) => plan.poId === po.id) ||
        progressEntries.some((entry) => entry.poId === po.id)
    )
    .map((po) => {
      const issuedQty = sumIssueLogQtyForPo(issueLogs, po.id)
      const totalOutputWeight = sumOutputWeightForPo(progressEntries, po.id)
      const totalProduced = sumProducedQtyForPo(progressEntries, po.id)
      const wastePercentage = calculateWastePercentage(
        issuedQty,
        totalOutputWeight
      )

      return {
        id: po.id,
        poNumber: po.poNumber,
        issuedQty,
        totalOutputWeight,
        totalProduced,
        wastePercentage,
        status: po.status,
      }
    })
    .filter((row) => row.issuedQty > 0 || row.totalOutputWeight > 0)

  const openCreateModal = (po: PurchaseOrder) => {
    const plan = plans.find((item) => item.poId === po.id)

    setSelectedPo(po)
    reset({
      poId: po.id,
      poNumber: po.poNumber,
      entryDate: todayIso,
      plannedQty: String(plan?.dailyTarget ?? 0),
      producedQty: "",
      finishedOutputWeight: "",
      remarks: "",
    })
    setIsModalOpen(true)
  }

  const onSubmit = (values: DailyProgressFormValues) => {
    if (!selectedPo) {
      return
    }

    const plannedQty = Number(values.plannedQty)
    const producedQty = Number(values.producedQty)
    const finishedOutputWeight = Number(values.finishedOutputWeight)

    if (plannedQty < 0 || producedQty < 0 || finishedOutputWeight < 0) {
      toast.error("Daily quantities must be zero or greater.")
      return
    }

    dispatch(
      addDailyProgress({
        id: createDailyProgressId(),
        poId: values.poId,
        poNumber: values.poNumber,
        entryDate: values.entryDate,
        plannedQty,
        producedQty,
        finishedOutputWeight,
        remarks: values.remarks,
        createdAt: new Date().toISOString(),
        createdBy: authUser?.name ?? "Knitting Team",
      })
    )

    const totalProduced = sumProducedQtyForPo(progressEntries, values.poId) + producedQty

    dispatch(
      updatePoStatus({
        id: values.poId,
        status: totalProduced >= selectedPo.quantity ? "Linking" : "Knitting",
      })
    )
    if (totalProduced >= selectedPo.quantity) {
      dispatch(
        addNotification({
          id: createNotificationId(),
          title: `Knitting completed: ${values.poNumber}`,
          description: `PO ${values.poNumber} finished knitting and has been routed to the Linking stage.`,
          time: "Just now",
          read: false,
        })
      )
    }

    toast.success(
      totalProduced >= selectedPo.quantity
        ? `PO ${values.poNumber} completed knitting and routed to Linking.`
        : `Daily progress saved for PO ${values.poNumber}.`
    )
    setIsModalOpen(false)
    setSelectedPo(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knitting Daily Progress"
        description="Submit daily knitting production, record finished knit output weight, and let the system calculate waste percentage automatically."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Active POs"
          value={String(activeOrders.length).padStart(2, "0")}
          delta="Plans in progress"
          tone="default"
        />
        <MetricCard
          label="Today's Output"
          value={`${todayOutput.toLocaleString()} pcs`}
          delta={todayIso}
          tone="success"
        />
        <MetricCard
          label="Daily Entries"
          value={String(progressEntries.length).padStart(2, "0")}
          delta="Progress logs"
          tone="warning"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Active Knitting Orders</h2>
        {activeOrders.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeOrders.map((po) => {
              const issuedQty = sumIssueLogQtyForPo(issueLogs, po.id)
              const totalProduced = sumProducedQtyForPo(progressEntries, po.id)
              const totalOutputWeight = sumOutputWeightForPo(progressEntries, po.id)
              const wastePercentage = calculateWastePercentage(
                issuedQty,
                totalOutputWeight
              )

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
                    <p>Produced: {totalProduced.toLocaleString()} pcs</p>
                    <p>Issued Yarn: {issuedQty} kg</p>
                    <p>Output Weight: {totalOutputWeight} kg</p>
                    <p>
                      Waste:{" "}
                      {wastePercentage === null ? "-" : `${wastePercentage}%`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 w-full rounded-xl"
                    onClick={() => openCreateModal(po)}
                  >
                    Submit Daily Progress
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No active knitting plans"
            description="Create a production plan first, then the PO becomes available for daily progress reporting."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Daily Production Log</h2>
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
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "-"),
              },
            ]}
            data={progressEntries}
          />
        ) : (
          <EmptyState
            title="No daily progress submitted"
            description="Daily knitting reports will appear here and update the module metrics as the floor reports output."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Waste Percentage Log</h2>
        {wasteLogRows.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              {
                key: "issuedQty",
                header: "Issued Yarn (kg)",
                render: (row) => String(row.issuedQty),
              },
              {
                key: "totalOutputWeight",
                header: "Finished Output (kg)",
                render: (row) => String(row.totalOutputWeight),
              },
              {
                key: "totalProduced",
                header: "Produced Qty",
                render: (row) => `${row.totalProduced} pcs`,
              },
              {
                key: "wastePercentage",
                header: "Waste %",
                render: (row) =>
                  row.wastePercentage === null
                    ? "-"
                    : `${row.wastePercentage}%`,
              },
              {
                key: "status",
                header: "Stage",
                render: (row) => <StatusBadge value={String(row.status)} />,
              },
            ]}
            data={wasteLogRows}
          />
        ) : (
          <EmptyState
            title="No waste records yet"
            description="Waste percentage appears here automatically once issued yarn and finished output weight have been logged."
          />
        )}
      </section>

      <DailyProductionEntryModal
        open={isModalOpen}
        title="Submit Knitting Daily Progress"
        description="Log today's progress, finished knit output weight, and remarks. When cumulative production reaches the PO quantity, the system routes it to Linking."
        register={register}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPo(null)
        }}
        onReset={() => {
          if (!selectedPo) {
            return
          }

          const plan = plans.find((item) => item.poId === selectedPo.id)
          reset({
            poId: selectedPo.id,
            poNumber: selectedPo.poNumber,
            entryDate: todayIso,
            plannedQty: String(plan?.dailyTarget ?? 0),
            producedQty: "",
            finishedOutputWeight: "",
            remarks: "",
          })
        }}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Save Daily Progress"
      />
    </div>
  )
}
