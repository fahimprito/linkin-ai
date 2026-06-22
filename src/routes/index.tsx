import { createBrowserRouter } from "react-router"

import { AuthLayout } from "@/layouts/AuthLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage"
import { NotFoundPage } from "@/pages/common/NotFoundPage"
import { UnauthorizedPage } from "@/pages/common/UnauthorizedPage"
import { ExecutiveDashboardPage } from "@/pages/dashboard/ExecutiveDashboardPage"
import { MerchandiseDetailPage } from "@/pages/merchandise/MerchandiseDetailPage"
import { MerchandiseListPage } from "@/pages/merchandise/MerchandiseListPage"
import { FinishingPage } from "@/pages/production/FinishingPage"
import { KnittingPage } from "@/pages/production/KnittingPage"
import { LinkingPage } from "@/pages/production/LinkingPage"
import { ReportsPage } from "@/pages/reports/ReportsPage"
import { DefaultRedirect } from "@/routes/default-redirect"
import { StoreControlPage } from "@/pages/store/StoreControlPage"
import { YarnControlPage } from "@/pages/yarn/YarnControlPage"
import { ProtectedRoute } from "@/routes/protected-route"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultRedirect />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
        handle: { breadcrumb: "Login" },
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
        handle: { breadcrumb: "Forgot Password" },
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
        handle: { breadcrumb: "Reset Password" },
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        handle: {
          breadcrumb: {
            label: "Home",
            to: "/",
          },
        },
        children: [
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "management_user"]} />,
            handle: {
              breadcrumb: {
                label: "Dashboard",
                to: "/dashboard",
              },
            },
            children: [
              {
                path: "/dashboard",
                element: <ExecutiveDashboardPage />,
                handle: { breadcrumb: "Executive Dashboard" },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "merchandise_user"]} />,
            handle: {
              breadcrumb: {
                label: "Merchandise",
                to: "/merchandise",
              },
            },
            children: [
              {
                path: "/merchandise",
                element: <MerchandiseListPage />,
                handle: { breadcrumb: "PO List" },
              },
              {
                path: "/merchandise/:poId",
                element: <MerchandiseDetailPage />,
                handle: {
                  breadcrumb: (params: Record<string, string | undefined>) =>
                    params.poId ? `PO ${params.poId}` : "PO Detail",
                },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "yarn_control_user"]} />,
            handle: {
              breadcrumb: {
                label: "Yarn Control",
                to: "/yarn",
              },
            },
            children: [
              {
                path: "/yarn",
                element: <YarnControlPage />,
                handle: { breadcrumb: "Overview" },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "store_control_user"]} />,
            handle: {
              breadcrumb: {
                label: "Store Control",
                to: "/store",
              },
            },
            children: [
              {
                path: "/store",
                element: <StoreControlPage />,
                handle: { breadcrumb: "Overview" },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "knitting_user"]} />,
            handle: {
              breadcrumb: {
                label: "Knitting",
                to: "/knitting",
              },
            },
            children: [
              {
                path: "/knitting",
                element: <KnittingPage />,
                handle: { breadcrumb: "Overview" },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "linking_user"]} />,
            handle: {
              breadcrumb: {
                label: "Linking",
                to: "/linking",
              },
            },
            children: [
              {
                path: "/linking",
                element: <LinkingPage />,
                handle: { breadcrumb: "Overview" },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "finishing_user"]} />,
            handle: {
              breadcrumb: {
                label: "Finishing",
                to: "/finishing",
              },
            },
            children: [
              {
                path: "/finishing",
                element: <FinishingPage />,
                handle: { breadcrumb: "Overview" },
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "management_user"]} />,
            handle: {
              breadcrumb: {
                label: "Reports",
                to: "/reports",
              },
            },
            children: [
              {
                path: "/reports",
                element: <ReportsPage />,
                handle: { breadcrumb: "Executive Analytics" },
              },
            ],
          },
          {
            path: "/unauthorized",
            element: <UnauthorizedPage />,
            handle: { breadcrumb: "Unauthorized" },
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])
