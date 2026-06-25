import { ArrowRight, ClipboardList, FileText, Layers3, PackageSearch } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"
import { useGetExecutiveDashboardQuery } from "@/services/linkin-api"
import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/store/hooks"
import type { UserRole } from "@/types/auth"
import {
  selectExecutiveDashboardMetrics,
  selectMetricsForRole,
} from "@/store/selectors/dashboard-metrics"

type DepartmentDashboardRole = Exclude<UserRole, "super_admin" | "management_user">

type DepartmentDashboardContent = {
  title: string
  description: string
  quickActions: Array<{
    label: string
    note: string
  }>
}

const roleDashboardContent = {
  merchandise_user: {
    title: "Merchandise operations dashboard",
    description:
      "Manage Stage 1 from buyer PO intake through yarn-check handoff without leaving the merchandising workspace.",
    quickActions: [
      { label: "Create PO", note: "Capture the buyer PO and required yarn details." },
      { label: "Send Yarn Check", note: "Route the PO to Yarn Control for availability review." },
      { label: "Track Stage 1", note: "Monitor check requests, ETA updates, and delivery progress." },
    ],
  },
  yarn_control_user: {
    title: "Yarn control dashboard",
    description:
      "Run the Stage 1 yarn decision flow: review requests, place supplier orders, receive batches, and inspect for release.",
    quickActions: [
      { label: "Check Requests", note: "Decide whether stock is available or supplier ordering is needed." },
      { label: "Supplier Orders", note: "Create supplier orders and log ETA back to merchandise." },
      { label: "Batch Inspection", note: "Accept or reject delivery batches with permanent audit logging." },
    ],
  },
  store_control_user: {
    title: "Store control dashboard",
    description:
      "Track accessories receiving, inspection, stock balance, and issue materials to the floor through one store control flow.",
    quickActions: [
      { label: "Accessories PO", note: "Accept purchase orders for accessories." },
      { label: "Receive & Stock", note: "Update current supplier receipt and stock." },
      { label: "Floor Delivery", note: "Issue store items against department requisitions." },
    ],
  },
  knitting_user: {
    title: "Knitting production dashboard",
    description:
      "Coordinate knitting PO intake, requisitions, production planning, line updates, and management reporting.",
    quickActions: [
      { label: "Accept PO", note: "Register production orders for knitting." },
      { label: "Requisition", note: "Request yarn and store materials." },
      { label: "Daily Update", note: "Track current output and line remarks." },
    ],
  },
  linking_user: {
    title: "Linking production dashboard",
    description:
      "Plan linking orders, monitor current production, and maintain status updates for downstream finishing readiness.",
    quickActions: [
      { label: "Accept PO", note: "Register linking orders into the workflow." },
      { label: "Planning", note: "Plan current production assignments." },
      { label: "Daily Update", note: "Track linking, trimming, and mending status." },
    ],
  },
  finishing_user: {
    title: "Finishing dashboard",
    description:
      "Run wash, ironing, packing, requisition, and current finishing output updates from a single operational view.",
    quickActions: [
      { label: "Accept PO", note: "Receive finishing work orders for wash and packing." },
      { label: "Planning", note: "Plan ironing and packing throughput." },
      { label: "Daily Update", note: "Track wash, sewing, attachment, and packing." },
    ],
  },
} satisfies Record<DepartmentDashboardRole, DepartmentDashboardContent>

