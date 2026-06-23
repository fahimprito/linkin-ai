import { createBrowserRouter } from "react-router"

import { AuthLayout } from "@/layouts/AuthLayout"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage"
import { LoginPage } from "@/pages/auth/LoginPage"
import { ResetPasswordPage } from "@/pages/auth/ResetPasswordPage"
import { NotFoundPage } from "@/pages/common/NotFoundPage"
import { UnauthorizedPage } from "@/pages/common/UnauthorizedPage"
import { ExecutiveDashboardPage } from "@/pages/dashboard/ExecutiveDashboardPage"
import {
  FinishingAcceptPoPage,
  FinishingDailyUpdatePage,
  FinishingPlanningPage,
  FinishingRequisitionPage,
  FinishingStatusReportPage,
  FullSystemProductionReportPage,
  KnittingAcceptPoPage,
  KnittingDailyUpdatePage,
  KnittingPlanningPage,
  KnittingRequisitionPage,
  KnittingStatusReportPage,
  LinkingAcceptPoPage,
  LinkingDailyUpdatePage,
  LinkingPlanningPage,
  LinkingProductionReportPage,
  LinkingStatusReportPage,
  MerchandiseFetchPoPage,
  MerchandiseManagementReportPage,
  MerchandiseProductionUpdatesPage,
  MerchandiseSupplierFollowUpPage,
  MerchandiseYarnRequestPage,
  PackingSectionReportPage,
  PoTrackerReportPage,
  StoreAccessoriesPoPage,
  StoreFloorDeliveryPage,
  StoreInspectionPage,
  StoreStatusReportPage,
  StoreStockReceiptPage,
  YarnFloorDeliveryPage,
  YarnInformationReportPage,
  YarnInspectionPage,
  YarnManagementReportPage,
  YarnPoIntakePage,
  YarnStockCalculationReportPage,
  YarnSupplierReceiptPage,
} from "@/pages/forms/OperationsFormPages"
import { MerchandiseDetailPage } from "@/pages/merchandise/MerchandiseDetailPage"
import { MerchandiseListPage } from "@/pages/merchandise/MerchandiseListPage"
import { UserProfilePage } from "@/pages/profile/UserProfilePage"
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
            path: "/profile",
            element: <UserProfilePage />,
            handle: { breadcrumb: "User Profile" },
          },
          {
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
                handle: { breadcrumb: "Main Dashboard" },
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
                path: "/merchandise/fetch-po",
                element: <MerchandiseFetchPoPage />,
                handle: { breadcrumb: "Fetch Buyer PO" },
              },
              {
                path: "/merchandise/yarn-request",
                element: <MerchandiseYarnRequestPage />,
                handle: { breadcrumb: "Yarn Request" },
              },
              {
                path: "/merchandise/supplier-follow-up",
                element: <MerchandiseSupplierFollowUpPage />,
                handle: { breadcrumb: "Supplier Follow-up" },
              },
              {
                path: "/merchandise/production-updates",
                element: <MerchandiseProductionUpdatesPage />,
                handle: { breadcrumb: "Production Updates" },
              },
              {
                path: "/merchandise/management-report",
                element: <MerchandiseManagementReportPage />,
                handle: { breadcrumb: "Mgmt Report" },
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
              {
                path: "/yarn/po-intake",
                element: <YarnPoIntakePage />,
                handle: { breadcrumb: "Accept PO" },
              },
              {
                path: "/yarn/supplier-receipt",
                element: <YarnSupplierReceiptPage />,
                handle: { breadcrumb: "Supplier Receipt" },
              },
              {
                path: "/yarn/inspection",
                element: <YarnInspectionPage />,
                handle: { breadcrumb: "Inspection" },
              },
              {
                path: "/yarn/floor-delivery",
                element: <YarnFloorDeliveryPage />,
                handle: { breadcrumb: "Floor Delivery" },
              },
              {
                path: "/yarn/management-report",
                element: <YarnManagementReportPage />,
                handle: { breadcrumb: "Mgmt Report" },
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
              {
                path: "/store/accessories-po",
                element: <StoreAccessoriesPoPage />,
                handle: { breadcrumb: "Accessories PO" },
              },
              {
                path: "/store/stock-receipt",
                element: <StoreStockReceiptPage />,
                handle: { breadcrumb: "Receive & Stock" },
              },
              {
                path: "/store/inspection",
                element: <StoreInspectionPage />,
                handle: { breadcrumb: "Inspection" },
              },
              {
                path: "/store/floor-delivery",
                element: <StoreFloorDeliveryPage />,
                handle: { breadcrumb: "Floor Delivery" },
              },
              {
                path: "/store/status-report",
                element: <StoreStatusReportPage />,
                handle: { breadcrumb: "Status Report" },
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
              {
                path: "/knitting/accept-po",
                element: <KnittingAcceptPoPage />,
                handle: { breadcrumb: "Accept PO" },
              },
              {
                path: "/knitting/requisition",
                element: <KnittingRequisitionPage />,
                handle: { breadcrumb: "Requisition" },
              },
              {
                path: "/knitting/planning",
                element: <KnittingPlanningPage />,
                handle: { breadcrumb: "Planning" },
              },
              {
                path: "/knitting/daily-update",
                element: <KnittingDailyUpdatePage />,
                handle: { breadcrumb: "Daily Update" },
              },
              {
                path: "/knitting/status-report",
                element: <KnittingStatusReportPage />,
                handle: { breadcrumb: "Status Report" },
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
              {
                path: "/linking/accept-po",
                element: <LinkingAcceptPoPage />,
                handle: { breadcrumb: "Accept PO" },
              },
              {
                path: "/linking/planning",
                element: <LinkingPlanningPage />,
                handle: { breadcrumb: "Planning" },
              },
              {
                path: "/linking/daily-update",
                element: <LinkingDailyUpdatePage />,
                handle: { breadcrumb: "Daily Update" },
              },
              {
                path: "/linking/status-report",
                element: <LinkingStatusReportPage />,
                handle: { breadcrumb: "Status Report" },
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
              {
                path: "/finishing/accept-po",
                element: <FinishingAcceptPoPage />,
                handle: { breadcrumb: "Accept PO" },
              },
              {
                path: "/finishing/requisition",
                element: <FinishingRequisitionPage />,
                handle: { breadcrumb: "Requisition" },
              },
              {
                path: "/finishing/planning",
                element: <FinishingPlanningPage />,
                handle: { breadcrumb: "Planning" },
              },
              {
                path: "/finishing/daily-update",
                element: <FinishingDailyUpdatePage />,
                handle: { breadcrumb: "Daily Update" },
              },
              {
                path: "/finishing/status-report",
                element: <FinishingStatusReportPage />,
                handle: { breadcrumb: "Status Report" },
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
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/reports/executive-analytics",
                element: <ReportsPage />,
                handle: { breadcrumb: "Executive Analytics" },
              },
              {
                path: "/reports/full-system-production",
                element: <FullSystemProductionReportPage />,
                handle: { breadcrumb: "Full Production" },
              },
              {
                path: "/reports/yarn-information",
                element: <YarnInformationReportPage />,
                handle: { breadcrumb: "Yarn Information" },
              },
              {
                path: "/reports/yarn-stock-calculation",
                element: <YarnStockCalculationReportPage />,
                handle: { breadcrumb: "Yarn Stock Calc" },
              },
              {
                path: "/reports/packing-section",
                element: <PackingSectionReportPage />,
                handle: { breadcrumb: "Packing Section" },
              },
              {
                path: "/reports/linking-production",
                element: <LinkingProductionReportPage />,
                handle: { breadcrumb: "Linking Report" },
              },
              {
                path: "/reports/po-tracker",
                element: <PoTrackerReportPage />,
                handle: { breadcrumb: "PO Tracker" },
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
