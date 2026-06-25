import { CheckCircle, ShieldAlert, XCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { FileUploadField } from "@/components/shared/file-upload-field"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import {
  addStockMovement,
  updateBatchInspectionStatus,
  updateCheckRequestStatus,
  updateSupplierOrderStatus,
} from "@/store/slices/yarn-check-slice"
import type { YarnDeliveryBatch } from "@/types/modules"

export function YarnBatchInspectionPage() {
  const dispatch = useAppDispatch()
  const deliveryBatches = useAppSelector(
    (state) => state.yarnCheck.deliveryBatches
  )
  const supplierOrders = useAppSelector(
    (state) => state.yarnCheck.supplierOrders
  )
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const [inspectingBatch, setInspectingBatch] =
    useState<YarnDeliveryBatch | null>(null)
  const [testReportName, setTestReportName] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [remarks, setRemarks] = useState("")

  const pendingBatches = deliveryBatches.filter(
    (b) =>
      b.inspectionStatus === "Received" || b.inspectionStatus === "Pending"
  )
  const inspectedBatches = deliveryBatches.filter(
    (b) =>
      b.inspectionStatus === "Accepted" || b.inspectionStatus === "Rejected"
  )

  const openInspection = (batch: YarnDeliveryBatch) => {
    setInspectingBatch(batch)
    setTestReportName(batch.testReportName ?? "")
    setRejectionReason("")
    setRemarks(batch.remarks ?? "")
  }

  const handleAccept = () => {
    if (!inspectingBatch) return

    dispatch(
      updateBatchInspectionStatus({
        id: inspectingBatch.id,
        inspectionStatus: "Accepted",
        inspectedBy: "Yarn Controller",
        inspectedAt: new Date().toISOString(),
        testReportName: testReportName || undefined,
        remarks,
      })
    )

    // Check if all required quantity is now accepted
    const order = supplierOrders.find(
      (o) => o.id === inspectingBatch.supplierOrderId
    )
    if (order) {
      const purchaseOrder = purchaseOrders.find((po) => po.id === order.poId)
      const requiredQty = purchaseOrder?.requiredYarnQty ?? order.orderedQty
      const poBatches = deliveryBatches.filter((b) => b.poId === order.poId)
      const totalAccepted = poBatches
        .filter((b) =>
          b.id === inspectingBatch.id
            ? true // this batch is being accepted now
            : b.inspectionStatus === "Accepted"
        )
        .reduce((sum, b) => sum + b.quantity, 0)
      const totalReceivedForOrder = deliveryBatches
        .filter((batch) => batch.supplierOrderId === order.id)
        .reduce((sum, batch) => sum + batch.quantity, 0)

      dispatch(
        addStockMovement({
          id: `ysm-${Date.now()}`,
          poId: order.poId,
          poNumber: order.poNumber,
          yarnType: order.yarnType,
          color: order.color,
          quantity: inspectingBatch.quantity,
          movementType: "Accepted Receipt",
          movementDate: new Date().toISOString(),
          referenceId: inspectingBatch.id,
          referenceLabel: inspectingBatch.batchNumber,
          createdBy: "Yarn Controller",
          remarks: remarks || "Accepted yarn inspection batch.",
        })
      )

      if (totalReceivedForOrder >= order.orderedQty) {
        dispatch(
          updateSupplierOrderStatus({
            id: order.id,
            status: "Fully Received",
          })
        )
      }

      if (totalAccepted >= requiredQty) {
        dispatch(
          updateCheckRequestStatus({
            id: order.yarnCheckRequestId,
            status: "Fulfilled",
          })
        )
        dispatch(
          updatePoStatus({ id: order.poId, status: "Ready for Production" })
        )
        toast.success(
          `PO ${order.poNumber}: All required yarn accepted! Routed to production.`
        )
      } else {
        toast.success(
          `Batch ${inspectingBatch.batchNumber} accepted. ${totalAccepted}/${requiredQty} kg approved for release.`
        )
      }
    } else {
      toast.success(
        `Batch ${inspectingBatch.batchNumber} accepted and stock updated.`
      )
    }

    setInspectingBatch(null)
  }

  const handleReject = () => {
    if (!inspectingBatch) return
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason for audit trail.")
      return
    }

    dispatch(
      updateBatchInspectionStatus({
        id: inspectingBatch.id,
        inspectionStatus: "Rejected",
        inspectedBy: "Yarn Controller",
        inspectedAt: new Date().toISOString(),
        testReportName: testReportName || undefined,
        rejectionReason,
        remarks,
      })
    )

    toast.warning(
      `Batch ${inspectingBatch.batchNumber} rejected. Supplier notified. Reason logged permanently.`
    )
    setInspectingBatch(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Inspection"
        description="Inspect delivery batches, upload test reports, and accept or reject. Records are permanent after submission (audit trail)."
      />

      {/* Audit Trail Notice */}
      <div className="flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div>
          <p className="font-semibold text-amber-700 dark:text-amber-300">
            Permanent Audit Trail
          </p>
          <p className="mt-1 text-amber-600 dark:text-amber-400">
            Inspection records cannot be edited after submission. All batch
            numbers, quantities, test reports, rejection reasons, timestamps,
            and user information are retained permanently for compliance.
          </p>
        </div>
      </div>

      {/* Pending Inspections */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Awaiting Inspection ({pendingBatches.length})
        </h2>
        {pendingBatches.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pendingBatches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{batch.batchNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      PO: {batch.poNumber}
                    </p>
                  </div>
                  <StatusBadge value={batch.inspectionStatus} />
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>Quantity: {batch.quantity} kg</p>
                  <p>Delivered: {batch.deliveryDate}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="mt-4 w-full rounded-xl"
                  onClick={() => openInspection(batch)}
                >
                  Inspect Batch
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No batches awaiting inspection.
            </p>
          </div>
        )}
      </section>

      {/* Inspection History (Immutable) */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Inspection History (Audit Log)
        </h2>
        {inspectedBatches.length > 0 ? (
          <DataTable
            columns={[
              { key: "batchNumber", header: "Batch No" },
              { key: "poNumber", header: "PO" },
              {
                key: "quantity",
                header: "Qty (kg)",
                render: (row) => String(row.quantity),
              },
              { key: "deliveryDate", header: "Delivery Date" },
              {
                key: "inspectionStatus",
                header: "Result",
                render: (row) => (
                  <StatusBadge value={String(row.inspectionStatus)} />
                ),
              },
              {
                key: "testReportName",
                header: "Test Report",
                render: (row) =>
                  row.testReportName ? (
                    <span className="text-sm text-sky-600 dark:text-sky-400">
                      {String(row.testReportName)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  ),
              },
              {
                key: "rejectionReason",
                header: "Rejection Reason",
                render: (row) =>
                  row.rejectionReason ? (
                    <span className="text-sm text-rose-600 dark:text-rose-400">
                      {String(row.rejectionReason)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">–</span>
                  ),
              },
              {
                key: "inspectedBy",
                header: "Inspector",
                render: (row) => String(row.inspectedBy ?? "–"),
              },
              {
                key: "inspectedAt",
                header: "Inspected At",
                render: (row) =>
                  row.inspectedAt
                    ? new Date(String(row.inspectedAt)).toLocaleString()
                    : "–",
              },
            ]}
            data={inspectedBatches}
          />
        ) : (
          <div className="rounded-[1.75rem] border border-border/70 bg-card p-8 text-center shadow-sm">
            <p className="text-muted-foreground">
              No inspection records yet. Inspect a batch above to begin.
            </p>
          </div>
        )}
      </section>

      {/* Inspection Modal */}
      {inspectingBatch && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  Inspect {inspectingBatch.batchNumber}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  PO: {inspectingBatch.poNumber} · Qty:{" "}
                  {inspectingBatch.quantity} kg · Delivered:{" "}
                  {inspectingBatch.deliveryDate}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setInspectingBatch(null)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Test Report Upload */}
              <FileUploadField
                label="Test Report Attachment"
                value={testReportName}
                onChange={setTestReportName}
                onClear={() => setTestReportName("")}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />

              {/* Remarks */}
              <div className="space-y-2">
                <label
                  htmlFor="inspection-remarks"
                  className="text-sm font-medium"
                >
                  Inspection Remarks
                </label>
                <textarea
                  id="inspection-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Quality observations, test results summary..."
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  rows={3}
                />
              </div>

              {/* Rejection Reason (only shown when needed) */}
              <div className="space-y-2">
                <label
                  htmlFor="rejection-reason"
                  className="text-sm font-medium"
                >
                  Rejection Reason (required if rejecting)
                </label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Describe why this batch is being rejected..."
                  className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setInspectingBatch(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
                  onClick={handleReject}
                >
                  <XCircle className="mr-1.5 size-4" />
                  Reject Batch
                </Button>
                <Button
                  type="button"
                  className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleAccept}
                >
                  <CheckCircle className="mr-1.5 size-4" />
                  Accept Batch
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
