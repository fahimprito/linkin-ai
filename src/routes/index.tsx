import { createBrowserRouter, Navigate } from "react-router"

import { AuthLayout } from "@/layouts/AuthLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage"
import { NotFoundPage } from "@/pages/common/NotFoundPage"
import { UnauthorizedPage } from "@/pages/common/UnauthorizedPage"
import { ExecutiveDashboardPage } from "@/pages/dashboard/ExecutiveDashboardPage"
import {
  MerchandiseProductionUpdatesPage,
} from "@/pages/forms/OperationsFormPages"
import {
  DesignDashboardPage,
  DesignReportsPage,
  DesignSettingsPage,
  DesignSubmittedPoListPage,
  DesignStylePoPage,
} from "@/pages/design/DesignModulePages"
import { MerchandiseListPage } from "@/pages/merchandise/MerchandiseListPage"
import { MerchandiseMasterExcelPage } from "@/pages/merchandise/MerchandiseMasterExcelPage"
import { MerchandiseSourcingPage } from "@/pages/merchandise/MerchandiseSourcingPage"
import { MerchandiseSupplierPage } from "@/pages/merchandise/MerchandiseSupplierPage"
import {
  MerchandiseDashboardPage,
  MerchandiseInventoryPage,
  MerchandiseStoreInventoryPage,
  MerchandiseSettingsPage,
  MerchandiseShipmentPage,
} from "@/pages/merchandise/MerchandiseModulePages"
import { UserProfilePage } from "@/pages/profile/UserProfilePage"
import {
  ManagementPoDetailTrackerPage,
  MerchandiseManagementReportPage,
} from "@/pages/reports/ManagementPoDetailTrackerPage"
import { ReportsPage } from "@/pages/reports/ReportsPage"
import { DefaultRedirect } from "@/routes/default-redirect"
import { StoreControlPage } from "@/pages/store/StoreControlPage"
import {
  StoreAccessoriesInspectionReportPage,
  StoreAccessoriesReceivingReportPage,
  StoreInspectionPage,
  StoreInventoryPage,
  StoreReportsPage,
} from "@/pages/store/StoreModulePages"
import { StorePoListPage } from "@/pages/store/StorePoListPage"
import { StoreReceiveAccessoriesPage } from "@/pages/store/StoreReceiveAccessoriesPage"
import { YarnControlPage } from "@/pages/yarn/YarnControlPage"
import { YarnCheckRequestsPage } from "@/pages/yarn/YarnCheckRequestsPage"
import { YarnSupplierOrderPage } from "@/pages/yarn/YarnSupplierOrderPage"
import { YarnDeliveryLogPage } from "@/pages/yarn/YarnDeliveryLogPage"
import { YarnBatchInspectionPage } from "@/pages/yarn/YarnBatchInspectionPage"
import { YarnIssueToKnittingPage } from "@/pages/yarn/YarnIssueToKnittingPage"
import { YarnPoListPage, YarnSwatchCardPage } from "@/pages/yarn/YarnAdditionalPages"
import {
  YarnSwatchPhysicalTestReportPage,
  YarnTestReportPage,
} from "@/pages/yarn/YarnReportPages"
import { YarnInventoryPage } from "@/pages/yarn/YarnModulePages"
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
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
      {
        path: "/reset-password",
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/profile",
            element: <UserProfilePage />,
          },
          {
            children: [
              {
                path: "/dashboard",
                element: <ExecutiveDashboardPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "merchandising_user"]} />,
            children: [
              {
                path: "/merchandise/dashboard",
                element: <MerchandiseDashboardPage />,
              },
              {
                path: "/merchandise",
                element: <MerchandiseListPage />,
              },
              {
                path: "/merchandise/sourcing",
                element: <MerchandiseSourcingPage />,
              },
              {
                path: "/merchandise/supplier",
                element: <MerchandiseSupplierPage />,
              },
              {
                path: "/merchandise/production",
                element: <MerchandiseProductionUpdatesPage />,
              },
              {
                path: "/merchandise/inventory",
                element: <Navigate to="/merchandise/inventory/yarn" replace />,
              },
              {
                path: "/merchandise/inventory/yarn",
                element: <MerchandiseInventoryPage />,
              },
              {
                path: "/merchandise/inventory/store",
                element: <MerchandiseStoreInventoryPage />,
              },
              {
                path: "/merchandise/shipment",
                element: <MerchandiseShipmentPage />,
              },
              {
                path: "/merchandise/report",
                element: <MerchandiseManagementReportPage />,
              },
              {
                path: "/merchandise/settings",
                element: <MerchandiseSettingsPage />,
              },
              {
                path: "/merchandise/master-excel",
                element: <MerchandiseMasterExcelPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "design_user"]} />,
            children: [
              {
                path: "/design",
                element: <Navigate to="/design/dashboard" replace />,
              },
              {
                path: "/design/dashboard",
                element: <DesignDashboardPage />,
              },
              {
                path: "/design/request-consumption",
                element: <DesignStylePoPage />,
              },
              {
                path: "/design/submitted-po-list",
                element: <DesignSubmittedPoListPage />,
              },
              {
                path: "/design/request",
                element: <Navigate to="/design/request-consumption" replace />,
              },
              {
                path: "/design/consumption",
                element: <Navigate to="/design/request-consumption" replace />,
              },
              {
                path: "/design/style-po",
                element: <Navigate to="/design/request-consumption" replace />,
              },
              {
                path: "/design/reports",
                element: <DesignReportsPage />,
              },
              {
                path: "/design/settings",
                element: <DesignSettingsPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "yarn_user"]} />,
            children: [
              {
                path: "/yarn",
                element: <Navigate to="/yarn/dashboard" replace />,
              },
              {
                path: "/yarn/dashboard",
                element: <YarnControlPage />,
              },
              {
                path: "/yarn/po-list",
                element: <YarnPoListPage />,
              },
              {
                path: "/yarn/requisition",
                element: <YarnCheckRequestsPage />,
              },
              {
                path: "/yarn/receipt",
                element: <YarnDeliveryLogPage />,
              },
              {
                path: "/yarn/inspection",
                element: <YarnBatchInspectionPage />,
              },
              {
                path: "/yarn/report",
                element: <YarnTestReportPage />,
              },
              {
                path: "/yarn/report/swatch-physical",
                element: <YarnSwatchPhysicalTestReportPage />,
              },
              {
                path: "/yarn/inventory",
                element: <YarnInventoryPage />,
              },
              {
                path: "/yarn/swatch-card",
                element: <YarnSwatchCardPage />,
              },
              {
                path: "/yarn/check-requests",
                element: <Navigate to="/yarn/requisition" replace />,
              },
              {
                path: "/yarn/supplier-orders",
                element: <YarnSupplierOrderPage />,
              },
              {
                path: "/yarn/delivery-log",
                element: <Navigate to="/yarn/receipt" replace />,
              },
              {
                path: "/yarn/batch-inspection",
                element: <Navigate to="/yarn/inspection" replace />,
              },
              {
                path: "/yarn/issue-to-knitting",
                element: <YarnIssueToKnittingPage />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "store_user"]} />,
            children: [
              {
                path: "/store",
                element: <StoreControlPage />,
              },
              {
                path: "/store/po-list",
                element: <StorePoListPage />,
              },
              {
                path: "/store/receive-accessories",
                element: <StoreReceiveAccessoriesPage />,
              },
              {
                path: "/store/requisitions",
                element: <Navigate to="/store/po-list" replace />,
              },
              {
                path: "/store/issue-log",
                element: <Navigate to="/store/po-list" replace />,
              },
              {
                path: "/store/accessories-po",
                element: <Navigate to="/store/po-list" replace />,
              },
              {
                path: "/store/stock-receipt",
                element: <Navigate to="/store/receive-accessories" replace />,
              },
              {
                path: "/store/inspection",
                element: <StoreInspectionPage />,
              },
              {
                path: "/store/inventory",
                element: <StoreInventoryPage />,
              },
              {
                path: "/store/floor-delivery",
                element: <Navigate to="/store/po-list" replace />,
              },
              {
                path: "/store/reports",
                element: <StoreReportsPage />,
              },
              {
                path: "/store/reports/accessories-inspection",
                element: <StoreAccessoriesInspectionReportPage />,
              },
              {
                path: "/store/reports/accessories-receiving",
                element: <StoreAccessoriesReceivingReportPage />,
              },
              {
                path: "/store/status-report",
                element: <Navigate to="/store/reports" replace />,
              },
            ],
          },
          {
            element: <ProtectedRoute allowedRoles={["super_admin", "management_user"]} />,
            children: [
              {
                path: "/management",
                element: <ReportsPage />,
              },
              {
                path: "/management/po-tracker",
                element: <ManagementPoDetailTrackerPage />,
              },
              {
                path: "/reports",
                element: <Navigate to="/management" replace />,
              },
              {
                path: "/reports/po-tracker",
                element: <Navigate to="/management/po-tracker" replace />,
              },
            ],
          },
          {
            path: "/unauthorized",
            element: <UnauthorizedPage />,
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
