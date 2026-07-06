import { Eye, EyeOff, LogIn } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { setSession } from "@/features/auth/auth-slice"
import { getDefaultRoute } from "@/lib/permissions"
import { mockUsers } from "@/mock/auth"
import { useLoginMutation } from "@/services/linkin-api"
import { useAppDispatch } from "@/store/hooks"
import type { LoginPayload } from "@/types/auth"

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const { register, handleSubmit, setValue } = useForm<LoginPayload>({
    defaultValues: {
      email: "admin@linkin.ai",
      password: "password123",
    },
  })

  const onSubmit = async (values: LoginPayload) => {
    try {
      const session = await login(values).unwrap()
      dispatch(setSession(session))
      toast.success(`Welcome back, ${session.user.name}`)
      navigate(getDefaultRoute(session.user.role, session.user.permissions))
    } catch (error) {
      const message =
        typeof error === "object" &&
          error !== null &&
          "data" in error &&
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data
          ? String(error.data.message)
          : "Unable to log in."
      toast.error(message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[2rem] border border-border/70 bg-card p-7 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <LogIn className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Authentication</p>
            <h1 className="text-2xl font-semibold">Sign in to KnitOps</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your work credentials to access the dashboard.
            </p>
          </div>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4"
          autoComplete="on"
        >
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Work email
            </label>
            <input
              id="email"
              {...register("email", { required: true })}
              type="email"
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                {...register("password", { required: true })}
                autoComplete="current-password"
                spellCheck={false}
                className="w-full rounded-2xl border border-input bg-background px-4 py-3 pr-12 text-sm outline-none transition focus:border-ring"
              />
              <button
                type="button"
                className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-muted-foreground transition hover:text-foreground"
                onClick={() => setIsPasswordVisible((current) => !current)}
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full rounded-2xl"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <span className="text-muted-foreground">{mockUsers.length} demo users available</span>
        </div>
        <div className="mt-6 rounded-[1.5rem] bg-secondary/60 p-4 text-xs leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">Demo accounts</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mockUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs transition hover:border-primary/40 hover:text-foreground"
                onClick={() => {
                  setValue("email", user.email, { shouldDirty: true })
                  setValue("password", user.password, { shouldDirty: true })
                }}
              >
                {user.email}
              </button>
            ))}
          </div>
          <p className="mt-3">
            Password: <span className="font-medium text-foreground">password123</span>
          </p>
        </div>
      </div>
    </div>
  )
}


