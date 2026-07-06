import { useMemo, useState } from "react"

import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { useAppSelector } from "@/store/hooks"

const monthOptions = ["All Buyers"]

type SummaryRow = {
  id: string
  buyer: string
  gauge: string
  bookedQty: number
  confirmedQty: number
  productionQty: number
  shipmentQty: number
  balanceQty: number
  status: string
}

type ManagementSummaryTableProps = {
  title: string
  description: string
  mode: "booking" | "confirmed" | "production"
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function buildStatus(balanceQty: number, productionQty: number) {
  if (balanceQty <= 0) {
    return "Completed"
  }

  if (productionQty > 0) {
    return "In Progress"
  }

  return "Planned"
}

export function ManagementSummaryTable({
  title,
  description,
  mode,
}: ManagementSummaryTableProps) {
  const purchaseOrders = useAppSelector((state) => state.merchandise.purchaseOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Buyers")

  const rows = useMemo<SummaryRow[]>(() => {
    const grouped = new Map<string, SummaryRow>()

    purchaseOrders.forEach((order, index) => {
      const buyer = order.buyer || "Unknown Buyer"
      const gauge = order.gauge || "N/A"
      const key = `${buyer}__${gauge}`
      const qty = Number(order.poQty ?? order.quantity ?? 0)
      const existing = grouped.get(key)
      const confirmedQty = Math.round(qty * 0.88)
      const productionQty = Math.round(qty * 0.64)
      const shipmentQty = Math.round(qty * 0.42)
      const bookedQty = qty
      const balanceQty = Math.max(bookedQty - productionQty, 0)

      if (existing) {
        existing.bookedQty += bookedQty
        existing.confirmedQty += confirmedQty
        existing.productionQty += productionQty
        existing.shipmentQty += shipmentQty
        existing.balanceQty = Math.max(existing.bookedQty - existing.productionQty, 0)
        existing.status = buildStatus(existing.balanceQty, existing.productionQty)
        return
      }

      grouped.set(key, {
        id: `${key}-${index}`,
        buyer,
        gauge,
        bookedQty,
        confirmedQty,
        productionQty,
        shipmentQty,
        balanceQty,
        status: buildStatus(balanceQty, productionQty),
      })
    })

    if (grouped.size === 0) {
      return [
        {
          id: `mock-${mode}-1`,
          buyer: "ELCORTE",
          gauge: "7 GG",
          bookedQty: 88700,
          confirmedQty: 75680,
          productionQty: 48700,
          shipmentQty: 32000,
          balanceQty: 40000,
          status: "In Progress",
        },
        {
          id: `mock-${mode}-2`,
          buyer: "ONLY",
          gauge: "9/12 GG",
          bookedQty: 740682,
          confirmedQty: 690000,
          productionQty: 410000,
          shipmentQty: 275000,
          balanceQty: 330682,
          status: "Planned",
        },
      ]
    }

    return [...grouped.values()].sort((a, b) => a.buyer.localeCompare(b.buyer))
  }, [mode, purchaseOrders])

  const filters = useMemo(
    () => [
      "All Buyers",
      ...Array.from(new Set(rows.map((row) => row.buyer))).sort((a, b) => a.localeCompare(b)),
    ],
    [rows]
  )

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesBuyer = activeFilter === "All Buyers" || row.buyer === activeFilter

      if (!matchesBuyer) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [row.buyer, row.gauge, row.status].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [activeFilter, rows, searchQuery])

  const columns = useMemo<DataTableColumn<SummaryRow>[]>(() => {
    const quantityColumn =
      mode === "booking"
        ? { key: "bookedQty", header: "Booked Qty" }
        : mode === "confirmed"
          ? { key: "confirmedQty", header: "Confirmed Qty" }
          : { key: "productionQty", header: "Production Qty" }

    return [
      { key: "buyer", header: "Buyer", className: "min-w-[10rem]" },
      { key: "gauge", header: "GG", className: "min-w-[6rem]" },
      {
        ...quantityColumn,
        className: "min-w-[8rem]",
        render: (row) =>
          formatNumber(
            mode === "booking"
              ? row.bookedQty
              : mode === "confirmed"
                ? row.confirmedQty
                : row.productionQty
          ),
      },
      {
        key: "shipmentQty",
        header: "Shipment Qty",
        className: "min-w-[8rem]",
        render: (row) => formatNumber(row.shipmentQty),
      },
      {
        key: "balanceQty",
        header: "Balance Qty",
        className: "min-w-[8rem]",
        render: (row) => formatNumber(row.balanceQty),
      },
      { key: "status", header: "Status", className: "min-w-[7rem]" },
    ]
  }, [mode])

  return (
    <div className="space-y-6">
      <PageHeader title={title} />
      <SearchFilterBar
        filters={filters.length ? filters : monthOptions}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchPlaceholder={description}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        compact
      />
      {filteredRows.length ? (
        <DataTable columns={columns} data={filteredRows} compact />
      ) : (
        <EmptyState title="No report rows found" description={description} />
      )}
    </div>
  )
}
