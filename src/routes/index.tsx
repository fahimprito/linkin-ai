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
  FinishingDailyUpdatePage,
  FinishingPlanningPage,
  FinishingRequisitionPage,
  FullSystemProductionReportPage,
  LinkingDailyUpdatePage,
  LinkingPlanningPage,
  LinkingProductionReportPage,
  PoTrackerReportPage,
  YarnInformationReportPage,
  YarnStockCalculationReportPage,
} from "@/pages/forms/OperationsFormPages"
import { FinishingStoreIssueLogPage } from "@/pages/finishing/FinishingStoreIssueLogPage"
import { LinkingStoreIssueLogPage } from "@/pages/linking/LinkingStoreIssueLogPage"
import { LinkingStoreRequisitionPage } from "@/pages/linking/LinkingStoreRequisitionPage"
import { MerchandiseDetailPage } from "@/pages/merchandise/MerchandiseDetailPage"
import { MerchandiseListPage } from "@/pages/merchandise/MerchandiseListPage"
import { MerchandiseMasterExcelPage } from "@/pages/merchandise/MerchandiseMasterExcelPage"
import { KnittingDailyProgressPage } from "@/pages/knitting/KnittingDailyProgressPage"
import { KnittingIssuanceLogPage } from "@/pages/knitting/KnittingIssuanceLogPage"
import { KnittingPlanningPage } from "@/pages/knitting/KnittingPlanningPage"
import { KnittingRequisitionPage } from "@/pages/knitting/KnittingRequisitionPage"
import { UserProfilePage } from "@/pages/profile/UserProfilePage"
import { FinishingPage } from "@/pages/production/FinishingPage"
import { KnittingPage } from "@/pages/production/KnittingPage"
import { LinkingPage } from "@/pages/production/LinkingPage"
import { ReportsPage } from "@/pages/reports/ReportsPage"
import { DefaultRedirect } from "@/routes/default-redirect"
import { StoreControlPage } from "@/pages/store/StoreControlPage"
import { StoreIssueLogPage } from "@/pages/store/StoreIssueLogPage"
import { StoreRequisitionsPage } from "@/pages/store/StoreRequisitionsPage"
import { YarnControlPage } from "@/pages/yarn/YarnControlPage"
import { YarnCheckRequestsPage } from "@/pages/yarn/YarnCheckRequestsPage"
import { YarnSupplierOrderPage } from "@/pages/yarn/YarnSupplierOrderPage"
import { YarnDeliveryLogPage } from "@/pages/yarn/YarnDeliveryLogPage"
import { YarnBatchInspectionPage } from "@/pages/yarn/YarnBatchInspectionPage"
import { YarnIssueToKnittingPage } from "@/pages/yarn/YarnIssueToKnittingPage"
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
                path: "/merchandise/master-excel",
                element: <MerchandiseMasterExcelPage />,
                handle: { breadcrumb: "Master Excel" },
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
                path: "/yarn/check-requests",
                element: <YarnCheckRequestsPage />,
                handle: { breadcrumb: "Check Requests" },
              },
              {
                path: "/yarn/supplier-orders",
                element: <YarnSupplierOrderPage />,
                handle: { breadcrumb: "Supplier Orders" },
              },
              {
                path: "/yarn/delivery-log",
                element: <YarnDeliveryLogPage />,
                handle: { breadcrumb: "Delivery Log" },
              },
              {
                path: "/yarn/batch-inspection",
                element: <YarnBatchInspectionPage />,
                handle: { breadcrumb: "Batch Inspection" },
              },
              {
                path: "/yarn/issue-to-knitting",
                element: <YarnIssueToKnittingPage />,
                handle: { breadcrumb: "Issue to Knitting" },
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
                path: "/store/requisitions",
                element: <StoreRequisitionsPage />,
                handle: { breadcrumb: "Requisitions" },
              },
              {
                path: "/store/issue-log",
                element: <StoreIssueLogPage />,
                handle: { breadcrumb: "Issue Log" },
              },
              {
                path: "/store/accessories-po",
                element: <Navigate to="/store" replace />,
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/store/stock-receipt",
                element: <Navigate to="/store" replace />,
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/store/inspection",
                element: <Navigate to="/store" replace />,
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/store/floor-delivery",
                element: <Navigate to="/store/issue-log" replace />,
                handle: { breadcrumb: "Issue Log" },
              },
              {
                path: "/store/status-report",
                element: <Navigate to="/store" replace />,
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
              {
                path: "/knitting/requisition",
                element: <KnittingRequisitionPage />,
                handle: { breadcrumb: "Yarn Requisition" },
              },
              {
                path: "/knitting/accept-po",
                element: <Navigate to="/knitting/requisition" replace />,
                handle: { breadcrumb: "Yarn Requisition" },
              },
              {
                path: "/knitting/issuance-log",
                element: <KnittingIssuanceLogPage />,
                handle: { breadcrumb: "Yarn Issuance" },
              },
              {
                path: "/knitting/planning",
                element: <KnittingPlanningPage />,
                handle: { breadcrumb: "Planning" },
              },
              {
                path: "/knitting/daily-progress",
                element: <KnittingDailyProgressPage />,
                handle: { breadcrumb: "Daily Progress" },
              },
              {
                path: "/knitting/daily-update",
                element: <Navigate to="/knitting/daily-progress" replace />,
                handle: { breadcrumb: "Daily Progress" },
              },
              {
                path: "/knitting/status-report",
                element: <Navigate to="/knitting" replace />,
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
              {
                path: "/linking/store-requisition",
                element: <LinkingStoreRequisitionPage />,
                handle: { breadcrumb: "Store Requisition" },
              },
              {
                path: "/linking/store-issuance-log",
                element: <LinkingStoreIssueLogPage />,
                handle: { breadcrumb: "Store Issuance Log" },
              },
              {
                path: "/linking/planning",
                element: <LinkingPlanningPage />,
                handle: { breadcrumb: "Planning" },
              },
              {
                path: "/linking/daily-progress",
                element: <LinkingDailyUpdatePage />,
                handle: { breadcrumb: "Daily Progress" },
              },
              {
                path: "/linking/accept-po",
                element: <Navigate to="/linking" replace />,
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/linking/daily-update",
                element: <Navigate to="/linking/daily-progress" replace />,
                handle: { breadcrumb: "Daily Progress" },
              },
              {
                path: "/linking/status-report",
                element: <Navigate to="/linking" replace />,
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
              {
                path: "/finishing/store-requisition",
                element: <FinishingRequisitionPage />,
                handle: { breadcrumb: "Store Requisition" },
              },
              {
                path: "/finishing/store-issuance-log",
                element: <FinishingStoreIssueLogPage />,
                handle: { breadcrumb: "Store Issuance Log" },
              },
              {
                path: "/finishing/planning",
                element: <FinishingPlanningPage />,
                handle: { breadcrumb: "Planning" },
              },
              {
                path: "/finishing/daily-progress",
                element: <FinishingDailyUpdatePage />,
                handle: { breadcrumb: "Daily Progress" },
              },
              {
                path: "/finishing/accept-po",
                element: <Navigate to="/finishing" replace />,
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/finishing/requisition",
                element: <Navigate to="/finishing/store-requisition" replace />,
                handle: { breadcrumb: "Store Requisition" },
              },
              {
                path: "/finishing/daily-update",
                element: <Navigate to="/finishing/daily-progress" replace />,
                handle: { breadcrumb: "Daily Progress" },
              },
              {
                path: "/finishing/status-report",
                element: <Navigate to="/finishing" replace />,
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
                handle: { breadcrumb: "Overview" },
              },
              {
                path: "/reports/executive-analytics",
                element: <Navigate to="/reports" replace />,
                handle: { breadcrumb: "Overview" },
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
                element: <Navigate to="/reports" replace />,
                handle: { breadcrumb: "Overview" },
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
