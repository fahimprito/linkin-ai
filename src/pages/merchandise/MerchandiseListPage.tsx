import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useGetMerchandiseOrdersQuery } from "@/services/linkin-api"

export function MerchandiseListPage() {
  const { data, isLoading } = useGetMerchandiseOrdersQuery(undefined)

  if (isLoading || !data) {
    return <LoadingState />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase order workflow"
        description="Manage PO details, buyer communication, design references, yarn requests, supplier order tracking, and production progress."
        actions={
          <Button type="button" className="rounded-2xl">
            Create PO Request
          </Button>
        }
      />
      <SearchFilterBar
        filters={[
          "PO List",
          "Buyer Information",
          "Design Information",
          "Yarn Consumption Request",
          "Supplier Order Tracking",
          "Production Tracking",
        ]}
      />
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "design", header: "Design" },
          { key: "supplier", header: "Supplier" },
          {
            key: "status",
            header: "Production Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
          {
            key: "action",
            header: "Detail",
            render: (row) => (
              <Button asChild variant="outline" size="sm">
                <Link to={`/merchandise/${String(row.id)}`}>View PO</Link>
              </Button>
            ),
          },
        ]}
        data={data}
      />
    </div>
  )
}
