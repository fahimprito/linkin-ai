import { useMemo } from "react"
import { useMatches } from "react-router"

import type { BreadcrumbHandle } from "@/types/navigation"

export function useBreadcrumbs() {
  const matches = useMatches()

  return useMemo(() => {
    return matches
      .map((match) => {
        const handle = match.handle as { breadcrumb?: BreadcrumbHandle } | undefined

        if (!handle?.breadcrumb) {
          return null
        }

        const breadcrumb =
          typeof handle.breadcrumb === "object"
            ? handle.breadcrumb
            : { label: handle.breadcrumb }

        const label =
          typeof breadcrumb.label === "function"
            ? breadcrumb.label(match.params)
            : breadcrumb.label

        return {
          label,
          pathname: breadcrumb.to ?? match.pathname,
        }
      })
      .filter(
        (
          item
        ): item is {
          label: string
          pathname: string
        } => item !== null
      )
  }, [matches])
}