export function ExecutiveDashboardPage() {
  const { data, isLoading } = useGetExecutiveDashboardQuery(undefined)
  const { user } = useAuth()
  const userRole = user?.role ?? "super_admin"
  const executiveMetrics = useAppSelector(selectExecutiveDashboardMetrics)
  const roleMetrics = useAppSelector((state) =>
    selectMetricsForRole(state, userRole)
  )

  if (isLoading || !data) {
    return <LoadingState />
  }

  if (!user) {
    return <LoadingState />
  }

  const isExecutiveView =
    user.role === "super_admin" || user.role === "management_user"

  if (!isExecutiveView) {
    const dashboard = roleDashboardContent[user.role as DepartmentDashboardRole]

    return (
      <div className="space-y-6">
        <PageHeader
          title={dashboard.title}
          description={dashboard.description}
        />
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleMetrics.map((metric) => (
            <MetricCard key={metric.id} {...metric} />
          ))}
        </section>
        <section>
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Primary workflow actions</h2>
            <div className="mt-5 grid gap-3">
              {dashboard.quickActions.map((action) => (
                <div
                  key={action.label}
                  className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{action.label}</p>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {action.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Recent department activity</h2>
                <p className="text-sm text-muted-foreground">
                  A focused stream of the latest workflow updates.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {data.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="rounded-[1.5rem] border border-border/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{activity.title}</p>
                    <StatusBadge value={activity.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Layers3 className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">PO tracking snapshot</h2>
                <p className="text-sm text-muted-foreground">
                  Department teams can still search and follow active production orders.
                </p>
              </div>
            </div>
            <div className="mt-5">
              <DataTable
                columns={[
                  { key: "poNumber", header: "PO Number" },
                  { key: "buyer", header: "Buyer" },
                  {
                    key: "status",
                    header: "Status",
                    render: (row) => <StatusBadge value={String(row.status)} />,
                  },
                  { key: "deliveryDate", header: "Delivery Date" },
                ]}
                data={data.orders}
              />
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive operations dashboard"
        description="Linkin AI connects merchandise, yarn control, store control, knitting, linking, finishing, and management into one standardized workflow with shared forms, progress tracking, and auto-generated visibility."
      />
      <SearchFilterBar
        filters={[
          "Search by PO Number",
          "Search by Buyer",
          "Search by Date",
          "Search by Production Status",
        ]}
      />
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Unified system flow</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-semibold">Merchandise</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Fetch buyer POs, automate formatting, coordinate yarn and accessory needs, and follow production updates.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-semibold">Yarn & Store</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Receive supplier quantities, inspect inputs, update stock, and deliver materials against requisitions.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-semibold">Production</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Plan knitting, linking, and finishing operations while tracking today, total, balance, and remarks by process.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-semibold">Management Reporting</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Aggregate module data into current, ongoing, and future production, yarn, store, and shipping insights.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <FileText className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Key reporting fields</h2>
              <p className="text-sm text-muted-foreground">
                Shared data structures powering daily dashboards and reports.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <div className="rounded-[1.5rem] border border-border/70 p-4">
              Daily production: serial, GG, buyer, style, order qty, inspection, knitting, linking, trimming, mending, wash, attachment, sewing, packing, remarks.
            </div>
            <div className="rounded-[1.5rem] border border-border/70 p-4">
              Yarn info: buyer, style, color, lot, composition, received date, quantity, bag, supplier, remarks.
            </div>
            <div className="rounded-[1.5rem] border border-border/70 p-4">
              Stock calculation: date, color qty, delivery yarn, delivery bag, balance yarn, balance bag, controller signature.
            </div>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {executiveMetrics.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </section>
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent activities</h2>
          <div className="mt-5 space-y-4">
            {data.activities.map((activity) => (
              <div
                key={activity.id}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{activity.title}</p>
                  <StatusBadge value={activity.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {activity.description}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {activity.timestamp}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Production overview</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(34,197,94,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Knitting output</p>
              <p className="mt-2 text-3xl font-semibold">74%</p>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(245,158,11,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Linking throughput</p>
              <p className="mt-2 text-3xl font-semibold">61%</p>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(59,130,246,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Finishing readiness</p>
              <p className="mt-2 text-3xl font-semibold">82%</p>
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <PackageSearch className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">PO detail tracking</h2>
              <p className="text-sm text-muted-foreground">
                Searchable purchase order visibility with buyer, style, status, and delivery milestones.
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" className="rounded-2xl">
            Open PO Tracker
          </Button>
        </div>
      </section>
      <DataTable
        columns={[
          { key: "poNumber", header: "PO Number" },
          { key: "buyer", header: "Buyer" },
          { key: "style", header: "Style" },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge value={String(row.status)} />,
          },
          { key: "deliveryDate", header: "Delivery Date" },
        ]}
        data={data.orders}
      />
    </div>
  )
}
