import { FileCheck, Palette, Ruler, Sparkles } from "lucide-react"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAppSelector } from "@/store/hooks"

export function DesignPage() {
  const purchaseOrders = useAppSelector(
    (state) => state.merchandise.purchaseOrders
  )

  const uniqueDesigns = new Set(
    purchaseOrders
      .map((order) => order.design.trim())
      .filter((design) => design.length > 0)
  ).size

  const specReadyCount = purchaseOrders.filter(
    (order) => order.gg && order.color && order.yarnComposition
  ).length

  const pendingDesignFollowUp = purchaseOrders.filter(
    (order) => !order.design || !order.gg || !order.color || !order.yarnComposition
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Design workspace"
      />

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          label="PO Styles"
          value={String(purchaseOrders.length).padStart(2, "0")}
          tone="default"
        />
        <MetricCard
          label="Design Variants"
          value={String(uniqueDesigns).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Specs Ready"
          value={String(specReadyCount).padStart(2, "0")}
          tone="success"
        />
        <MetricCard
          label="Needs Follow-up"
          value={String(pendingDesignFollowUp).padStart(2, "0")}
          tone="warning"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Palette className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Design and spec queue</h2>
              <p className="text-sm text-muted-foreground">
                PO-level design visibility pulled directly from the merchandise data set.
              </p>
            </div>
          </div>
          <div className="mt-5">
            {purchaseOrders.length === 0 ? (
              <EmptyState
                title="No design records yet"
                description="Once merchandising starts creating POs, the design queue will appear here automatically."
              />
            ) : (
              <DataTable
                columns={[
                  { key: "poNumber", header: "PO Number" },
                  { key: "buyer", header: "Buyer" },
                  { key: "style", header: "Style" },
                  { key: "design", header: "Design" },
                  {
                    key: "gg",
                    header: "GG",
                    render: (row) => String(row.gg ?? "-"),
                  },
                  {
                    key: "color",
                    header: "Color",
                    render: (row) => String(row.color ?? "-"),
                  },
                  {
                    key: "yarnComposition",
                    header: "Yarn",
                    render: (row) => String(row.yarnComposition ?? "-"),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (row) => <StatusBadge value={String(row.status)} />,
                  },
                ]}
                data={purchaseOrders}
              />
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Design handoff checklist</h2>
          <div className="mt-5 space-y-3">
            {[
              {
                icon: FileCheck,
                title: "Buyer style review",
                note: "Confirm the PO style and design name match the commercial requirement.",
              },
              {
                icon: Ruler,
                title: "Spec completeness",
                note: "Make sure GG, yarn composition, and color are visible before yarn follow-up starts.",
              },
              {
                icon: Sparkles,
                title: "Merchandising alignment",
                note: "Use this workspace as a clean read-only handoff view for the active PO set.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <item.icon className="size-4" />
                  </div>
                  <p className="font-medium">{item.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

