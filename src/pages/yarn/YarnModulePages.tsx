import { Download, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import {
  getStoredYarnInventoryHistory,
  getStoredYarnInventoryRecords,
  saveStoredYarnInventoryHistory,
  saveStoredYarnInventoryRecords,
  type YarnInventoryHistoryRecord,
  type YarnInventoryRecord,
} from "@/lib/yarn-inventory"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString()
}

function downloadCsv(fileName: string, rows: Array<Record<string, string | number>>) {
  if (typeof window === "undefined") {
    return
  }

  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function YarnInventoryPage() {
  const [records, setRecords] = useState<YarnInventoryRecord[]>(() =>
    getStoredYarnInventoryRecords()
  )
  const [history, setHistory] = useState<YarnInventoryHistoryRecord[]>(() =>
    getStoredYarnInventoryHistory()
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Stock")
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [historyRecordId, setHistoryRecordId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState({
    yarnName: "",
    quality: "",
    lotNo: "",
    supplier: "",
    availableQty: "",
    reservedQty: "",
  })

  const filteredRecords = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return records.filter((record) => {
      const matchesFilter =
        activeFilter === "All Stock" ||
        (activeFilter === "Low Stock" && record.currentStock < 300) ||
        (activeFilter === "Manual" && record.source === "manual") ||
        (activeFilter === "Received" && record.source === "received")

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [
        record.yarnName,
        record.quality,
        record.lotNo,
        record.supplier,
        record.poNumber,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, records, searchQuery])

  const selectedHistory = history.filter(
    (entry) => entry.inventoryId === historyRecordId
  )

  const resetForm = () => {
    setEditingRecordId(null)
    setIsFormOpen(false)
    setFormValues({
      yarnName: "",
      quality: "",
      lotNo: "",
      supplier: "",
      availableQty: "",
      reservedQty: "",
    })
  }

  const handleSubmit = () => {
    const availableQty = Number(formValues.availableQty) || 0
    const reservedQty = Number(formValues.reservedQty) || 0

    if (
      !formValues.yarnName.trim() ||
      !formValues.quality.trim() ||
      !formValues.lotNo.trim() ||
      !formValues.supplier.trim()
    ) {
      toast.error("Please complete all stock fields.")
      return
    }

    if (editingRecordId) {
      const previousRecord = records.find((record) => record.id === editingRecordId)
      if (!previousRecord) {
        toast.error("Stock record not found.")
        return
      }

      const nextRecords = records.map((record) =>
        record.id === editingRecordId
          ? {
              ...record,
              yarnName: formValues.yarnName.trim(),
              quality: formValues.quality.trim(),
              lotNo: formValues.lotNo.trim(),
              supplier: formValues.supplier.trim(),
              availableQty,
              reservedQty,
              currentStock: Math.max(0, availableQty - reservedQty - record.issuedQty),
              lastUpdated: new Date().toISOString(),
            }
          : record
      )
      const nextHistory = [
        {
          id: `inventory-history-${Date.now()}`,
          inventoryId: editingRecordId,
          action: "Stock Updated",
          quantity: availableQty - previousRecord.availableQty,
          actionDate: new Date().toISOString(),
          notes: `Reserved set to ${reservedQty}`,
        },
        ...history,
      ]
      setRecords(nextRecords)
      setHistory(nextHistory)
      saveStoredYarnInventoryRecords(nextRecords)
      saveStoredYarnInventoryHistory(nextHistory)
      toast.success("Stock updated.")
      resetForm()
      return
    }

    const newRecord: YarnInventoryRecord = {
      id: `inventory-${Date.now()}`,
      yarnName: formValues.yarnName.trim(),
      quality: formValues.quality.trim(),
      lotNo: formValues.lotNo.trim(),
      supplier: formValues.supplier.trim(),
      availableQty,
      reservedQty,
      issuedQty: 0,
      currentStock: Math.max(0, availableQty - reservedQty),
      lastUpdated: new Date().toISOString(),
      source: "manual",
    }
    const nextRecords = [newRecord, ...records]
    const nextHistory = [
      {
        id: `inventory-history-${Date.now()}`,
        inventoryId: newRecord.id,
        action: "Stock Added",
        quantity: availableQty,
        actionDate: new Date().toISOString(),
        notes: `Reserved set to ${reservedQty}`,
      },
      ...history,
    ]
    setRecords(nextRecords)
    setHistory(nextHistory)
    saveStoredYarnInventoryRecords(nextRecords)
    saveStoredYarnInventoryHistory(nextHistory)
    toast.success("Stock added.")
    resetForm()
  }

  const handleEdit = (record: YarnInventoryRecord) => {
    setEditingRecordId(record.id)
    setIsFormOpen(true)
    setFormValues({
      yarnName: record.yarnName,
      quality: record.quality,
      lotNo: record.lotNo,
      supplier: record.supplier,
      availableQty: String(record.availableQty),
      reservedQty: String(record.reservedQty),
    })
  }

  const exportRows = filteredRecords.map((record) => ({
    "Yarn Name": record.yarnName,
    Quality: record.quality,
    "Lot No.": record.lotNo,
    Supplier: record.supplier,
    "Available Qty": record.availableQty,
    "Reserved Qty": record.reservedQty,
    "Issued Qty": record.issuedQty,
    "Current Stock": record.currentStock,
    "Last Updated": formatDate(record.lastUpdated),
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => downloadCsv("yarn-inventory.csv", exportRows)}
            >
              <Download className="mr-1.5 size-4" />
              Export
            </Button>
            <Button
              type="button"
              className="rounded-2xl"
              onClick={() => {
                setEditingRecordId(null)
                setIsFormOpen(true)
                setFormValues({
                  yarnName: "",
                  quality: "",
                  lotNo: "",
                  supplier: "",
                  availableQty: "",
                  reservedQty: "",
                })
              }}
            >
              <Plus className="mr-1.5 size-4" />
              Add Stock
            </Button>
          </>
        }
      />

        <section className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
          <MetricCard
            label="Stock Rows"
            value={String(records.length).padStart(2, "0")}
            tone="default"
          />
          <MetricCard
            label="Low Stock"
            value={String(records.filter((record) => record.currentStock < 300).length).padStart(2, "0")}
            tone="warning"
          />
          <MetricCard
            label="Manual Entries"
            value={String(records.filter((record) => record.source === "manual").length).padStart(2, "0")}
            tone="default"
          />
          <MetricCard
            label="Received Entries"
            value={String(records.filter((record) => record.source === "received").length).padStart(2, "0")}
            tone="success"
          />
        </section>

      <SearchFilterBar
        filters={["All Stock", "Low Stock", "Manual", "Received"]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder="Search yarn, quality, lot no, supplier"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />

      {filteredRecords.length === 0 ? (
        <EmptyState
          title="No stock records yet"
          description="Received yarn or manual stock entries will appear here."
        />
      ) : (
        <DataTable
          compact
          columns={[
            { key: "yarnName", header: "Yarn Name", className: "min-w-[6rem]" },
            { key: "quality", header: "Quality", className: "min-w-[5rem]" },
            { key: "lotNo", header: "Lot No.", className: "min-w-[5rem]" },
            { key: "supplier", header: "Supplier", className: "min-w-[5.5rem]" },
            {
              key: "availableQty",
              header: "Available Qty",
              className: "min-w-[5rem]",
              render: (row) => String(row.availableQty),
            },
            {
              key: "reservedQty",
              header: "Reserved Qty",
              className: "min-w-[5rem]",
              render: (row) => String(row.reservedQty),
            },
            {
              key: "issuedQty",
              header: "Issued Qty",
              className: "min-w-[5rem]",
              render: (row) => String(row.issuedQty),
            },
            {
              key: "currentStock",
              header: "Current Stock",
              className: "min-w-[5rem]",
              render: (row) => String(row.currentStock),
            },
            {
              key: "lastUpdated",
              header: "Last Updated",
              className: "min-w-[5.75rem]",
              render: (row) => formatDate(String(row.lastUpdated)),
            },
            {
              key: "action",
              header: "Action",
              className: "min-w-[7rem]",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => handleEdit(row as YarnInventoryRecord)}
                  >
                    Update
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => setHistoryRecordId(String(row.id))}
                  >
                    History
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredRecords}
        />
      )}

      {historyRecordId ? (
        <section className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Stock History</h2>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => setHistoryRecordId(null)}
            >
              Close
            </Button>
          </div>
          {selectedHistory.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No history for this stock record yet.
            </p>
          ) : (
            <div className="mt-4">
              <DataTable
                compact
                columns={[
                  { key: "action", header: "Action", className: "min-w-[5rem]" },
                  {
                    key: "quantity",
                    header: "Quantity",
                    className: "min-w-[5rem]",
                    render: (row) => String(row.quantity),
                  },
                  {
                    key: "actionDate",
                    header: "Date",
                    className: "min-w-[5.75rem]",
                    render: (row) => formatDate(String(row.actionDate)),
                  },
                  { key: "notes", header: "Notes", className: "min-w-[6rem]" },
                ]}
                data={selectedHistory}
              />
            </div>
          )}
        </section>
      ) : null}

      {isFormOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">
                  {editingRecordId ? "Update Stock" : "Add Stock"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Manage yarn inventory with the same top action and modal flow.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl"
                onClick={resetForm}
              >
                Close
              </Button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                handleSubmit()
              }}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              {[
                {
                  name: "yarnName",
                  label: "Yarn Name",
                  placeholder: "Cotton 30s",
                  type: "text",
                },
                {
                  name: "quality",
                  label: "Quality",
                  placeholder: "A Grade",
                  type: "text",
                },
                {
                  name: "lotNo",
                  label: "Lot No.",
                  placeholder: "LOT-001",
                  type: "text",
                },
                {
                  name: "supplier",
                  label: "Supplier",
                  placeholder: "Delta Yarn",
                  type: "text",
                },
                {
                  name: "availableQty",
                  label: "Available Qty",
                  placeholder: "820",
                  type: "number",
                },
                {
                  name: "reservedQty",
                  label: "Reserved Qty",
                  placeholder: "120",
                  type: "number",
                },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                  </label>
                  <input
                    id={field.name}
                    type={field.type}
                    value={formValues[field.name as keyof typeof formValues]}
                    onChange={(event) =>
                      setFormValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                  />
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 md:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => {
                    if (editingRecordId) {
                      const record = records.find((item) => item.id === editingRecordId)
                      if (record) {
                        setFormValues({
                          yarnName: record.yarnName,
                          quality: record.quality,
                          lotNo: record.lotNo,
                          supplier: record.supplier,
                          availableQty: String(record.availableQty),
                          reservedQty: String(record.reservedQty),
                        })
                        return
                      }
                    }

                    setFormValues({
                      yarnName: "",
                      quality: "",
                      lotNo: "",
                      supplier: "",
                      availableQty: "",
                      reservedQty: "",
                    })
                  }}
                >
                  Reset
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-2xl">
                  {editingRecordId ? "Update Stock" : "Add Stock"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
