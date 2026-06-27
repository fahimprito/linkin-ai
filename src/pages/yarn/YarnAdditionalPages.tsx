import { Eye, Printer } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  getYarnPoListHeaderRows,
  getYarnPoListWorkflowColumns,
} from "@/lib/purchase-order-table-columns"
import { createPurchaseOrderWorkflowMetrics } from "@/lib/purchase-order-workflow-metrics"
import { isStatusAtOrAfterSentToYarn } from "@/lib/workflow-status"
import { useAppSelector } from "@/store/hooks"
import type { PurchaseOrder } from "@/types/modules"

type SwatchCardRecord = {
  id: string
  poNumber: string
  styleName: string
  yarnType: string
  color: string
  status: string
  notes: string
  createdAt: string
}

type SwatchCardFormValues = Omit<SwatchCardRecord, "id" | "createdAt">

const SWATCH_STORAGE_KEY = "linkin-yarn-swatch-cards"

const swatchCardFields: ModalFormField[] = [
  { name: "poNumber", label: "PO Number", placeholder: "LK-2005" },
  { name: "styleName", label: "Style Name", placeholder: "V-Neck Pullover" },
  {
    name: "yarnType",
    label: "Yarn Type",
    placeholder: "60% Cotton / 40% Acrylic",
  },
  { name: "color", label: "Color", placeholder: "Olive Green" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Generated", "Prepared", "Sent", "Approved"],
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Swatch card remarks",
  },
]

function loadSwatchCards() {
  if (typeof window === "undefined") {
    return [] as SwatchCardRecord[]
  }

  try {
    const raw = window.localStorage.getItem(SWATCH_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SwatchCardRecord[]) : []
  } catch {
    window.localStorage.removeItem(SWATCH_STORAGE_KEY)
    return []
  }
}

function saveSwatchCards(records: SwatchCardRecord[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(SWATCH_STORAGE_KEY, JSON.stringify(records))
}

function createSwatchCardId() {
  return `swatch-${Date.now()}`
}

function hasSubmittedConsumption(order: PurchaseOrder) {
  return isStatusAtOrAfterSentToYarn(order.status)
}

export function YarnPoListPage() {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const deliveryBatches = useAppSelector((state) => state.yarnCheck.deliveryBatches)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const supplierOrders = useAppSelector((state) => state.yarnCheck.supplierOrders)
  const [searchQuery, setSearchQuery] = useState("")

  const visiblePurchaseOrders = useMemo(
    () =>
      purchaseOrders
        .filter(hasSubmittedConsumption)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [purchaseOrders]
  )

  const yarnMetrics = useMemo(() => {
    return createPurchaseOrderWorkflowMetrics({
      purchaseOrders,
      deliveryBatches,
      stockMovements,
      supplierOrders,
    })
  }, [deliveryBatches, purchaseOrders, stockMovements, supplierOrders])

  const columns = useMemo(
    () => getYarnPoListWorkflowColumns(yarnMetrics),
    [yarnMetrics]
  )
  const headerRows = useMemo(() => getYarnPoListHeaderRows(), [])

  const filteredPurchaseOrders = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    if (!normalizedSearch) {
      return visiblePurchaseOrders
    }

    return visiblePurchaseOrders.filter((po) =>
      [
        po.poNumber,
        po.orderNo,
        po.styleName,
        po.style,
        po.styleNo,
        po.color,
        po.supplier,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    )
  }, [searchQuery, visiblePurchaseOrders])

  return (
    <div className="space-y-6">
      <PageHeader title="PO List" />
      <SearchFilterBar
        filters={["Submitted POs"]}
        activeFilter="Submitted POs"
        searchPlaceholder="Search PO, style, style number, color, supplier"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />
      {filteredPurchaseOrders.length === 0 ? (
        <EmptyState
          title="No submitted POs yet"
          description="After the Design Controller submits a PO, it will appear here automatically."
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredPurchaseOrders}
          headerRows={headerRows}
          compact
        />
      )}
    </div>
  )
}

