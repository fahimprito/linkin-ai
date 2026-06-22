import { ChevronRight } from "lucide-react"
import { Link } from "react-router"

import { useBreadcrumbs } from "@/hooks/use-breadcrumbs"

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs()

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1

        return (
          <div key={`${item.pathname}-${item.label}`} className="flex items-center gap-2">
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link to={item.pathname} className="transition hover:text-foreground">
                {item.label}
              </Link>
            )}
            {!isLast ? <ChevronRight className="size-4" /> : null}
          </div>
        )
      })}
    </div>
  )
}
