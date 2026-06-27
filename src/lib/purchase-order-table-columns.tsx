import { StatusBadge } from "@/components/shared/status-badge"
import type {
  DataTableColumn,
  DataTableHeaderRow,
} from "@/components/shared/data-table"
import {
  getPurchaseOrderDisplayAccessories,
  getPurchaseOrderDisplayCcd,
  getPurchaseOrderDisplayGauge,
  getPurchaseOrderDisplayItemNameCode,
  getPurchaseOrderDisplayNo,
  getPurchaseOrderDisplayPpStatus,
  getPurchaseOrderDisplayProductionUnit,
  getPurchaseOrderDisplayQty,
  getPurchaseOrderDisplayShipmentSample,
  getPurchaseOrderDisplayStyle,
  getPurchaseOrderDisplayYarn,
} from "@/lib/purchase-orders"
import type { PurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
import type { PurchaseOrder } from "@/types/modules"

export function getTextValue(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return "-"
  }

  return String(value)
}

export function getOrderDisplayNo(order: PurchaseOrder) {
  return getPurchaseOrderDisplayNo(order)
}

export function getOrderDisplayStyle(order: PurchaseOrder) {
  return getPurchaseOrderDisplayStyle(order)
}

export function getOrderDisplayGauge(order: PurchaseOrder) {
  return getPurchaseOrderDisplayGauge(order)
}

export function getOrderDisplayYarn(order: PurchaseOrder) {
  return getPurchaseOrderDisplayYarn(order)
}

export function getOrderDisplayQty(order: PurchaseOrder) {
  return getPurchaseOrderDisplayQty(order)
}

export function formatOptionalNumber(value: number | undefined) {
  return value === undefined ? "-" : value.toLocaleString()
}

function buildMerchandiserRemarks(order: PurchaseOrder) {
  return order.remarks?.trim() || "-"
}

export const merchandiserWorkflowColumnKeys = [
  "styleName",
  "styleNo",
  "gauge",
  "quality",
  "poNumber",
  "quantity",
  "ccd",
  "colors",
  "itemNameCode",
  "accessories",
  "polyCarton",
  "ppStatus",
  "shipmentSample",
  "remarks",
] as const

export const designWorkflowColumnKeys = [
  "totalYarnKg",
  "totalFabricKg",
  "totalAccessoriesQty",
] as const

