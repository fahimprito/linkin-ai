import { ShieldAlert } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export function UnauthorizedPage() {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-card p-8 shadow-sm">
      <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 w-fit">
        <ShieldAlert className="size-5" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">Access restricted</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        Your current role does not have permission to open this module. Contact a
        Super Admin if you need broader access.
      </p>
      <Button asChild className="mt-6 rounded-2xl">
        <Link to="/">Go to allowed workspace</Link>
      </Button>
    </div>
  )
}
