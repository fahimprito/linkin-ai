import { BriefcaseBusiness, Mail, MapPin, Phone, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { MetricCard } from "@/components/shared/metric-card"
import { useAuth } from "@/hooks/use-auth"
import { useAppSelector } from "@/store/hooks"
import {
  selectSubmissionCountForRole,
  selectTodaySubmissionCountForRole,
} from "@/store/selectors/dashboard-metrics"

export function UserProfilePage() {
  const { navigation, roleLabel, user } = useAuth()
  const userRole = user?.role ?? "super_admin"
  const totalEntries = useAppSelector((state) =>
    selectSubmissionCountForRole(state, userRole)
  )
  const todayEntries = useAppSelector((state) =>
    selectTodaySubmissionCountForRole(state, userRole)
  )

  if (!user) {
    return null
  }

  const profileMetrics = [
    {
      label: "Saved Entries",
      value: String(totalEntries).padStart(2, "0"),
      tone: "default" as const,
    },
    {
      label: "Accessible Modules",
      value: String(navigation.length).padStart(2, "0"),
      tone: "success" as const,
    },
    {
      label: "Updated Today",
      value: String(todayEntries).padStart(2, "0"),
      tone: "success" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profile"
        actions={
          <Button type="button" variant="outline" className="rounded-2xl">
            Edit Profile
          </Button>
        }
      />
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex size-24 items-center justify-center rounded-[2rem] bg-primary/10 text-2xl font-semibold text-primary">
              {user.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Profile Summary</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{user.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {roleLabel} | {user.department}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <span
                    key={item.to}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-medium">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Department
                  </p>
                  <p className="mt-1 text-sm font-medium">{user.department}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-1 text-sm font-medium">+880 1700 123456</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <div className="flex items-center gap-3">
                <MapPin className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-medium">Dhaka Operations Hub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Access Summary</h3>
              <p className="text-sm text-muted-foreground">
                Role and workspace visibility snapshot.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4">
            {profileMetrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={
                  metric.label === "Accessible Modules"
                    ? String(navigation.length)
                    : metric.value
                }
                tone={metric.tone}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Role Permissions</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The modules below are currently available for this account based on
            RBAC configuration.
          </p>
          <div className="mt-5 space-y-3">
            {navigation.map((item) => (
              <div
                key={item.to}
                className="flex items-center justify-between rounded-[1.5rem] border border-border/70 px-4 py-4"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.to}</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                  Enabled
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Account Activity</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sample profile activity and security history for the user workspace.
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Last sign in</p>
              <p className="mt-1 text-sm text-muted-foreground">
                June 23, 2026 at 9:18 AM from Dhaka, Bangladesh
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Recent permission audit</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Access verified against current role mapping with no conflicts found.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-secondary/60 p-4">
              <p className="text-sm font-medium">Password policy</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Password reset and recovery flow is active through the frontend auth flow.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