export const purchaseOrderWorkflowHeaderRows: DataTableHeaderRow[] = [
  {
    key: "department-groups",
    cells: [
      { key: "sl", label: "SL", rowSpan: 2 },
      {
        key: "merchandiser",
        label: "Merchandiser",
        colSpan: 14,
        className:
          "border-r-2 border-border/90 bg-sky-100 text-center dark:bg-sky-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "design-controller",
        label: "Design Controller",
        colSpan: 3,
        className:
          "border-r-2 border-border/90 bg-violet-100 text-center dark:bg-violet-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "yarn-controller",
        label: "Yarn Controller",
        colSpan: 7,
        className:
          "border-r-2 border-border/90 bg-emerald-100 text-center dark:bg-emerald-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "store-controller",
        label: "Store Controller",
        colSpan: 5,
        className:
          "border-r-2 border-border/90 bg-amber-100 text-center dark:bg-amber-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "status",
        label: "Status",
        rowSpan: 2,
        className: "bg-rose-100 dark:bg-rose-500/20",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      {
        key: "action",
        label: "Action",
        rowSpan: 2,
        className: "bg-cyan-100 dark:bg-cyan-500/20",
        stickyClassName:
          "right-0 border-l-2 border-border bg-cyan-100 dark:bg-cyan-500/20",
        stickyShadowClassName: "shadow-[-6px_0_10px_-8px_rgba(15,23,42,0.35)]",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
    ],
  },
  {
    key: "field-columns",
    cells: [
      { key: "styleName", label: "Style Name", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "styleNo", label: "Style Number", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "gauge", label: "Gauge", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "quality", label: "Quality", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "poNumber", label: "PO Number", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "quantity", label: "Quantity", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "ccd", label: "CCD", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "colors", label: "Colors", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "itemNameCode", label: "Item Name & Code", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "accessories", label: "Accessories", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "polyCarton", label: "Poly/CTN", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "ppStatus", label: "PP Status", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "shipmentSample", label: "Shipment Sample", className: "bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "remarks", label: "Remarks", className: "border-r-2 border-border/90 bg-sky-50 dark:bg-sky-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "totalYarnKg", label: "Total Yarn (kg)", className: "bg-violet-50 dark:bg-violet-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "totalFabricKg", label: "Total Fabric (kg)", className: "bg-violet-50 dark:bg-violet-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      {
        key: "totalAccessoriesQty",
        label: "Total Accessories Qty",
        className: "border-r-2 border-border/90 bg-violet-50 dark:bg-violet-500/15",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      { key: "yarnSupplier", label: "Supplier", className: "bg-emerald-50 dark:bg-emerald-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "yarnEta", label: "ETA", className: "bg-emerald-50 dark:bg-emerald-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "yarnInspectionStatus", label: "Inspection Status", className: "bg-emerald-50 dark:bg-emerald-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "yarnInspectionDate", label: "Inspection Date", className: "bg-emerald-50 dark:bg-emerald-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "yarnReceivedQty", label: "Received Qty (kg)", className: "bg-emerald-50 dark:bg-emerald-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "yarnIssuedQty", label: "Issued Qty (kg)", className: "bg-emerald-50 dark:bg-emerald-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      {
        key: "yarnStockBalance",
        label: "Stock Balance (kg)",
        className: "border-r-2 border-border/90 bg-emerald-50 dark:bg-emerald-500/15",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
      { key: "storeSupplier", label: "Supplier", className: "bg-amber-50 dark:bg-amber-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "storeReceivedQty", label: "Received Qty", className: "bg-amber-50 dark:bg-amber-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "storeInspectionStatus", label: "Inspection Status", className: "bg-amber-50 dark:bg-amber-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      { key: "storeInspectionDate", label: "Inspection Date", className: "bg-amber-50 dark:bg-amber-500/15", labelClassName: "text-slate-900 dark:text-slate-100" },
      {
        key: "storeStockBalance",
        label: "Stock Balance",
        className: "border-r-2 border-border/90 bg-amber-50 dark:bg-amber-500/15",
        labelClassName: "text-slate-900 dark:text-slate-100",
      },
    ],
  },
]

export function getDesignRequestHeaderRows() {
  return [
    {
      key: "department-groups",
      cells: purchaseOrderWorkflowHeaderRows[0].cells.filter((cell) =>
        ["sl", "merchandiser", "design-controller", "action"].includes(cell.key)
      ),
    },
    {
      key: "field-columns",
      cells: purchaseOrderWorkflowHeaderRows[1].cells.filter((cell) =>
        [...merchandiserWorkflowColumnKeys, ...designWorkflowColumnKeys].includes(
          cell.key as
            | (typeof merchandiserWorkflowColumnKeys)[number]
            | (typeof designWorkflowColumnKeys)[number]
        )
      ),
    },
  ] satisfies DataTableHeaderRow[]
}

export function getDesignSubmittedHeaderRows() {
  return [
    {
      key: "department-groups",
      cells: purchaseOrderWorkflowHeaderRows[0].cells.filter((cell) =>
        ["sl", "merchandiser", "design-controller"].includes(cell.key)
      ),
    },
    {
      key: "field-columns",
      cells: purchaseOrderWorkflowHeaderRows[1].cells.filter((cell) =>
        [...merchandiserWorkflowColumnKeys, ...designWorkflowColumnKeys].includes(
          cell.key as
            | (typeof merchandiserWorkflowColumnKeys)[number]
            | (typeof designWorkflowColumnKeys)[number]
        )
      ),
    },
  ] satisfies DataTableHeaderRow[]
}

const yarnPoListMerchandiserColumnKeys = [
  "styleName",
  "styleNo",
  "gauge",
  "quality",
  "poNumber",
  "quantity",
  "ccd",
  "colors",
  "itemNameCode",
] as const

const yarnPoListDesignColumnKeys = [
  "totalYarnKg",
  "totalFabricKg",
  "totalAccessoriesQty",
] as const

const yarnPoListYarnColumnKeys = [
  "yarnSupplier",
  "yarnEta",
  "yarnInspectionStatus",
  "yarnInspectionDate",
  "yarnReceivedQty",
  "yarnIssuedQty",
  "yarnStockBalance",
] as const

export function getYarnPoListHeaderRows() {
  return [
    {
      key: "department-groups",
      cells: [
        {
          key: "merchandiser",
          label: "Merchandiser",
          colSpan: 9,
          className:
            "border-r-2 border-border/90 bg-sky-100 text-center dark:bg-sky-500/20",
          labelClassName: "text-slate-900 dark:text-slate-100",
        },
        {
          key: "design-controller",
          label: "Design Controller",
          colSpan: 3,
          className:
            "border-r-2 border-border/90 bg-violet-100 text-center dark:bg-violet-500/20",
          labelClassName: "text-slate-900 dark:text-slate-100",
        },
        {
          key: "yarn-controller",
          label: "Yarn Controller",
          colSpan: 7,
          className:
            "border-r-2 border-border/90 bg-emerald-100 text-center dark:bg-emerald-500/20",
          labelClassName: "text-slate-900 dark:text-slate-100",
        },
        {
          key: "remarks",
          label: "Remarks",
          rowSpan: 2,
          className: "bg-amber-100 dark:bg-amber-500/20",
          labelClassName: "text-slate-900 dark:text-slate-100",
        },
      ],
    },
    {
      key: "field-columns",
      cells: purchaseOrderWorkflowHeaderRows[1].cells.filter((cell) =>
        [
          ...yarnPoListMerchandiserColumnKeys,
          ...yarnPoListDesignColumnKeys,
          ...yarnPoListYarnColumnKeys,
        ].includes(
          cell.key as
            | (typeof yarnPoListMerchandiserColumnKeys)[number]
            | (typeof yarnPoListDesignColumnKeys)[number]
            | (typeof yarnPoListYarnColumnKeys)[number]
        )
      ),
    },
  ] satisfies DataTableHeaderRow[]
}

export function getPurchaseOrderWorkflowColumns(
  metrics: Partial<PurchaseOrderWorkflowMetrics>
): DataTableColumn<PurchaseOrder>[] {
  const normalizedMetrics: PurchaseOrderWorkflowMetrics = {
    yarnSupplierByPo: metrics.yarnSupplierByPo ?? {},
    yarnEtaByPo: metrics.yarnEtaByPo ?? {},
    yarnInspectionDateByPo: metrics.yarnInspectionDateByPo ?? {},
    yarnInspectionStatusByPo: metrics.yarnInspectionStatusByPo ?? {},
    yarnIssuedQtyByPo: metrics.yarnIssuedQtyByPo ?? {},
    yarnReceivedQtyByPo: metrics.yarnReceivedQtyByPo ?? {},
    yarnStockBalanceByPo: metrics.yarnStockBalanceByPo ?? {},
    inventoryStatusByPo: metrics.inventoryStatusByPo ?? {},
    storeInspectionDateByPo: metrics.storeInspectionDateByPo ?? {},
    storeInspectionStatusByPo: metrics.storeInspectionStatusByPo ?? {},
    storeReceivedQtyByPo: metrics.storeReceivedQtyByPo ?? {},
    storeStockBalanceByPo: metrics.storeStockBalanceByPo ?? {},
    storeSupplierByPo: metrics.storeSupplierByPo ?? {},
  }

  return [
    {
      key: "sl",
      header: "SL",
      className: "border-r-2 border-border/90",
      render: (_row, rowIndex) => String(rowIndex + 1).padStart(2, "0"),
    },
    {
      key: "styleName",
      header: "Style Name",
      render: (row) => getTextValue(getOrderDisplayStyle(row)),
    },
    {
      key: "styleNo",
      header: "Style Number",
      render: (row) => getTextValue(row.styleNo),
    },
    {
      key: "gauge",
      header: "Gauge",
      render: (row) => getTextValue(getOrderDisplayGauge(row)),
    },
    {
      key: "quality",
      header: "Quality",
      render: (row) => getTextValue(row.quality || getOrderDisplayYarn(row)),
    },
    {
      key: "poNumber",
      header: "PO Number",
      render: (row) => getTextValue(getOrderDisplayNo(row)),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row) => getOrderDisplayQty(row).toLocaleString(),
    },
    {
      key: "ccd",
      header: "CCD",
      render: (row) => getTextValue(getPurchaseOrderDisplayCcd(row)),
    },
    {
      key: "colors",
      header: "Colors",
      render: (row) => getTextValue(row.color),
    },
    {
      key: "itemNameCode",
      header: "Item Name & Code",
      render: (row) => getTextValue(getPurchaseOrderDisplayItemNameCode(row)),
    },
    {
      key: "accessories",
      header: "Accessories",
      render: (row) => getTextValue(getPurchaseOrderDisplayAccessories(row)),
    },
    {
      key: "polyCarton",
      header: "Poly/CTN",
      render: (row) => getTextValue(getPurchaseOrderDisplayProductionUnit(row)),
    },
    {
      key: "ppStatus",
      header: "PP Status",
      render: (row) => getTextValue(getPurchaseOrderDisplayPpStatus(row)),
    },
    {
      key: "shipmentSample",
      header: "Shipment Sample",
      render: (row) =>
        getTextValue(getPurchaseOrderDisplayShipmentSample(row)),
    },
    {
      key: "remarks",
      header: "Remarks",
      className: "border-r-2 border-border/90",
      render: (row) => getTextValue(buildMerchandiserRemarks(row)),
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
      className: "border-r-2 border-border/90",
      render: (row) => formatOptionalNumber(row.totalAccessoriesQty),
    },
    {
      key: "yarnSupplier",
      header: "Supplier",
      render: (row) =>
        getTextValue(normalizedMetrics.yarnSupplierByPo[row.id] ?? row.supplier),
    },
    {
      key: "yarnEta",
      header: "ETA",
      render: (row) =>
        getTextValue(normalizedMetrics.yarnEtaByPo[row.id] ?? row.yarnEta),
    },
    {
      key: "yarnInspectionStatus",
      header: "Inspection Status",
      render: (row) =>
        getTextValue(normalizedMetrics.yarnInspectionStatusByPo[row.id]),
    },
    {
      key: "yarnInspectionDate",
      header: "Inspection Date",
      render: (row) =>
        getTextValue(normalizedMetrics.yarnInspectionDateByPo[row.id]),
    },
    {
      key: "yarnReceivedQty",
      header: "Received Qty (kg)",
      render: (row) =>
        formatOptionalNumber(normalizedMetrics.yarnReceivedQtyByPo[row.id]),
    },
    {
      key: "yarnIssuedQty",
      header: "Issued Qty (kg)",
      render: (row) =>
        formatOptionalNumber(normalizedMetrics.yarnIssuedQtyByPo[row.id]),
    },
    {
      key: "yarnStockBalance",
      header: "Stock Balance (kg)",
      className: "border-r-2 border-border/90",
      render: (row) =>
        formatOptionalNumber(normalizedMetrics.yarnStockBalanceByPo[row.id]),
    },
    {
      key: "storeSupplier",
      header: "Supplier",
      render: (row) => getTextValue(normalizedMetrics.storeSupplierByPo[row.id]),
    },
    {
      key: "storeReceivedQty",
      header: "Received Qty",
      render: (row) =>
        formatOptionalNumber(normalizedMetrics.storeReceivedQtyByPo[row.id]),
    },
    {
      key: "storeInspectionStatus",
      header: "Inspection Status",
      render: (row) =>
        getTextValue(normalizedMetrics.storeInspectionStatusByPo[row.id]),
    },
    {
      key: "storeInspectionDate",
      header: "Inspection Date",
      render: (row) =>
        getTextValue(normalizedMetrics.storeInspectionDateByPo[row.id]),
    },
    {
      key: "storeStockBalance",
      header: "Stock Balance",
      className: "border-r-2 border-border/90",
      render: (row) =>
        formatOptionalNumber(normalizedMetrics.storeStockBalanceByPo[row.id]),
    },
    {
      key: "status",
      header: "Status",
      className: "w-[6.5rem] min-w-[6.5rem] border-r-2 border-border/90",
      render: (row) => <StatusBadge value={String(row.status)} />,
    },
  ]
}

export function getDesignRequestWorkflowColumns(
  metrics: Partial<PurchaseOrderWorkflowMetrics>
) {
  const baseColumns = getPurchaseOrderWorkflowColumns(metrics)

  return baseColumns.filter((column) =>
    ["sl", ...merchandiserWorkflowColumnKeys, ...designWorkflowColumnKeys].includes(
      column.key as string
    )
  )
}

export function getYarnPoListWorkflowColumns(
  metrics: Partial<PurchaseOrderWorkflowMetrics>
) {
  const baseColumns = getPurchaseOrderWorkflowColumns(metrics)

  return [
    ...baseColumns.filter((column) =>
      [
        ...yarnPoListMerchandiserColumnKeys,
        ...yarnPoListDesignColumnKeys,
        ...yarnPoListYarnColumnKeys,
      ].includes(column.key as string)
    ),
    {
      key: "remarks",
      header: "Remarks",
      render: (row: PurchaseOrder) => getTextValue(buildMerchandiserRemarks(row)),
    } satisfies DataTableColumn<PurchaseOrder>,
  ]
}
