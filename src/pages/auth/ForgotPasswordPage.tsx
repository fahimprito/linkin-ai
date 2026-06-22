import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useForgotPasswordMutation } from "@/services/linkin-api"

type ForgotPasswordValues = {
  email: string
}

export function ForgotPasswordPage() {
  const { register, handleSubmit, reset } = useForm<ForgotPasswordValues>()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()

  const onSubmit = async (values: ForgotPasswordValues) => {
    const result = await forgotPassword(values).unwrap()
    toast.success(result.message)
    reset()
  }

  return (
    <div className="rounded-[2rem] border border-border/70 bg-card p-7 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <KeyRound className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Account Recovery</p>
          <h1 className="text-2xl font-semibold">Forgot password</h1>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Enter your work email and we&apos;ll simulate sending reset instructions.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <input
          {...register("email", { required: true })}
          placeholder="team@linkin.ai"
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-ring"
        />
        <Button type="submit" className="w-full rounded-2xl" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <Link to="/login" className="mt-5 inline-block text-sm text-primary hover:underline">
        Back to login
      </Link>
    </div>
  )
}
