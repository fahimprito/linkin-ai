import { CheckCircle, Package, XCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { updatePoStatus } from "@/store/slices/merchandise-slice"
import { updateCheckRequestStatus } from "@/store/slices/yarn-check-slice"
import type { YarnCheckRequest } from "@/types/modules"

export function YarnCheckRequestsPage() {
  const dispatch = useAppDispatch()
  const checkRequests = useAppSelector((state) => state.yarnCheck.checkRequests)

  const pendingCount = checkRequests.filter((r) => r.status === "Pending").length
  const processedCount = checkRequests.filter(
    (r) => r.status !== "Pending"
  ).length

  const handleMarkAvailable = (request: YarnCheckRequest) => {
    dispatch(
      updateCheckRequestStatus({ id: request.id, status: "Available" })
    )
    dispatch(
      updatePoStatus({ id: request.poId, status: "Ready for Production" })
    )
    toast.success(
      `PO ${request.poNumber} marked as yarn available. Routed to production.`
    )
  }

  const handleMarkNotAvailable = (request: YarnCheckRequest) => {
    dispatch(
      updateCheckRequestStatus({ id: request.id, status: "Not Available" })
    )
    dispatch(updatePoStatus({ id: request.poId, status: "Yarn Ordered" }))
    toast.info(
      `PO ${request.poNumber} marked as not available. Place a supplier order.`
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yarn Check Requests"
        description="Review incoming yarn availability requests from Merchandisers. Check stock and decide: mark available or order from supplier."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Pending Checks"
          value={String(pendingCount).padStart(2, "0")}
          delta="Awaiting decision"
          tone="warning"
        />
        <MetricCard
          label="Processed"
          value={String(processedCount).padStart(2, "0")}
          delta="Decided"
          tone="success"
        />
        <MetricCard
          label="Total Requests"
          value={String(checkRequests.length).padStart(2, "0")}
          delta="All time"
          tone="default"
        />
      </section>

      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "style", header: "Style" },
          { key: "yarnComposition", header: "Yarn Composition" },
          { key: "color", header: "Color" },
          {
            key: "requiredQty",
            header: "Required Qty (kg)",
            render: (row) => String(row.requiredQty),
          },
          {
            key: "requestedAt",
            header: "Requested",
            render: (row) =>
              new Date(String(row.requestedAt)).toLocaleDateString(),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
          {
            key: "actions",
            header: "Decision",
            render: (row) => {
              const req = row as YarnCheckRequest
              if (req.status !== "Pending") {
                return (
                  <span className="text-xs text-muted-foreground">
                    Processed
                  </span>
                )
              }
              return (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-xl text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    onClick={() => handleMarkAvailable(req)}
                  >
                    <CheckCircle className="size-3.5" />
                    Available
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-xl text-amber-600 hover:text-amber-700 dark:text-amber-400"
                    onClick={() => handleMarkNotAvailable(req)}
                  >
                    <XCircle className="size-3.5" />
                    Not Available
                  </Button>
                </div>
              )
            },
          },
        ]}
        data={checkRequests}
      />
    </div>
  )
}
