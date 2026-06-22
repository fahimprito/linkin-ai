import { ShieldCheck } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useResetPasswordMutation } from "@/services/linkin-api"

type ResetPasswordValues = {
  token: string
  password: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const { register, handleSubmit, reset } = useForm<ResetPasswordValues>({
    defaultValues: {
      token: "mock-reset-token",
    },
  })
  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const onSubmit = async (values: ResetPasswordValues) => {
    try {
      const result = await resetPassword(values).unwrap()
      toast.success(result.message)
      reset({
        token: "mock-reset-token",
        password: "",
        confirmPassword: "",
      })
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data
          ? String(error.data.message)
          : "Unable to reset password."
      toast.error(message)
    }
  }

  return (
    <div className="rounded-[2rem] border border-border/70 bg-card p-7 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Password Reset</p>
          <h1 className="text-2xl font-semibold">Create a new password</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <input
          {...register("token", { required: true })}
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
        />
        <input
          type="password"
          {...register("password", { required: true })}
          placeholder="New password"
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
        />
        <input
          type="password"
          {...register("confirmPassword", { required: true })}
          placeholder="Confirm password"
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
        />
        <Button type="submit" className="w-full rounded-2xl" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm text-primary hover:underline">
        Back to login
      </Link>
    </div>
  )
}
