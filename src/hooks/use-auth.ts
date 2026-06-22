import { useMemo } from "react"

import { dashboardNavigation, roleLabels } from "@/lib/permissions"
import { useAppSelector } from "@/store/hooks"

export function useAuth() {
  const auth = useAppSelector((state) => state.auth)

  const navigation = useMemo(() => {
    if (!auth.user) {
      return []
    }

    return dashboardNavigation.filter((item) =>
      auth.user?.permissions.includes(item.module)
    )
  }, [auth.user])

  return {
    ...auth,
    navigation,
    roleLabel: auth.user ? roleLabels[auth.user.role] : null,
  }
}
