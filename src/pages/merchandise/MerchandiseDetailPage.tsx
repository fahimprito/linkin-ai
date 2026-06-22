import { useParams } from "react-router"

import { EmptyState } from "@/components/shared/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useGetPurchaseOrderByIdQuery } from "@/services/linkin-api"

export function MerchandiseDetailPage() {
  const { poId = "" } = useParams()
  const { data, isLoading, isError } = useGetPurchaseOrderByIdQuery(poId)

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Purchase order not found"
        description="The requested PO detail could not be loaded from the mock service."
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${data.poNumber} • ${data.style}`}
        description="Review design layout, approval status, technical pack details, timeline milestones, and related documents."
      />
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Buyer</p>
          <p className="mt-2 text-xl font-semibold">{data.buyer}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{data.buyerInfo}</p>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Production status</p>
          <div className="mt-2">
            <StatusBadge value={data.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Delivery target: {data.deliveryDate}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-border/70 bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Supplier</p>
          <p className="mt-2 text-xl font-semibold">{data.supplier}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Quantity: {data.quantity.toLocaleString()} pcs
          </p>
        </div>
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Design & approvals</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Design layout</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {data.designLayout}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Approval information</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {data.approvalInfo}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4 md:col-span-2">
              <p className="text-sm font-medium">Technical pack</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {data.technicalPack}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Production timeline</h2>
          <div className="mt-5 space-y-3">
            {data.productionTimeline.map((item: string) => (
              <div key={item} className="rounded-[1.5rem] border border-border/70 p-4">
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Related documents
          </h3>
          <div className="mt-3 space-y-2">
            {data.relatedDocuments.map((item: string) => (
              <div key={item} className="rounded-full bg-secondary px-4 py-2 text-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
