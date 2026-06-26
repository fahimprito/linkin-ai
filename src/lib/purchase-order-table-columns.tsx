import { StatusBadge } from "@/components/shared/status-badge"
import type { DataTableColumn } from "@/components/shared/data-table"
import type { PurchaseOrder } from "@/types/modules"

export function getTextValue(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return "-"
  }

  return String(value)
}

export function getOrderDisplayNo(order: PurchaseOrder) {
  return order.orderNo || order.poNumber
}

export function getOrderDisplayStyle(order: PurchaseOrder) {
  return order.styleName || order.style
}

export function getOrderDisplayGauge(order: PurchaseOrder) {
  return order.gauge || order.gg || ""
}

export function getOrderDisplayYarn(order: PurchaseOrder) {
  return order.yarn || order.yarnComposition || ""
}

export function getOrderDisplayQty(order: PurchaseOrder) {
  return order.poQty ?? order.quantity
}

export function formatOptionalNumber(value: number | undefined) {
  return value === undefined ? "-" : value.toLocaleString()
}

export const purchaseOrderTableColumns: DataTableColumn<PurchaseOrder>[] = [
  {
    key: "sl",
    header: "SL",
    render: (row) => getTextValue(row.sl),
  },
  {
    key: "styleName",
    header: "Style Name",
    render: (row) => getTextValue(getOrderDisplayStyle(row)),
  },
  {
    key: "styleNo",
    header: "Style No",
    render: (row) => getTextValue(row.styleNo),
  },
  {
    key: "callNumber",
    header: "CALL#",
    render: (row) => getTextValue(row.callNumber),
  },
  {
    key: "orderNo",
    header: "Order No",
    render: (row) => getTextValue(getOrderDisplayNo(row)),
  },
  {
    key: "productionUnit",
    header: "Production Unit",
    render: (row) => getTextValue(row.productionUnit),
  },
  {
    key: "mainSizeHangTagBooking",
    header: "Main+ Size + Hang Tag Booking",
    render: (row) => getTextValue(row.mainSizeHangTagBooking),
  },
  {
    key: "careLabelBooking",
    header: "Care Label Booking",
    render: (row) => getTextValue(row.careLabelBooking),
  },
  {
    key: "priceStickerBooking",
    header: "Price Sticker Booking",
    render: (row) => getTextValue(row.priceStickerBooking),
  },
  {
    key: "tissue",
    header: "TISSUE",
    render: (row) => getTextValue(row.tissue),
  },
  {
    key: "polyCartonBooking",
    header: "Poly + Carton Booking",
    render: (row) => getTextValue(row.polyCartonBooking),
  },
  {
    key: "buttonZip",
    header: "But/Zip",
    render: (row) => getTextValue(row.buttonZip),
  },
  {
    key: "doneInspection",
    header: "Done Inspection",
    render: (row) => getTextValue(row.doneInspection),
  },
  {
    key: "color",
    header: "Color",
    render: (row) => getTextValue(row.color),
  },
  {
    key: "sampleStatus",
    header: "Sample Status",
    render: (row) => getTextValue(row.sampleStatus),
  },
  {
    key: "shipMode",
    header: "SHP MODE",
    render: (row) => getTextValue(row.shipMode),
  },
  {
    key: "ccd",
    header: "CCD",
    render: (row) => getTextValue(row.ccd || row.deliveryDate),
  },
  {
    key: "excessQty",
    header: "EXCESS QTY",
    render: (row) => formatOptionalNumber(row.excessQty),
  },
  {
    key: "newCcd",
    header: "NEW CCD",
    render: (row) => getTextValue(row.newCcd),
  },
  {
    key: "inspectionStyle",
    header: "Inspection Style",
    render: (row) => getTextValue(row.inspectionStyle),
  },
  {
    key: "stylePhoto",
    header: "Photo",
    render: (row) => getTextValue(row.stylePhoto),
  },
  {
    key: "sizeRange",
    header: "Size Range",
    render: (row) => getTextValue(row.sizeRange),
  },
  {
    key: "poQty",
    header: "PO Qty",
    render: (row) => getOrderDisplayQty(row).toLocaleString(),
  },
  {
    key: "yarn",
    header: "Yarn",
    render: (row) => getTextValue(getOrderDisplayYarn(row)),
  },
  {
    key: "gauge",
    header: "Gauge",
    render: (row) => getTextValue(getOrderDisplayGauge(row)),
  },
  {
    key: "price",
    header: "Price",
    render: (row) => formatOptionalNumber(row.price),
  },
  {
    key: "amount",
    header: "Amount",
    render: (row) => formatOptionalNumber(row.amount),
  },
  {
    key: "factoryCosting",
    header: "Factory Costing",
    render: (row) => getTextValue(row.factoryCosting),
  },
  {
    key: "labTest",
    header: "Lab Test",
    render: (row) => getTextValue(row.labTest),
  },
  {
    key: "yarnEta",
    header: "Yarn ETA",
    render: (row) => getTextValue(row.yarnEta),
  },
  {
    key: "totalYarnKg",
    header: "Total Yarn (kg)",
    render: (row) => formatOptionalNumber(row.totalYarnKg),
  },
  {
    key: "totalFabricKg",
    header: "Total Fabric (kg)",
    render: (row) => formatOptionalNumber(row.totalFabricKg),
  },
  {
    key: "totalAccessoriesQty",
    header: "Total Accessories Qty",
    render: (row) => formatOptionalNumber(row.totalAccessoriesQty),
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge value={String(row.status)} />,
  },
]