export function YarnSwatchCardPage() {
  const [records, setRecords] = useState<SwatchCardRecord[]>(() => loadSwatchCards())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Swatches")
  const [viewingRecord, setViewingRecord] = useState<SwatchCardRecord | null>(null)
  const { register, handleSubmit, reset } = useForm<SwatchCardFormValues>({
    defaultValues: {
      poNumber: "",
      styleName: "",
      yarnType: "",
      color: "",
      status: "Generated",
      notes: "",
    },
  })

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      const matchesFilter =
        activeFilter === "All Swatches" || record.status === activeFilter

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        record.poNumber,
        record.styleName,
        record.yarnType,
        record.color,
        record.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, records, searchQuery])

  const onSubmit = (values: SwatchCardFormValues) => {
    const nextRecord: SwatchCardRecord = {
      id: createSwatchCardId(),
      ...values,
      createdAt: new Date().toISOString(),
    }
    const nextRecords = [nextRecord, ...records]
    setRecords(nextRecords)
    saveSwatchCards(nextRecords)
    setIsCreateModalOpen(false)
    reset()
    toast.success("Swatch generated.")
  }

  const handlePrint = (record: SwatchCardRecord) => {
    if (typeof window === "undefined") {
      return
    }

    const printWindow = window.open("", "_blank", "width=800,height=600")
    if (!printWindow) {
      toast.error("Unable to open print preview.")
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Swatch Card - ${record.poNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 16px; }
            .row { margin-bottom: 12px; }
            .label { font-size: 12px; color: #666; text-transform: uppercase; }
            .value { font-size: 16px; }
          </style>
        </head>
        <body>
          <h1>Swatch Card</h1>
          <div class="row"><div class="label">PO Number</div><div class="value">${record.poNumber}</div></div>
          <div class="row"><div class="label">Style Name</div><div class="value">${record.styleName}</div></div>
          <div class="row"><div class="label">Yarn Type</div><div class="value">${record.yarnType}</div></div>
          <div class="row"><div class="label">Color</div><div class="value">${record.color}</div></div>
          <div class="row"><div class="label">Status</div><div class="value">${record.status}</div></div>
          <div class="row"><div class="label">Notes</div><div class="value">${record.notes || "—"}</div></div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Swatch Card"
        actions={
          <Button
            type="button"
            className="rounded-2xl"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Generate New Swatch
          </Button>
        }
      />

      <SearchFilterBar
        filters={["All Swatches", "Generated", "Prepared", "Sent", "Approved"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search PO, style, yarn type, color"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredRecords.length === 0 ? (
        <EmptyState
          title="No swatches found"
          description="Generate a new swatch card to start the swatch list."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "poNumber", header: "PO Number", className: "min-w-[5.5rem]" },
            { key: "styleName", header: "Style Name", className: "min-w-[6rem]" },
            { key: "yarnType", header: "Yarn Type", className: "min-w-[6rem]" },
            { key: "color", header: "Color", className: "min-w-[5rem]" },
            {
              key: "status",
              header: "Status",
              className: "min-w-[5.25rem]",
              render: (row) => <StatusBadge value={String(row.status)} />,
            },
            { key: "notes", header: "Notes", className: "min-w-[6rem]" },
            {
              key: "action",
              header: "Action",
              className: "min-w-[5.5rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setViewingRecord(row as SwatchCardRecord)}
                  >
                    <Eye className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handlePrint(row as SwatchCardRecord)}
                  >
                    <Printer className="size-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredRecords}
        />
      )}

      <RecordFormModal
        open={isCreateModalOpen}
        title="Generate New Swatch"
        description="Create a new swatch card using the shared project form pattern."
        fields={swatchCardFields}
        register={register}
        onClose={() => {
          setIsCreateModalOpen(false)
          reset()
        }}
        onReset={() => reset()}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Generate Swatch"
        maxWidthClassName="max-w-3xl"
      />

      {viewingRecord ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Swatch Card</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {viewingRecord.poNumber} · {viewingRecord.styleName}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={() => setViewingRecord(null)}
              >
                Close
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ["PO Number", viewingRecord.poNumber],
                ["Style Name", viewingRecord.styleName],
                ["Yarn Type", viewingRecord.yarnType],
                ["Color", viewingRecord.color],
                ["Status", viewingRecord.status],
                ["Created", new Date(viewingRecord.createdAt).toLocaleString()],
                ["Notes", viewingRecord.notes || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={label === "Notes" ? "space-y-1 md:col-span-2" : "space-y-1"}
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() => handlePrint(viewingRecord)}
              >
                <Printer className="mr-1.5 size-4" />
                Print Swatch
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
