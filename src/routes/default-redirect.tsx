import { Navigate } from "react-router"

import { useAuth } from "@/hooks/use-auth"
import { getDefaultRoute } from "@/lib/permissions"

export function DefaultRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={getDefaultRoute(user.permissions)} replace />
}
