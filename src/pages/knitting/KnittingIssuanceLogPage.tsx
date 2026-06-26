import { getAvailableYarnForPo, sumIssueLogQtyForPo } from "@/lib/knitting-metrics"
import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"

export function KnittingIssuanceLogPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )
  const requisitions = useAppSelector((state) => state.knitting.requisitions)
  const issueLogs = useAppSelector((state) => state.knitting.issueLogs)
  const stockMovements = useAppSelector((state) => state.yarnCheck.stockMovements)
  const queueOrders = purchaseOrders.filter(
    (po) => po.status === "Ready for Production" || po.status === "Knitting"
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knitting Yarn Issuance Log"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Requisitions"
          value={String(requisitions.length).padStart(2, "0")}
          tone="warning"
        />
        <MetricCard
          label="Issue Logs"
          value={String(issueLogs.length).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Queue POs"
          value={String(queueOrders.length).padStart(2, "0")}
          tone="default"
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">PO Issue Readiness</h2>
        {queueOrders.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              { key: "buyer", header: "Buyer" },
              {
                key: "requiredYarnQty",
                header: "Required Yarn (kg)",
                render: (row) => String(row.requiredYarnQty ?? 0),
              },
              {
                key: "issuedQty",
                header: "Issued (kg)",
                render: (row) =>
                  String(sumIssueLogQtyForPo(issueLogs, String(row.id))),
              },
              {
                key: "availableQty",
                header: "Available Balance (kg)",
                render: (row) =>
                  String(getAvailableYarnForPo(stockMovements, String(row.id))),
              },
              {
                key: "status",
                header: "PO Status",
                render: (row) => <StatusBadge value={String(row.status)} />,
              },
            ]}
            data={queueOrders}
          />
        ) : (
          <EmptyState
            title="No knitting queue records"
            description="POs will appear here after Yarn Control releases them to production."
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Issue History</h2>
        {issueLogs.length > 0 ? (
          <DataTable
            columns={[
              { key: "poNumber", header: "PO" },
              {
                key: "issuedQty",
                header: "Issued Qty (kg)",
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
            title="No issues recorded yet"
            description="Yarn issue entries will populate here after Yarn Control completes issuance."
          />
        )}
      </section>
    </div>
  )
}

