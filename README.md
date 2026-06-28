# Linkin AI ERP Frontend

Role-based ERP frontend for knit garment operations. The app coordinates the PO workflow across Merchandising, Design, Yarn, Store, and Management with shared tables, dashboards, and local workflow state.

## What This Project Does

Linkin AI models a department-by-department production flow:

- Merchandiser creates and manages purchase orders
- Design receives submitted POs and adds consumption data
- Yarn receives approved yarn-related POs, tracks receiving, inspection, swatch, and inventory
- Store receives accessories-related POs, tracks receiving, inspection, and inventory
- Management monitors workflow progress through a dashboard and PO tracker

The current build is frontend-only. Most business data is stored in `localStorage` and managed through Redux Toolkit so the app behaves like a working internal ERP prototype without requiring a backend.

## Current Modules

### Merchandise

- Dashboard
- PO List
- Create PO
- Create PO from Existing Style
- Edit/Delete PO
- Sourcing
- Supplier management
- Production updates
- Inventory
- Shipment
- Management-style report
- Master Excel page

### Design

- Dashboard
- Request Consumption
- Submitted PO List
- Reports
- Settings

### Yarn

- Dashboard
- PO List
- Requisition
- Receive Yarn
- Inspection
- Swatch Card
- Reports
- Inventory
- Supplier order / delivery / issue workflow pages

### Store

- Dashboard
- PO List
- Receive Accessories
- Inspection
- Inventory
- Reports

### Management

- Dashboard
- PO Detail Tracker

## Key Functional Areas

- Role-based login and protected routing
- Module-aware sidebar navigation
- Shared PO workflow across departments
- Two-level grouped PO table headers where needed
- Search, filter, sort, export, pagination, and responsive tables
- Sticky action columns in large workflow tables
- Local workflow synchronization between Merchandising, Design, Yarn, Store, and Management views
- Status badges and workflow progress tracking
- Light/dark theme support with light mode as default
- Mobile-friendly sidebar and dashboard layout

## Workflow Snapshot

The PO workflow is modeled in the UI around these statuses:

`Created` -> `Sent to Design` -> `Design Completed` -> `Sent to Yarn` -> `Yarn Processing` -> `Yarn Ready` -> `Sent to Store` -> `Store Processing` -> `Store Ready` -> downstream production stages

Not every downstream production module is fully active yet, but the shared workflow model is already used by the active modules and reports.

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
- `Lucide React`

## Project Structure

```txt
src/
|-- app/                    # app providers
|-- components/
|   |-- layout/             # header, sidebar, app shell
|   |-- shared/             # reusable business components
|   `-- ui/                 # low-level UI primitives
|-- features/
|   `-- auth/               # auth state
|-- layouts/                # auth and dashboard layouts
|-- lib/                    # workflow helpers, storage helpers, utilities
|-- mock/                   # mock auth and seed data
|-- pages/
|   |-- auth/
|   |-- dashboard/
|   |-- design/
|   |-- merchandise/
|   |-- reports/
|   |-- store/
|   `-- yarn/
|-- routes/                 # route config and redirects
|-- services/               # RTK Query base API
|-- store/                  # Redux store and slices
`-- types/                  # shared domain types
```

## State And Persistence

The app uses Redux Toolkit as the main state layer.

### Active store areas

- `auth`
- `merchandise`
- `yarnCheck`
- `storeService`
- `knitting`
- `formSubmissions`
- `notifications`
- `ui`
- `baseApi`

### Persistence

The app currently persists important workflow data in `localStorage`, including:

- user session
- purchase orders
- yarn receiving and inventory records
- store receiving and inventory records
- supplier records
- notifications
- form submissions

This makes the prototype immediately usable during development without backend setup.

## Authentication

Mock authentication is built in.

### Supported roles

- `super_admin`
- `merchandising_user`
- `design_user`
- `yarn_user`
- `store_user`
- `management_user`

### Demo accounts

All demo accounts use:

```txt
password123
```

Available emails:

- `admin@linkin.ai`
- `merch@linkin.ai`
- `design@linkin.ai`
- `yarn@linkin.ai`
- `store@linkin.ai`
- `management@linkin.ai`

## Routing Overview

The live app routes are organized around:

- `/login`, `/forgot-password`, `/reset-password`
- `/dashboard`
- `/merchandise/*`
- `/design/*`
- `/yarn/*`
- `/store/*`
- `/management/*`
- `/profile`

Route access is enforced by role through `src/routes/index.tsx` and `src/routes/protected-route.tsx`.

## Shared UI Components

The project already includes reusable building blocks used across modules:

- `DataTable`
- `PageHeader`
- `SearchFilterBar`
- `StatusBadge`
- `MetricCard`
- `StageTracker`
- `ConfirmationDialog`
- `EmptyState`
- `LoadingState`
- `UserMenu`

## Development

### Install

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

### Type check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

## Notes For Developers

- The app is currently frontend-first and backend-ready, but not backend-connected.
- Some legacy or placeholder pages still exist in the repository for future modules, but the active production flow is driven by the route tree in `src/routes/index.tsx`.
- Several workflow integrations are implemented through shared helpers in `src/lib/` rather than isolated page logic.
- If you change PO fields or workflow statuses, update the shared types, helpers, and table column definitions together.

## Current Scope

Implemented well enough to demo:

- auth flow
- role-aware navigation
- merchandise PO workflow
- design handoff flow
- yarn receiving / inspection / reporting / inventory UI
- store receiving / inspection / reporting / inventory UI
- management PO tracking
- responsive admin shell

Still evolving:

- full production module rollout
- backend API integration
- audit trail hardening
- deeper validation rules across all stages
- automated tests

## License

Private internal project.
