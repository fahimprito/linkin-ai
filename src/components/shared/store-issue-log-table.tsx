import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { useAppSelector } from "@/store/hooks"
import type { StoreIssueLog } from "@/types/production"

type StoreIssueLogTableProps = {
  description: string
  emptyDescription: string
  sourceModule: StoreIssueLog["sourceModule"]
  title: string
}

export function StoreIssueLogTable({
  description,
  emptyDescription,
  sourceModule,
  title,
}: StoreIssueLogTableProps) {
  const issueLogs = useAppSelector((state) =>
    state.storeService.issueLogs.filter((log) => log.sourceModule === sourceModule)
  )

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />

      {issueLogs.length > 0 ? (
        <DataTable
          columns={[
            { key: "poNumber", header: "PO" },
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
          title={`No ${sourceModule.toLowerCase()} store issues logged yet`}
          description={emptyDescription}
        />
      )}
    </div>
  )
}
