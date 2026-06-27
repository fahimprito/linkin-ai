import { ArrowRight, ClipboardList, Layers3, PackageSearch } from "lucide-react"

import { DataTable } from "@/components/shared/data-table"
import { LoadingState } from "@/components/shared/loading-state"
import { MetricCard } from "@/components/shared/metric-card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useGetExecutiveDashboardQuery } from "@/services/linkin-api"
import { useAppSelector } from "@/store/hooks"
import {
  selectExecutiveDashboardMetrics,
  selectMetricsForRole,
} from "@/store/selectors/dashboard-metrics"
import type { UserRole } from "@/types/auth"

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
  merchandising_user: {
    title: "Merchandising operations dashboard",
    description:
      "Manage the active PO intake flow, keep the master Excel current, and hand clean requirements into the next workspace.",
    quickActions: [
      { label: "Create PO", note: "Capture buyer PO data and keep the editable master sheet aligned." },
      { label: "Send Yarn Check", note: "Route complete PO requirements to the Yarn team for availability review." },
      { label: "Track Stage 1", note: "Follow each order from intake to yarn decision without leaving the module." },
    ],
  },
  design_user: {
    title: "Design workspace dashboard",
    description:
      "Review PO styles, design names, and spec readiness so the design team works from the same live order base as merchandising.",
    quickActions: [
      { label: "Review Styles", note: "Check buyer styles and design names against the current PO list." },
      { label: "Confirm Specs", note: "Verify GG, color, and yarn details before downstream follow-up begins." },
      { label: "Watch Handoffs", note: "Use the shared queue to spot POs that still need design clarification." },
    ],
  },
  yarn_user: {
    title: "Yarn operations dashboard",
    description:
      "Run the yarn decision flow: check requests, place supplier orders, receive batches, inspect them, and handle issue activity.",
    quickActions: [
      { label: "Check Requests", note: "Decide whether yarn is available or supplier ordering is required." },
      { label: "Supplier Orders", note: "Create and track supplier orders for missing yarn requirements." },
      { label: "Batch Inspection", note: "Keep a permanent acceptance and rejection trail for compliance." },
    ],
  },
  store_user: {
    title: "Store service dashboard",
    description:
      "Operate Store as a shared service module with a reusable requisition, issuance, and log pattern ready for future stages.",
    quickActions: [
      { label: "Review Requisitions", note: "Receive and verify incoming material requests from shared-service flows." },
      { label: "Issue Materials", note: "Release approved quantities against active requisitions." },
      { label: "Maintain Log", note: "Keep a read-only issue history for traceability and management review." },
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

  if (isLoading || !data || !user) {
    return <LoadingState />
  }

  const isExecutiveView =
    user.role === "super_admin" || user.role === "management_user"

  if (!isExecutiveView) {
    const dashboard = roleDashboardContent[user.role as DepartmentDashboardRole]

    return (
      <div className="space-y-6">
        <PageHeader title={dashboard.title} />
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
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
                  The active user groups still work from one shared PO data set.
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
      />
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 2xl:grid-cols-8">
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
          <h2 className="text-lg font-semibold">Rollout focus</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(34,197,94,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Stage 1 operations</p>
              <p className="mt-2 text-3xl font-semibold">Live</p>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(59,130,246,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Design workspace</p>
              <p className="mt-2 text-3xl font-semibold">Visible</p>
            </div>
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_rgba(245,158,11,0.14),_rgba(15,23,42,0))] p-5">
              <p className="text-sm text-muted-foreground">Downstream production</p>
              <p className="mt-2 text-3xl font-semibold">Hidden</p>
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
                One searchable PO stream for merchandising, design, yarn, store, and management.
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

