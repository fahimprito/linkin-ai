import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="rounded-[2rem] border border-border/70 bg-card p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you requested does not exist in this frontend workspace yet.
        </p>
        <Button asChild className="mt-6 rounded-2xl">
          <Link to="/dashboard">Return home</Link>
        </Button>
      </div>
    </div>
  )
}
