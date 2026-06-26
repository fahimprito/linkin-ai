import { useParams } from "react-router"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  PO_LIFECYCLE_STAGES,
  StageTracker,
  poStatusToStage,
} from "@/components/shared/stage-tracker"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"
import type { PurchaseOrder } from "@/types/modules"

function getTextValue(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return "-"
  }

  return String(value)
}

function getNumberValue(value: number | undefined | null, suffix?: string) {
  if (value === undefined || value === null) {
    return "-"
  }

  const formatted = value.toLocaleString()
  return suffix ? `${formatted} ${suffix}` : formatted
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1.25rem] bg-secondary/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-foreground">
        {value}
      </p>
    </div>
  )
}

function getPoSummary(po: PurchaseOrder) {
  return {
    orderNo: po.orderNo || po.poNumber,
    styleName: po.styleName || po.style,
    gauge: po.gauge || po.gg,
    yarn: po.yarn || po.yarnComposition,
    poQty: po.poQty ?? po.quantity,
  }
}

export function MerchandisePoDetailPage() {
  const { poId = "" } = useParams()
  const po = useAppSelector((state) =>
    state.merchandise.purchaseOrders.find((order) => order.id === poId)
  )
  const yarnCheckRequest = useAppSelector((state) =>
    state.yarnCheck.checkRequests.find((request) => request.poId === poId)
  )
  const supplierOrders = useAppSelector((state) =>
    state.yarnCheck.supplierOrders.filter((order) => order.poId === poId)
  )
  const deliveryBatches = useAppSelector((state) =>
    state.yarnCheck.deliveryBatches.filter((batch) => batch.poId === poId)
  )

  if (!po) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="The requested PO detail could not be loaded."
      />
    )
  }

  const summary = getPoSummary(po)
  const merchandiseFields = [
    { label: "SL", value: getTextValue(po.sl) },
    { label: "Style Name", value: getTextValue(summary.styleName) },
    { label: "Style No", value: getTextValue(po.styleNo) },
    { label: "CALL#", value: getTextValue(po.callNumber) },
    { label: "Order No", value: getTextValue(summary.orderNo) },
    { label: "Buyer", value: getTextValue(po.buyer) },
    { label: "Production Unit", value: getTextValue(po.productionUnit) },
    { label: "Color", value: getTextValue(po.color) },
    { label: "Sample Status", value: getTextValue(po.sampleStatus) },
    { label: "Inspection Style", value: getTextValue(po.inspectionStyle) },
    { label: "Size Range", value: getTextValue(po.sizeRange) },
    { label: "Photo", value: getTextValue(po.stylePhoto) },
  ]
  const bookingFields = [
    {
      label: "Main + Size + Hang Tag Booking",
      value: getTextValue(po.mainSizeHangTagBooking),
    },
    { label: "Care Label Booking", value: getTextValue(po.careLabelBooking) },
    {
      label: "Price Sticker Booking",
      value: getTextValue(po.priceStickerBooking),
    },
    { label: "TISSUE", value: getTextValue(po.tissue) },
    {
      label: "Poly + Carton Booking",
      value: getTextValue(po.polyCartonBooking),
    },
    { label: "But/Zip", value: getTextValue(po.buttonZip) },
    { label: "Done Inspection", value: getTextValue(po.doneInspection) },
  ]
  const commercialFields = [
    { label: "SHP MODE", value: getTextValue(po.shipMode) },
    { label: "CCD", value: getTextValue(po.ccd || po.deliveryDate) },
    { label: "NEW CCD", value: getTextValue(po.newCcd) },
    { label: "PO Qty", value: getNumberValue(summary.poQty, "pcs") },
    { label: "Excess Qty", value: getNumberValue(po.excessQty, "pcs") },
    { label: "Price", value: getNumberValue(po.price) },
    { label: "Amount", value: getNumberValue(po.amount) },
    { label: "Factory Costing", value: getTextValue(po.factoryCosting) },
  ]
  const yarnFields = [
    { label: "Yarn", value: getTextValue(summary.yarn) },
    { label: "Gauge", value: getTextValue(summary.gauge) },
    {
      label: "Required Yarn Qty",
      value: getNumberValue(po.requiredYarnQty, "kg"),
    },
    { label: "Yarn ETA", value: getTextValue(po.yarnEta) },
    { label: "Supplier", value: getTextValue(po.supplier) },
    { label: "Lab Test", value: getTextValue(po.labTest) },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${summary.orderNo} - ${summary.styleName}`}
      />

      <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Current Stage
        </p>
        <StageTracker
          stages={PO_LIFECYCLE_STAGES}
          currentStage={poStatusToStage(po.status)}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="mt-2">
            <StatusBadge value={po.status} />
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">PO Quantity</p>
          <p className="mt-2 text-2xl font-semibold">
            {getNumberValue(summary.poQty)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Yarn Requirement</p>
          <p className="mt-2 text-2xl font-semibold">
            {getNumberValue(po.requiredYarnQty, "kg")}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Delivery Target</p>
          <p className="mt-2 text-2xl font-semibold">
            {getTextValue(po.newCcd || po.ccd || po.deliveryDate)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Merchandise Details</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {merchandiseFields.map((field) => (
              <DetailItem key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Booking Status</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {bookingFields.map((field) => (
              <DetailItem key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Commercial Information</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {commercialFields.map((field) => (
              <DetailItem key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Yarn Specification</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {yarnFields.map((field) => (
              <DetailItem key={field.label} label={field.label} value={field.value} />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Yarn Check Request</h2>
        {yarnCheckRequest ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <DetailItem label="Request Status" value={yarnCheckRequest.status} />
            <DetailItem
              label="Requested Date"
              value={new Date(yarnCheckRequest.requestedAt).toLocaleDateString()}
            />
            <DetailItem label="Requested By" value={yarnCheckRequest.requestedBy} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No yarn check request yet. Send from the PO list to initiate.
          </p>
        )}
      </section>

      {supplierOrders.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Supplier Orders</h2>
          <DataTable
            columns={[
              {
                key: "itemCategory",
                header: "Type",
                render: (row) => String(row.itemCategory ?? "Yarn"),
              },
              { key: "supplier", header: "Supplier" },
              {
                key: "itemName",
                header: "Item",
                render: (row) => String(row.itemName ?? row.yarnType),
              },
              { key: "color", header: "Color" },
              {
                key: "orderedQty",
                header: "Ordered Qty",
                render: (row) => String(row.orderedQty),
              },
              { key: "expectedArrival", header: "Expected Arrival" },
              {
                key: "deliveryDate",
                header: "Delivery Date",
                render: (row) => String(row.deliveryDate ?? "-"),
              },
              {
                key: "inspectionDate",
                header: "Inspection Date",
                render: (row) => String(row.inspectionDate ?? "-"),
              },
              {
                key: "status",
                header: "Status",
                render: (row) => <StatusBadge value={String(row.status)} />,
              },
            ]}
            data={supplierOrders}
          />
        </section>
      )}

      {deliveryBatches.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Yarn Delivery Log</h2>
          <DataTable
            columns={[
              { key: "batchNumber", header: "Batch No" },
              {
                key: "quantity",
                header: "Qty (kg)",
                render: (row) => String(row.quantity),
              },
              { key: "deliveryDate", header: "Delivery Date" },
              {
                key: "inspectionStatus",
                header: "Inspection",
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
                    <span className="text-muted-foreground">-</span>
                  ),
              },
              {
                key: "remarks",
                header: "Remarks",
                render: (row) => String(row.remarks ?? "-"),
              },
            ]}
            data={deliveryBatches}
          />
        </section>
      )}
    </div>
  )
}

