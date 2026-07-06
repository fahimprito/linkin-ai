import { Navigate, Outlet, useLocation } from "react-router"

import { hasRoleAccess } from "@/lib/permissions"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/types/auth"

type ProtectedRouteProps = {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !hasRoleAccess(user.role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}


