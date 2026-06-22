import { ArrowUpRight, Sparkles, Users } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

const dashboardStats = [
  { label: "Active users", value: "12,480", trend: "+12%" },
  { label: "Tasks automated", value: "1,284", trend: "+18%" },
  { label: "Conversion rate", value: "8.24%", trend: "+4%" },
]

type InviteFormValues = {
  name: string
  email: string
}

export function DashboardPage() {
  const { register, handleSubmit, reset } = useForm<InviteFormValues>({
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const handleInviteSubmit = ({ name, email }: InviteFormValues) => {
    void api

    toast.success(`Invite draft created for ${name}`, {
      description: `A connection flow can be added later for ${email}.`,
    })
    reset()
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-muted-foreground">
                Admin starter workspace
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Build a clean control center for your AI operations.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Routing, Redux state, forms, toast notifications, and Axios are
                already wired so you can focus on business features next.
              </p>
            </div>
            <div className="rounded-3xl bg-primary px-4 py-3 text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dashboardStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="text-2xl font-semibold">{stat.value}</span>
                  <span className="text-sm font-medium text-emerald-600">
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-3">
              <Users className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Quick invite</h3>
              <p className="text-sm text-muted-foreground">
                Example form powered by React Hook Form.
              </p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit(handleInviteSubmit)}
            className="mt-6 space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                {...register("name", { required: true })}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                placeholder="Ariana Brooks"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Work email
              </label>
              <input
                id="email"
                type="email"
                {...register("email", { required: true })}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
                placeholder="team@linkin.ai"
              />
            </div>
            <Button type="submit" className="w-full rounded-2xl">
              Create invite
            </Button>
          </form>
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Next structure ideas</h3>
              <p className="text-sm text-muted-foreground">
                Good folders to add next as the dashboard grows.
              </p>
            </div>
            <ArrowUpRight className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="rounded-2xl bg-secondary/60 px-4 py-3 font-mono">
              src/features/auth
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-3 font-mono">
              src/features/users
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-3 font-mono">
              src/services
            </div>
            <div className="rounded-2xl bg-secondary/60 px-4 py-3 font-mono">
              src/components/shared
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold">API client ready</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Axios is configured in a single place so interceptors, auth headers,
            and environment-based URLs can be added without touching every
            request.
          </p>
          <div className="mt-5 rounded-[1.5rem] bg-secondary/60 p-4 font-mono text-xs leading-6 text-muted-foreground">
            Base URL: {api.defaults.baseURL || "/api"}
          </div>
        </div>
      </section>
    </div>
  )
}
