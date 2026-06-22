# Linkin AI Admin

Frontend foundation for an enterprise SaaS platform called `Linkin AI`.

Linkin AI is designed for garment manufacturing operations. The platform connects cross-functional departments, standardizes workflows, tracks production, manages inventory, and provides management dashboards and insights.

This repository currently focuses on the frontend only. Data is mocked for now, but the architecture is prepared for external REST APIs.

## Overview

The app is built as a scalable admin dashboard with:

- role-based authentication and protected routing
- department-based module access
- dashboard and auth layouts
- reusable UI building blocks
- Redux Toolkit state management
- RTK Query-based service layer
- mock data and placeholder API behavior
- responsive desktop and mobile navigation

## Tech Stack

- `React 19`
- `TypeScript`
- `Vite`
- `Tailwind CSS v4`
- `Redux Toolkit`
- `RTK Query`
- `React Router`
- `React Hook Form`
- `Sonner`
- `Axios`
- `shadcn/ui` patterns with custom shared components

## Business Context

Linkin AI is intended to support multiple operational departments inside a garment manufacturing workflow:

- Merchandise
- Yarn Control
- Store Control
- Knitting
- Linking
- Finishing
- Management
- Super Admin

Each user sees only the modules they are allowed to access.

## Authentication And RBAC

The frontend includes a complete mock authentication architecture:

- Login page
- Forgot password page
- Reset password page
- Session persistence in local storage
- Protected routes
- Role-based route access
- Default redirect based on role permissions

### Supported Roles

- `super_admin`
- `merchandise_user`
- `yarn_control_user`
- `store_control_user`
- `knitting_user`
- `linking_user`
- `finishing_user`
- `management_user`

### Demo Accounts

All demo users currently use:

```txt
password123
```

Available demo emails:

- `admin@linkin.ai`
- `merch@linkin.ai`
- `yarn@linkin.ai`
- `store@linkin.ai`
- `knit@linkin.ai`
- `linking@linkin.ai`
- `finishing@linkin.ai`
- `management@linkin.ai`

## Core Modules

### 1. Executive Dashboard

- KPI cards
- production overview
- inventory overview
- recent activity
- executive reporting entry point

### 2. Merchandise Module

- purchase order list
- purchase order detail page
- buyer information
- design information
- yarn consumption request context
- supplier order tracking
- production tracking

### 3. Yarn Control Module

- yarn purchase orders
- supplier receipts
- stock management
- inspection records
- floor delivery records

### 4. Store Control Module

- accessories purchase orders
- supplier receipts
- inventory tracking
- inspection records
- delivery records
- stock reports

### 5. Knitting Module

- production orders
- planning
- requisitions
- progress tracking
- management reporting

### 6. Linking Module

- linking orders
- planning
- production tracking
- status updates
- management reporting

### 7. Finishing Module

- washing
- ironing
- packing
- production planning
- requisition requests
- production tracking
- management reports

### 8. Reports And Analytics

- executive analytics
- production overview
- yarn overview
- store overview
- shipment overview
- KPI placeholders
- chart placeholders

## Frontend Architecture

The project uses a feature-friendly and enterprise-ready structure:

```txt
src/
├── app/
├── assets/
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── features/
├── hooks/
├── layouts/
├── lib/
├── mock/
├── pages/
├── routes/
├── services/
├── store/
└── types/
```

### Important Areas

- `src/app`
  App-level providers such as Redux, theme, and Sonner.

- `src/components/layout`
  Header, sidebar, breadcrumbs, and dashboard shell pieces.

- `src/components/shared`
  Reusable business UI components like tables, cards, states, and menus.

- `src/features/auth`
  Authentication state and role/session logic.

- `src/mock`
  Mock users, mock module data, and notifications.

- `src/pages`
  Route-level screens for auth, dashboard, modules, and shared page templates.

- `src/routes`
  Router configuration, protected route handling, and role-based redirects.

- `src/services`
  RTK Query base API and mocked async endpoints.

- `src/store`
  Redux store setup and shared slices.

- `src/types`
  Shared TypeScript domain types.

## State Management

Redux Toolkit is used for client state, and RTK Query is used for API-facing state.

### Configured Slices

- `authSlice`
- `uiSlice`
- `notificationSlice`

### API Layer

- `baseApi` is configured with RTK Query
- `linkinApi` currently returns mock async responses
- the structure is ready to swap from `fakeBaseQuery` to real API requests

## Reusable UI Components

The app already includes shared building blocks such as:

- `DataTable`
- `PageHeader`
- `SearchFilterBar`
- `StatusBadge`
- `MetricCard`
- `EmptyState`
- `LoadingState`
- `ConfirmationDialog`
- `UserMenu`
- `NotificationDropdown`

## Layout System

### Auth Layout

Used for:

- login
- forgot password
- reset password

### Dashboard Layout

Used for:

- sidebar navigation
- top header
- breadcrumbs
- notification access
- responsive mobile sidebar behavior

## Routing

Routing is organized around:

- auth routes
- protected routes
- role-based route groups
- unauthorized fallback
- not found page

Users are redirected to their first permitted module after login.

## Mocked Data Strategy

Until backend APIs are connected, the app uses:

- mock auth users
- mock module summaries
- mock purchase orders
- mock notifications
- mocked RTK Query endpoints with async timing

This keeps the UI and state flow realistic while backend integration is pending.

## Getting Started

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Type Check

```bash
npm run typecheck
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Current Status

Implemented:

- dashboard shell
- auth pages
- mock login flow
- role-based access control
- module pages and placeholders
- shared components
- RTK Query mock service layer
- session persistence
- responsive sidebar and header

Still good next steps:

- real backend API integration
- real search/filter logic
- profile and settings pages
- charts and visual analytics
- tables with pagination/sorting
- form validation and submission flows
- permissions from backend
- testing setup

## Notes

- Some earlier scaffold files still exist in the repo, such as older starter layout/page files, but the active app flow uses the route-based architecture under `src/routes`, `src/layouts`, and `src/pages`.
- The service layer currently mixes RTK Query mocks and an `axios` helper so the app is ready for future API integration.

## License

Private internal project.
