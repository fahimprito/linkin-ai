import { useMemo } from "react"

import { getNavigationForUser, roleLabels } from "@/lib/permissions"
import { useAppSelector } from "@/store/hooks"

export function useAuth() {
  const auth = useAppSelector((state) => state.auth)

  const navigation = useMemo(() => {
    if (!auth.user) {
      return []
    }

    return getNavigationForUser(auth.user.role, auth.user.permissions)
  }, [auth.user])

  return {
    ...auth,
    navigation,
    roleLabel: auth.user ? roleLabels[auth.user.role] : null,
  }
}
