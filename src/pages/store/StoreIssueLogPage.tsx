import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { useAppSelector } from "@/store/hooks"

export function StoreIssueLogPage() {
  const issueLogs = useAppSelector((state) => state.storeService.issueLogs)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Issue Log"
      />

      {issueLogs.length > 0 ? (
        <DataTable
          columns={[
            { key: "poNumber", header: "PO" },
            { key: "sourceModule", header: "Module" },
            { key: "itemName", header: "Item" },
            {
              key: "issuedQty",
              header: "Issued Qty",
              render: (row) => String(row.issuedQty),
            },
            { key: "issueDate", header: "Issue Date" },
            { key: "issuedBy", header: "Issued By" },
            {
              key: "remarks",
              header: "Remarks",
              render: (row) => String(row.remarks ?? "-"),
            },
          ]}
          data={issueLogs}
        />
      ) : (
        <EmptyState
          title="No store issues logged yet"
          description="Once Linking or Finishing receives material from Store Control, the issue log will appear here."
        />
      )}
    </div>
  )
}

