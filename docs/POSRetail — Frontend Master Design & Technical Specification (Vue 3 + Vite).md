# POSRetail — Frontend Master Design & Technical Specification

### Vue 3 + Vite Single-Page Application

**Status:** Implementation-ready reference. Derived strictly from the approved MVP requirements, the 26-screen UI/UX wireframe specification, the validated clickable prototype (v3), and the role/navigation matrix already defined for this project. Where the backend contract is not yet defined, this is explicitly flagged as an **Open Dependency** rather than assumed.

---

## Table of Contents

1. [Frontend Architecture](#1-frontend-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Bootstrap](#4-application-bootstrap)
5. [Routing Architecture](#5-routing-architecture)
6. [Layout & Navigation Architecture](#6-layout--navigation-architecture)
7. [Page Architecture](#7-page-architecture)
8. [Component Architecture](#8-component-architecture)
9. [State Management](#9-state-management)
10. [API Integration](#10-api-integration)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Forms & Validation](#12-forms--validation)
13. [CRUD Architecture](#13-crud-architecture)
14. [Table / Data Grid Architecture](#14-table--data-grid-architecture)
15. [UI/UX Implementation](#15-uiux-implementation)
16. [Error Handling](#16-error-handling)
17. [Security](#17-security)
18. [Performance](#18-performance)
19. [Accessibility](#19-accessibility)
20. [Testing Strategy](#20-testing-strategy)
21. [Code Quality & Development Rules](#21-code-quality--development-rules)
22. [Environment & Configuration](#22-environment--configuration)
23. [Build & Deployment](#23-build--deployment)
24. [Development Workflow](#24-development-workflow)
25. [Implementation Roadmap](#25-implementation-roadmap)
26. [Final Architecture Reference](#26-final-architecture-reference)
27. [Open Dependencies & Unconfirmed Requirements](#27-open-dependencies--unconfirmed-requirements)

---

## 1. Frontend Architecture

### 1.1 Overall Architecture

The application is a **feature-based, layered SPA** built on Vue 3 + Vite. It is a client rendered against a REST API (contract TBD — see §27). There is no SSR/SSG requirement; the app is an internal operational tool (POS terminal + back-office), not a public, SEO-sensitive site.

Architecture style: **Layered + Feature-Sliced hybrid**

```
┌─────────────────────────────────────────────┐
│  Presentation Layer (Pages, Layouts, UI)     │
├─────────────────────────────────────────────┤
│  Application Layer (Composables, Stores)     │
├─────────────────────────────────────────────┤
│  Domain Layer (Types, Validation Schemas)    │
├─────────────────────────────────────────────┤
│  Infrastructure Layer (API Client, Services) │
└─────────────────────────────────────────────┘
```

- **Presentation** never calls the API client directly — it calls composables/services.
- **Application** (composables, Pinia stores) orchestrates state and calls **Infrastructure** services.
- **Domain** (TypeScript types, Zod schemas) has no dependency on Vue or Axios — pure data contracts, importable anywhere.
- **Infrastructure** knows nothing about Vue components — it's the Axios instance and per-resource service modules.

### 1.2 Architectural Principles

1. **Feature-first organization** — code is grouped by business feature (`products`, `pos`, `users`) not by technical type (`all-components/`, `all-services/`). Cross-cutting technical layers (`components/ui`, `services/http`) live at the root of `src/`.
2. **Unidirectional data flow** — Page → Composable/Store → Service → API → back up through the same chain. Components never mutate server state directly; they call an action/method.
3. **Single source of truth per data type** — a given entity (e.g., "current logged-in user") is owned by exactly one store. No duplicate copies of the same state in multiple components.
4. **Composition over inheritance** — behavior is shared via composables (`useProducts`, `usePagination`, `useConfirmDialog`), not via component mixins or base-component inheritance chains.
5. **Explicit boundaries** — a feature module (`features/products`) may import from `src/components`, `src/composables`, `src/services/http`, and its own files. It must **not** import internals of another feature module (`features/users/internal-helper.js`). Cross-feature reuse goes through `src/composables` or `src/services`.
6. **No premature abstraction** — do not introduce a generic "CRUD factory" or "entity engine" until at least three features have proven the exact same shape is needed. The four CRUD domains here (Products, Categories, Users, and read-only Transactions) are similar but not identical (e.g., Users has Deactivate instead of Delete) — a shared **composable pattern**, not a rigid generic class, is used (see §13).

### 1.3 Application Layers

| Layer | Contains | Depends on |
| --- | --- | --- |
| Presentation | `pages/`, `layouts/`, `components/` | Application layer only |
| Application | `composables/`, `stores/` | Domain + Infrastructure |
| Domain | `types/`, `schemas/`, `constants/` | Nothing (pure) |
| Infrastructure | `services/http/`, `services/api/` | Domain (for typing responses) |

### 1.4 Separation of Concerns

- **Routing** decides *which page renders*, never *what data it needs* — data fetching happens inside the page/composable, triggered by the route being entered (via `onMounted` or a route-level guard, not by the router itself holding business logic).
- **Layouts** own chrome (sidebar, top bar) and know nothing about page-specific data.
- **Pages** own orchestration for one screen: call composables, handle loading/empty/error states, pass data down to presentational components.
- **Presentational components** (buttons, tables, cards, modals) receive props and emit events. They hold no server state and make no API calls.
- **Stores** hold state that must survive across route changes or be shared by more than one page (auth/session, POS cart, sidebar collapse state). Page-local list/filter state stays in the page via `ref`/`reactive`, not in a global store (see §9).

### 1.5 Module / Feature Structure

Each feature module under `src/features/<feature>/` is self-contained:

```
features/products/
├── components/        # Feature-specific components (ProductTable, ProductForm)
├── composables/        # useProducts, useProductForm
├── pages/               # ProductListPage, ProductFormPage, ProductDetailPage
├── schemas/             # productSchema.ts (Zod)
├── services/             # products.service.ts (API calls for this resource)
└── types.ts             # Product, ProductPayload types
```

This mirrors the 26-screen spec 1:1 — every feature folder maps to a section of the wireframe documentation (Products & Categories, Users, Transactions, Reports, POS, Auth/Shift).

### 1.6 Dependency Boundaries

```
pages/layouts  ──depends on──▶  features/*  ──depends on──▶  components/ui, composables, services
     │                                                              │
     └──────────────────────depends on────────────────────────────▶ stores (auth, ui, posCart)
```

Rules enforced by lint boundaries (see §21):

- `components/ui/*` (shared, generic UI primitives) must **never** import from `features/*`.
- `features/*` may import from `components/ui`, `composables`, `services`, `stores`, `router` — never from another feature's internal folders.
- `stores/*` may import from `services/*` and `types/*` — never from `components/*` or `pages/*`.

---

## 2. Technology Stack

| Concern | Choice | Justification |
| --- | --- | --- |
| Build tool | **Vite 5** | Required by project. Fast dev server, native ESM, first-class Vue plugin. |
| Framework | **Vue 3** (`<script setup>`, Composition API) | Required by project. Composition API fits the composable-driven architecture in §1. |
| Routing | **vue-router 4** | Official router; supports nested routes, route meta, navigation guards — all required for the role-gated navigation in §5. |
| State management | **Pinia** | Official Vue 3 state library, minimal boilerplate, TypeScript-friendly, devtools support. Used sparingly (§9), not for every piece of state. |
| HTTP client | **Axios** | Interceptor support (needed for auth headers + error normalization) is native and well-documented; fetch would require re-building this. |
| Form validation | **vee-validate + Zod** | Zod schemas double as the Domain layer's type source (`z.infer`) and runtime validation — avoids maintaining separate TypeScript types and validation rules. vee-validate integrates directly with Vue's reactivity for field-level error display. |
| Styling | **Tailwind CSS**, configured with the project's existing design tokens (colors, radii, spacing) as the Tailwind theme | The visual design system (colors, type scale, 4px/8px radius scale, spacing) is already fully specified from the approved prototype — Tailwind's config is used purely as a token-enforcement mechanism, not as a source of new design decisions. Avoids hand-rolling utility CSS while staying exactly on-spec. |
| Icons | **Inline SVG components** matching the outline-icon style already used in the prototype | No icon font/library needed for \~15 icons; keeps bundle small and avoids an icon set whose style doesn't match the approved outline icons. |
| Utility composables | **VueUse** (`useDebounceFn`, `useLocalStorage`, `onClickOutside`) | Widely adopted, tree-shakeable, removes the need to hand-write common composables (debounce, click-outside for dropdowns/modals). |
| Date/number formatting | **Native `Intl.NumberFormat` / `Intl.DateTimeFormat`** (`id-ID` locale for Rupiah formatting) | No dependency needed — the app only needs Rupiah currency formatting and simple date/time display, both native-`Intl` capable. |
| Testing | **Vitest** + **@vue/test-utils** (unit/component), **Playwright** (E2E) | Vitest shares Vite's config/transform pipeline (no separate Babel/webpack setup). Playwright covers the critical multi-page journeys in §20. |
| Linting/formatting | **ESLint** (`eslint-plugin-vue`) + **Prettier** | Industry standard; enforced in CI (§24). |

**Explicitly not used, and why:** a full component-kit library (Vuetify/PrimeVue/Element Plus/Quasar) is deliberately **not** adopted. The design system is already fully specified at the pixel level (colors, radii, spacing, typography, sidebar behavior) from the approved prototype; adopting a third-party kit would mean fighting its default styling to match spec, adding significant bundle weight for components (date pickers, complex tables) the MVP doesn't need. A small internal component library (`src/components/ui`) implementing exactly the \~15 primitives the 26 screens actually use (Button, Input, Select, Table, Badge, Modal, Toast, Tabs, Sidebar) is more practical and stays on-brand by construction.

---

## 3. Project Structure

```
posretail-frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── assets/
│   │   └── styles/
│   │       ├── tokens.css          # CSS custom properties (design tokens, mirrors Tailwind theme)
│   │       └── base.css            # Resets, base element styles
│   ├── router/
│   │   ├── index.js                 # Router instance, guards registration
│   │   └── routes.js                # Route table (see §5)
│   ├── layouts/
│   │   ├── AuthLayout.vue           # Centered, no sidebar — Login, Shift Open/Close, 403, 404
│   │   └── AppLayout.vue            # Sidebar + top bar shell — all authenticated app pages
│   ├── stores/
│   │   ├── auth.store.js            # Session, current user, role
│   │   ├── ui.store.js              # Sidebar collapsed state, toast queue
│   │   └── posCart.store.js         # Current Sale cart (POS feature, cross-component)
│   ├── services/
│   │   ├── http/
│   │   │   ├── httpClient.js        # Axios instance + interceptors
│   │   │   └── apiError.js          # Error normalization (AppError shape)
│   │   └── api/
│   │       ├── auth.service.js
│   │       ├── products.service.js
│   │       ├── categories.service.js
│   │       ├── transactions.service.js
│   │       ├── reports.service.js
│   │       ├── users.service.js
│   │       └── shifts.service.js
│   ├── composables/
│   │   ├── usePagination.js
│   │   ├── useDebouncedSearch.js
│   │   ├── useConfirmDialog.js
│   │   ├── useToast.js
│   │   └── useAsyncState.js          # Generic loading/error/data wrapper for one-off fetches
│   ├── components/
│   │   ├── ui/                       # Generic, feature-agnostic primitives
│   │   │   ├── AppButton.vue
│   │   │   ├── AppInput.vue
│   │   │   ├── AppSelect.vue
│   │   │   ├── AppTable.vue
│   │   │   ├── AppBadge.vue
│   │   │   ├── AppModal.vue
│   │   │   ├── AppToast.vue
│   │   │   ├── AppTabs.vue
│   │   │   ├── EmptyState.vue
│   │   │   └── ConfirmDialog.vue
│   │   └── layout/
│   │       ├── SidebarNav.vue
│   │       ├── TopBar.vue
│   │       └── UserMenu.vue
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/LoginPage.vue
│   │   │   └── components/LoginForm.vue
│   │   ├── shift/
│   │   │   ├── pages/ShiftOpenPage.vue
│   │   │   ├── pages/ShiftClosePage.vue
│   │   │   └── composables/useShift.js
│   │   ├── dashboard/
│   │   │   └── pages/DashboardPage.vue
│   │   ├── pos/
│   │   │   ├── pages/PosPage.vue
│   │   │   ├── pages/PaymentPage.vue
│   │   │   ├── pages/TransactionSuccessPage.vue
│   │   │   └── components/
│   │   │       ├── ProductTileGrid.vue
│   │   │       ├── CategoryChips.vue
│   │   │       └── CurrentSaleModal.vue
│   │   ├── products/
│   │   │   ├── pages/ProductListPage.vue
│   │   │   ├── pages/ProductFormPage.vue
│   │   │   ├── pages/ProductDetailPage.vue
│   │   │   ├── components/ProductTable.vue
│   │   │   ├── composables/useProducts.js
│   │   │   ├── composables/useProductForm.js
│   │   │   └── schemas/product.schema.js
│   │   ├── categories/
│   │   │   ├── pages/CategoryListPage.vue
│   │   │   ├── pages/CategoryFormPage.vue
│   │   │   ├── composables/useCategories.js
│   │   │   └── schemas/category.schema.js
│   │   ├── transactions/
│   │   │   ├── pages/TransactionListPage.vue
│   │   │   ├── pages/TransactionDetailPage.vue
│   │   │   └── composables/useTransactions.js
│   │   ├── reports/
│   │   │   ├── pages/ReportsPage.vue
│   │   │   └── composables/useReports.js
│   │   ├── users/
│   │   │   ├── pages/UserListPage.vue
│   │   │   ├── pages/UserFormPage.vue
│   │   │   ├── pages/UserDetailPage.vue
│   │   │   ├── composables/useUsers.js
│   │   │   └── schemas/user.schema.js
│   │   └── system/
│   │       ├── pages/ForbiddenPage.vue   # 403
│   │       └── pages/NotFoundPage.vue    # 404
│   ├── types/                            # Shared TS types (Role, Money, PaginatedResult<T>)
│   └── constants/
│       ├── roles.js                      # ROLE.ADMIN / MANAGER / CASHIER
│       └── permissions.js                # Route/action permission matrix (single source, §11)
├── tests/
│   ├── unit/
│   ├── component/
│   └── e2e/
├── .env.development
├── .env.staging
├── .env.production
├── index.html
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── package.json
```

### 3.1 Directory Responsibilities

| Directory | Responsibility |
| --- | --- |
| `layouts/` | Page chrome only. Two layouts total, matching the two visual modes already defined: gate screens (no sidebar) vs. app shell (sidebar + top bar). |
| `stores/` | Cross-page, long-lived state only (see §9 for the ownership rule). |
| `services/http/` | One Axios instance, one error-normalization module. Nothing feature-specific here. |
| `services/api/` | One file per backend resource. Each exports plain async functions (`getProducts`, `createProduct`) — no classes, no hidden state. |
| `composables/` | Cross-feature reusable logic (pagination, debounce, confirm dialog, toast). Feature-specific composables live inside the feature folder instead. |
| `components/ui/` | The internal design-system components (§2). Zero business logic. |
| `components/layout/` | Sidebar/TopBar — used by `AppLayout.vue` only. |
| `features/<name>/` | Everything specific to one business feature: its pages, its feature-only components, its composables, its Zod schema, its service (if not shared). |
| `types/`, `constants/` | Domain layer — framework-agnostic. |

### 3.2 File Naming Conventions

| Type | Convention | Example |
| --- | --- | --- |
| Components (any) | `PascalCase.vue` | `ProductTable.vue` |
| Pages | `PascalCase` + `Page` suffix | `ProductListPage.vue` |
| Composables | `camelCase` + `use` prefix | `useProducts.js` |
| Stores | `camelCase` + `.store.js` suffix | `auth.store.js` |
| Services | `camelCase` + `.service.js` suffix | `products.service.js` |
| Schemas | `camelCase` + `.schema.js` suffix | `product.schema.js` |
| Constants | `SCREAMING_SNAKE_CASE` for values, `camelCase.js` filename | `roles.js` exporting `ROLE.ADMIN` |

### 3.3 Shared vs. Feature-Specific Code

**Rule of three**: a component/composable starts inside the feature that needs it. It is only promoted to `src/components/ui` or `src/composables` once a **second, unrelated feature** needs the same behavior. This avoids a premature "shared" folder full of one-off abstractions (over-engineering guard from the project brief).

---

## 4. Application Bootstrap

### 4.1 `main.js`

```js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/tokens.css'
import './assets/styles/base.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

### 4.2 Initialization Order

1. **Pinia** is installed before the router, because navigation guards (§5) read from the auth store.
2. **Router** is installed; its guards run on the very first navigation, which triggers **session restoration** (§11.2) before any protected page mounts.
3. `app.mount('#app')` happens last — Vue does not render until router + store plugins are registered.

### 4.3 Plugins & Global Configuration

- No global component registration beyond what's auto-imported by Vite plugins (`unplugin-vue-components` is **not** used — components are explicitly imported per file; this keeps import boundaries in §1.6 enforceable by lint rules, which implicit auto-import would bypass).
- No global mixins (Composition API — none needed).
- Global error handler registered on `app.config.errorHandler` (§16.8) to catch render/lifecycle errors that escape component-level handling and report them via the toast system + console (and, in production, an error-reporting hook — see Open Dependency in §27).

### 4.4 Global Styles

- `tokens.css` defines every design token from the approved system as CSS custom properties (`--color-primary: #B71C1C`, `--radius-sm: 4px`, etc.) — this is the **single source of truth** for the visual tokens; Tailwind's config reads from the same values so the two never drift.
- `base.css` — element resets, base typography (`Roboto`, `Roboto Mono` for `.mono`), scrollbar/overscroll behavior, and the `env(safe-area-inset-*)` handling for mobile viewports (carried over from the validated prototype).

---

## 5. Routing Architecture

### 5.1 Route Hierarchy

```
/                       → redirect to /dashboard (or /login if unauthenticated)
/login                  → AuthLayout → LoginPage                        [public]
/shift/open             → AuthLayout → ShiftOpenPage                    [auth, cashier]
/shift/close             → AuthLayout → ShiftClosePage                   [auth, cashier]
/403                    → AuthLayout → ForbiddenPage                    [auth]
/404                    → AuthLayout → NotFoundPage                     [public — catch-all]

/  (AppLayout, all children require auth)
├── dashboard                            → DashboardPage                [admin, manager, cashier]
├── pos                                  → PosPage                      [admin, manager, cashier]
│   └── pos/payment                      → PaymentPage                  [admin, manager, cashier]
│   └── pos/success                      → TransactionSuccessPage       [admin, manager, cashier]
├── products                             → ProductListPage              [admin, manager]
│   ├── products/new                     → ProductFormPage (create)     [admin, manager]
│   ├── products/:id                     → ProductDetailPage            [admin, manager]
│   └── products/:id/edit                → ProductFormPage (edit)       [admin, manager]
├── categories                           → CategoryListPage             [admin, manager]
│   ├── categories/new                   → CategoryFormPage (create)    [admin, manager]
│   └── categories/:id/edit              → CategoryFormPage (edit)      [admin, manager]
├── transactions                         → TransactionListPage          [admin, manager, cashier*]
│   └── transactions/:id                 → TransactionDetailPage        [admin, manager, cashier*]
├── reports                              → ReportsPage                  [admin, manager]
└── users                                → UserListPage                 [admin]
    ├── users/new                        → UserFormPage (create)        [admin]
    ├── users/:id                        → UserDetailPage               [admin]
    └── users/:id/edit                   → UserFormPage (edit)          [admin]

/:pathMatch(.*)*        → redirect to /404
```

`cashier*` = Cashier role may access the route, but the page's data query is **scoped server-side** to that cashier's own records (§11.5) — this is a data-scoping rule, not a route-access rule, and is implemented inside the page's composable, not the router guard.

### 5.2 Public vs. Private Routes

- **Public:** `/login`, `/404` (a not-found page must be reachable without a session, otherwise an expired-session user hitting a stale bookmark gets a second, confusing redirect).
- **Private (requires valid session):** everything else, enforced by a global `beforeEach` guard (§5.6).

### 5.3 Nested Routes

`AppLayout` is a **layout route** with all authenticated pages as children, so the sidebar/top bar mount once and persist across navigations (no remount flicker). `pos`, `pos/payment`, `pos/success` are modeled as sibling routes under the same parent (not nested children of each other) because they are sequential steps of one flow, not a parent/detail relationship — this matches the page architecture in §7.

### 5.4 Dynamic Routes

`:id` params are used for Product/User/Transaction detail and edit routes. `:id` is always the backend resource identifier (type TBD — see §27); the frontend treats it as an opaque string/route param and never parses or derives meaning from its format.

### 5.5 Route Metadata

Every route declares `meta`:

```js
{
  path: '/products',
  name: 'products.list',
  component: () => import('@/features/products/pages/ProductListPage.vue'),
  meta: {
    requiresAuth: true,
    roles: ['admin', 'manager'],
    title: 'Products',
  },
}
```

`meta.title` feeds the top bar's page title (§6) and `document.title`, so this is defined once, at the route level, rather than duplicated inside each page component.

### 5.6 Navigation Guards

A single global guard handles both authentication and authorization, in this order:

```js
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // 1. Restore session on first navigation (see §11.2)
  if (!auth.initialized) await auth.restoreSession()

  // 2. Public routes always pass
  if (!to.meta.requiresAuth) return true

  // 3. No session → login, preserving intended destination
  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 4. Session exists, but role not permitted → 403 (never a blank/broken page)
  if (to.meta.roles && !to.meta.roles.includes(auth.user.role)) {
    return { name: 'forbidden' }
  }

  return true
})
```

- **Authentication guard**: step 3.
- **Authorization guard**: step 4, driven by the single permission matrix in `constants/permissions.js` (§11.4) — never hand-written per route, to avoid the matrix drifting out of sync across files.
- **404 handling**: the catch-all route (`/:pathMatch(.*)*`) redirects to `/404`, which is itself a `meta.requiresAuth: false` route so it never gets caught in an auth redirect loop.
- **403 handling**: reachable only via the guard's redirect above (matching the "no dead-end, no blank screen" rule already established for this project) — there is no scenario where a restricted page silently fails to render.

### 5.7 Redirect Behavior

| Scenario | Redirect |
| --- | --- |
| Unauthenticated user hits any private route | `/login?redirect=<original path>` |
| Login succeeds | `redirect` query param if present, else role default (`/shift/open` for Cashier, `/dashboard` for Admin/Manager) |
| Authenticated but wrong role | `/403` |
| Unknown path | `/404` |
| Cashier logs in but hasn't opened a shift | `/shift/open` (enforced by a secondary guard scoped to POS/Dashboard routes — see §11.6) |

---

## 6. Layout & Navigation Architecture

### 6.1 Application Layouts

Two layouts, matching the two visual modes already established in the prototype:

- **`AuthLayout.vue`** — centered card, no sidebar/top bar. Used by Login, Shift Open, Shift Close, 403, 404.
- **`AppLayout.vue`** — persistent sidebar (240px/64px) + sticky top bar + `<router-view>` content area. Used by every other route.

### 6.2 Header (Top Bar)

Fixed height (60px), contains:

- Current page title, sourced from `route.meta.title` (§5.5) — never hardcoded per page.
- User area: avatar (initials) + full name only, per the approved simplification (no role pill, no in-session role switcher — role is fixed for the session and only changes via logout/login).

### 6.3 Sidebar

- `SidebarNav.vue` renders items from a single static config array (`constants/navigation.js`), each entry `{ routeName, label, icon, roles }`.
- Visibility is **filtered by role at render time** using the same `roles` array pattern as route `meta.roles` — both read from `constants/permissions.js` so the sidebar and the router guard can never disagree about who can see what.
- **Expand/collapse**: boolean state lives in `ui.store.js` (persisted to `localStorage` via VueUse's `useLocalStorage`, so the preference survives a refresh). Width transitions via CSS (`240px` ↔ `64px`), matching the validated prototype exactly.
- **Active state**: derived from `route.name`/`route.path` (via `<router-link>`'s automatic `router-link-active` class, styled to the approved active-state treatment), not tracked in separate component state.

### 6.4 Breadcrumb

Not part of the approved 26-screen spec — **not implemented**. The top bar's single page title plus the sidebar's active-state highlight is the full navigational context defined for this MVP (introducing breadcrumbs would be scope creep beyond what was designed and prototyped).

### 6.5 Navigation Menu (Sidebar Items)

| Item | Route | Roles |
| --- | --- | --- |
| Dashboard | `dashboard` | admin, manager, cashier |
| POS / Sales | `pos` | admin, manager, cashier |
| Products | `products.list` | admin, manager |
| Transactions | `transactions.list` | admin, manager, cashier |
| Reports | `reports` | admin, manager |
| Users | `users.list` | admin |

("Categories" is not a separate sidebar item — it is a tab inside the Products page, per the approved navigation structure; see §7.)

### 6.6 Responsive Navigation

- **Desktop (≥1200px):** sidebar always visible, expand/collapse toggle available.
- **Tablet (768–1199px):** sidebar defaults to collapsed (64px, icon-only); toggle still available.
- **Mobile (\<768px):** sidebar becomes an off-canvas drawer (hidden by default, opened via the top bar's menu button, closes on route change or outside click via VueUse's `onClickOutside`).

### 6.7 Permission-Based Navigation Visibility

Sidebar items and route guards both consume `constants/permissions.js` — this is the single authorization source described in §11.4. A role that cannot access a page never sees its sidebar entry (not merely a disabled/greyed link).

---

## 7. Page Architecture

### 7.1 Complete Page Inventory

All 26 pages map 1:1 to the approved wireframe specification. Table format: **Page → Route → Components → Primary API dependency → States handled**.

| Page | Route name | Key components | API dependency | States |
| --- | --- | --- | --- | --- |
| Login | `login` | `LoginForm` | `auth.service` → `login()` | default, submitting, error |
| Shift Open | `shift.open` | — | `shifts.service` → `openShift()` | default, submitting, error |
| Shift Close | `shift.close` | — | `shifts.service` → `closeShift()`, `getShiftSummary()` | loading, default, submitting |
| Dashboard | `dashboard` | `AppTable` (×2), stat cards | `reports.service` → `getDashboardSummary()` | loading, empty, populated |
| POS / Sales | `pos` | `ProductTileGrid`, `CategoryChips`, `CurrentSaleModal` | `products.service` → `getProducts()` (catalog) | loading, empty-search, populated |
| Payment | `pos.payment` | — | `transactions.service` → `createTransaction()` | default, insufficient-funds, submitting |
| Transaction Success | `pos.success` | — | (uses result of previous create call) | default only |
| Product List | `products.list` | `ProductTable`, `AppTabs` | `products.service` → `getProducts()` | loading, empty, populated |
| Add/Edit Product | `products.new` / `products.edit` | Form fields | `products.service` → `create/update/getById` | loading (edit), validating, submitting |
| Product Detail | `products.detail` | — | `products.service` → `getById()` | loading, populated |
| Delete Product | modal on List | `ConfirmDialog` | `products.service` → `remove()` | confirming, submitting |
| Category List | `categories.list` | Table, `AppTabs` | `categories.service` → `getCategories()` | loading, empty, populated |
| Add/Edit Category | `categories.new` / `.edit` | Form field | `categories.service` | validating, submitting |
| Delete Category | modal on List | `ConfirmDialog` | `categories.service` → `remove()` | confirming, submitting |
| Transaction History | `transactions.list` | `AppTable`, filters | `transactions.service` → `getTransactions()` | loading, empty, populated |
| Transaction Detail | `transactions.detail` | — | `transactions.service` → `getById()` | loading, populated |
| Reports | `reports` | Stat cards, table | `reports.service` → `getReports(range)` | loading, empty, populated |
| User List | `users.list` | `AppTable` | `users.service` → `getUsers()` | loading, empty, populated |
| Add/Edit User | `users.new` / `.edit` | Form fields | `users.service` | validating, submitting |
| User Detail | `users.detail` | — | `users.service` → `getById()` | loading, populated |
| Deactivate User | modal on List | `ConfirmDialog` | `users.service` → `deactivate()` | confirming, submitting |
| 403 | `forbidden` | — | none | default only |
| 404 | `not-found` | — | none | default only |

### 7.2 Page Responsibilities

A page component (`*Page.vue`) is responsible for, and only for:

1. Calling the feature composable to fetch/mutate data.
2. Mapping composable state (`loading`, `error`, `data`) to the correct UI state (§7.5).
3. Wiring user actions (button clicks, form submit) to composable methods.
4. Programmatic navigation on success (e.g., after Save → `router.push({ name: 'products.list' })`).

A page **never** contains raw `axios` calls, business validation logic, or formatting logic beyond simple display formatting — those belong to services, schemas, and small presentational components respectively.

### 7.3 Page-to-Route Mapping

Covered fully in §5.1 — every route name above corresponds to exactly one page component; there are no shared "mega-pages" handling multiple routes via internal `if` branching.

### 7.4 Page-to-Component Mapping

Each CRUD list page follows the same composition: `AppTable` (generic) + a feature-specific column/row-action configuration passed as props, **not** a feature-specific table component re-implementing table markup (avoids the duplicated-table-markup anti-pattern across Products/Categories/Transactions/Users).

### 7.5 Loading / Empty / Error / Success States

Every data-bearing page implements the same four-state contract, driven by `useAsyncState`/feature composables:

| State | UI |
| --- | --- |
| **Loading** | Skeleton rows (table pages) or a centered spinner (detail pages) — never a blank white screen. |
| **Empty** | `EmptyState` component: icon + message ("No products found") + a relevant primary action where applicable ("Add Product"). |
| **Error** | Inline error banner with a retry action, using the normalized error message from §16. |
| **Success/Populated** | The real content. |

---

## 8. Component Architecture

### 8.1 Shared Components (`components/ui/`)

| Component | Purpose |
| --- | --- |
| `AppButton` | Primary/secondary/text/danger variants, matches token-driven colors, loading-spinner slot. |
| `AppInput`, `AppSelect` | Form fields with label, error-message slot, `v-model` support — designed to plug directly into vee-validate's `Field`. |
| `AppTable` | Generic data table: `columns` prop (label, key, align, formatter), `rows` prop, optional `rowActions` slot, built-in loading/empty rendering. |
| `AppBadge` | Status pill (\`variant="success" |
| `AppModal` | Teleport-based overlay + dialog, used as the base for `ConfirmDialog` and `CurrentSaleModal`. |
| `AppToast` | Toast queue renderer, driven by `useToast()`. |
| `AppTabs` | Used for the Products/Categories tab pattern. |
| `EmptyState` | Icon + message + optional action button. |
| `ConfirmDialog` | Built on `AppModal`; used for every Delete/Deactivate confirmation across Products, Categories, and Users — one component, parameterized by title/message/confirm-label, not duplicated per feature. |

### 8.2 Layout Components (`components/layout/`)

`SidebarNav`, `TopBar`, `UserMenu` — consumed only by `AppLayout.vue`.

### 8.3 Feature Components

Live inside their feature folder because they are not reused elsewhere: `ProductTable` (thin wrapper configuring `AppTable` for the Product columns), `ProductTileGrid`, `CategoryChips`, `CurrentSaleModal` (POS feature only).

### 8.4 Reusable Form Components

Add/Edit forms for Product, Category, and User each use `AppInput`/`AppSelect` directly inside a feature-specific form component (`ProductForm`, not a generic "EntityForm") — the field sets genuinely differ per entity, so a shared abstraction here would violate the "no premature abstraction" rule in §1.2. What **is** shared is the validation/submit-state pattern via the `useEntityForm`-style composable convention (§12.1).

### 8.5 Table / Data-Grid Components

See §14 — implemented once as `AppTable`, configured per feature.

### 8.6 Dialog / Modal Components

`AppModal` (base) → `ConfirmDialog` (Delete/Deactivate) and `CurrentSaleModal` (POS). No other modals exist in the approved 26-screen spec.

### 8.7 Component Responsibilities

- **UI components**: props in, events out. No store access, no API calls.
- **Feature components**: may use feature composables (which internally use stores/services), but do not call `axios`/services directly.
- **Layout components**: may read `ui.store` and `auth.store` directly (sidebar state, current user) since they are structurally single-instance, app-wide components, not reusable across features.

### 8.8 Props / Emits / Slots Conventions

- Props: typed with `defineProps` (TS or JSDoc), always declaring `required`/`default` explicitly — no implicit `undefined` props.
- Emits: declared with `defineEmits`, named as past-tense events for completed actions (`@saved`, `@cancelled`, `@deleted`) — not `@save-click` (name the outcome, not the DOM event).
- Slots: named slots used for `AppTable` row-actions and `AppModal` header/body/footer regions; default slot reserved for the primary content only.

### 8.9 Component Reuse Strategy

Reuse happens through **composition** (`AppTable` + column config; `AppModal` + `ConfirmDialog`), not through **configuration explosion** (a single "SuperTable" component with 40 boolean props). If a table needs behavior `AppTable` doesn't support, the feature wraps it or composes around it — it does not add a one-off prop to the shared component for a single caller.

---

## 9. State Management

### 9.1 State Ownership Rules

| State type | Owner | Example |
| --- | --- | --- |
| **Global state** | Pinia store | Current user/session, sidebar collapsed flag, toast queue |
| **Feature state (cross-page within one feature)** | Pinia store, scoped to the feature | POS current-sale cart (built in `PosPage`, consumed in `PaymentPage` and `TransactionSuccessPage`) |
| **Server state (list/detail data for one page)** | Local `ref`/`reactive` inside a feature composable, instantiated per page visit | Product list rows, filters, pagination cursor |
| **Form state** | Local to the form component, via vee-validate's form context | Field values, dirty flags, validation errors |
| **Session/auth state** | `auth.store.js` | JWT/session token (TBD, §27), current user object, role |

### 9.2 When to Use Pinia

Use a Pinia store **only** when state must:

1. Survive a route change (auth session, POS cart across `pos` → `pos/payment` → `pos/success`), **or**
2. Be read/written by more than one component that isn't a parent/child (sidebar collapsed state read by both `SidebarNav` and a mobile drawer toggle in `TopBar`).

### 9.3 When Local Component State Is Preferable

Any page's list/filter/pagination state (Product List's search text, category filter, current page) is **not** put in Pinia — it lives in that page's composable instance (`useProducts()` called fresh each time `ProductListPage` mounts). Reasoning: this state has no reason to persist once the user navigates away, and putting every list's filter state in a global store would cause exactly the kind of unbounded store growth the project brief warns against ("avoid unnecessary complexity").

### 9.4 Defined Stores

```
stores/
├── auth.store.js       # user, role, token, isAuthenticated, initialized
├── ui.store.js          # sidebarCollapsed, toasts[]
└── posCart.store.js     # items[], discount, subtotal/total getters, clear()
```

No `products.store.js`, `users.store.js`, etc. exist — those are server state, owned by their feature's composable, not by Pinia (§9.1, §9.3).

---

## 10. API Integration

### 10.1 API Client Architecture

```
services/http/httpClient.js   →  one configured Axios instance, imported by every services/api/*.service.js
services/http/apiError.js     →  normalizes any Axios error into a consistent { status, message, fieldErrors } shape
services/api/<resource>.service.js  →  thin functions per resource, each returning already-typed, already-unwrapped data
```

### 10.2 Axios Configuration

```js
// services/http/httpClient.js
import axios from 'axios'

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
})
```

### 10.3 Base URL & Environment Configuration

`VITE_API_BASE_URL` is defined per environment file (§22) — never hardcoded in a service file.

### 10.4 Request Interceptor

```js
httpClient.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})
```

(Exact token type — Bearer JWT vs. session cookie — is an **open dependency**, §27. This spec assumes Bearer-token auth as the default, most-common pattern; if the backend instead uses an HttpOnly session cookie, this interceptor is removed entirely and `withCredentials: true` is set on the Axios instance instead — a one-file change, isolated by this architecture.)

### 10.5 Response Interceptor & Error Normalization

```js
httpClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normalizeApiError(error))
)
```

`normalizeApiError` (§16.1) converts network errors, timeouts, and any HTTP status into one consistent shape consumed by every composable's `catch` block — no component ever inspects a raw Axios error object.

### 10.6 Authentication Headers

Handled entirely by the request interceptor above — individual service functions never set `Authorization` manually.

### 10.7 Error Normalization

See §16.1 for the full `AppError` shape and mapping table.

### 10.8 Timeout Handling

Global 15s timeout (`httpClient` config above). A timeout is normalized to the same `AppError` shape with `status: 'timeout'`, surfaced via toast with a retry affordance — never a silent hang.

### 10.9 API Service Organization

One file per backend resource (`products.service.js`, `users.service.js`, etc.), each exporting plain functions:

```js
// services/api/products.service.js
import httpClient from '@/services/http/httpClient'

export const getProducts = (params) => httpClient.get('/products', { params })
export const getProductById = (id) => httpClient.get(`/products/${id}`)
export const createProduct = (payload) => httpClient.post('/products', payload)
export const updateProduct = (id, payload) => httpClient.put(`/products/${id}`, payload)
export const deleteProduct = (id) => httpClient.delete(`/products/${id}`)
```

(Exact endpoint paths, request/response shapes, and pagination query-param names are **unconfirmed** — see §27. The above illustrates the *pattern*, not the final contract.)

### 10.10 Request Cancellation

List pages that re-fetch on every keystroke (debounced search, §18) use `AbortController`, cancelling the in-flight request when a new one is issued — implemented once inside `useDebouncedSearch` (§3 composables), not re-implemented per feature.

---

## 11. Authentication & Authorization

### 11.1 Login / Logout Flow

1. `LoginPage` collects username/password, calls `auth.service.login()`.
2. On success, `auth.store` stores the token + user object (role, name), then the router navigates to the role's default landing route (§5.7).
3. Logout clears the store and redirects to `/login`. For a Cashier with an open shift, logout first routes through **Shift Close** (matching the prototype's behavior) before the session actually ends.

### 11.2 Session Restoration

On hard refresh, `auth.store.restoreSession()` runs once (guarded by `initialized` flag, §5.6) before the first route resolves:

- If a persisted token exists (storage mechanism TBD — see §27), validate it against a `getCurrentUser()`/`me` endpoint.
- If valid, populate the store and proceed.
- If invalid/expired, clear it and treat the user as unauthenticated (→ redirected to Login by the guard).

### 11.3 Token / Session Handling

Handled centrally by `auth.store` + the Axios request interceptor (§10.4). No component or feature ever reads the token directly.

### 11.4 Protected Routes & Permission Checks

Single source of truth: `constants/permissions.js`.

```js
// constants/permissions.js
export const ROLE = { ADMIN: 'admin', MANAGER: 'manager', CASHIER: 'cashier' }

export const ROUTE_PERMISSIONS = {
  dashboard: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  pos: [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  'products.list': [ROLE.ADMIN, ROLE.MANAGER],
  'transactions.list': [ROLE.ADMIN, ROLE.MANAGER, ROLE.CASHIER],
  reports: [ROLE.ADMIN, ROLE.MANAGER],
  'users.list': [ROLE.ADMIN],
}
```

Both `route.meta.roles` (§5.5) and `SidebarNav`'s filtering (§6.7) import from this same object — there is exactly one place the Admin/Manager/Cashier permission matrix is defined.

### 11.5 Role-Based Access & Action-Level Permissions

Route-level access (can this role open this page at all) is enforced by the router guard. **Action-level** permissions (e.g., only Admin can Deactivate a user; a Cashier's Transaction List is scoped to their own records) are enforced *inside* the relevant composable/service call — e.g., `useTransactions()` automatically includes the current user's ID as a filter when `auth.user.role === ROLE.CASHIER`, rather than the backend trusting a client-supplied "show all" flag.

### 11.6 Shift Gate (Cashier-Specific)

A secondary guard, scoped only to routes a Cashier would use to transact (`pos`, `dashboard`), checks a `hasOpenShift` flag on the auth/shift store; if false and `auth.user.role === ROLE.CASHIER`, redirect to `/shift/open`. Admin/Manager roles are unaffected (no shift concept applies to them).

### 11.7 Frontend vs. Backend Authorization Responsibilities

**This is a hard boundary, stated explicitly:** every guard, sidebar filter, and disabled button described in this document is a **UX convenience** — it prevents an authorized-but-shouldn't-see-this user from *stumbling into* a page, and it prevents obviously invalid requests from being sent. It is **not** a security boundary. The backend **must** independently re-validate the user's role and ownership (e.g., a Cashier requesting `/transactions?cashierId=someone-else`) on every request. The frontend cannot be trusted to enforce authorization, because all frontend code and network calls are inspectable/replayable by the end user. This is called out again in §17.1.

---

## 12. Forms & Validation

### 12.1 Form Architecture

Every Create/Edit form follows the same composable convention: `use<Entity>Form(id?)`, which:

1. If `id` is provided (edit mode), fetches the existing entity and pre-fills the form.
2. Wraps a vee-validate `useForm()` instance, bound to the entity's Zod schema via `@vee-validate/zod`.
3. Exposes `values`, `errors`, `isSubmitting`, `isDirty`, and a `submit()` method that calls the correct service function (`create` vs `update`) based on mode.

### 12.2 Client-Side Validation

Defined once per entity as a Zod schema (`schemas/product.schema.js`), matching exactly the required-field rules already specified in the wireframe documentation (e.g., Product: name/SKU/price/stock required, price > 0, stock ≥ 0):

```js
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1),
  unit: z.string().optional(),
  price: z.number().positive('Enter a valid price'),
  cost: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative('Enter a valid stock quantity'),
})
```

### 12.3 Server-Side Validation & Error Mapping

If the backend returns field-level validation errors (shape TBD, §27), `apiError.js` normalizes them into a `fieldErrors: { fieldName: message }` map, which the form component feeds into vee-validate's `setErrors()` — so a backend-rejected value (e.g., a duplicate SKU/username the client couldn't know about in advance) surfaces on the exact same field, using the exact same error-message styling, as a client-side validation failure.

### 12.4 Create / Edit Patterns

One form component per entity handles both modes (`ProductForm` used by both `products.new` and `products.edit` routes), branching only on whether an `id` prop/param is present — matching the approved wireframe spec, which explicitly defines Add and Edit as the *same structural layout* with the difference being pre-filled values and the page heading/subtitle.

### 12.5 Dirty State

`isDirty` (from vee-validate) governs the Cancel button: if the form is untouched, Cancel navigates back immediately; if dirty, a confirmation (`ConfirmDialog`, "Discard changes?") is shown first. *(This is a sensible, low-cost UX safeguard consistent with the approved simplicity principle — flagged here as an addition beyond what the wireframes explicitly drew, for product sign-off rather than silently introduced.)*

### 12.6 Submit State

`isSubmitting` disables the Save button and shows a loading affordance for the duration of the API call, preventing double-submission — the same pattern for every entity form, implemented once in the `use<Entity>Form` convention.

### 12.7 Reset / Cancel Behavior

- **Add mode Cancel** → navigate back to the list, no confirmation needed (nothing entered matters).
- **Edit mode Cancel** → per §12.5, confirm if dirty.
- **Reset** (not in the approved spec as a separate button) — not implemented; Cancel + re-opening the form achieves the same result without adding an extra control beyond what was designed.

---

## 13. CRUD Architecture

### 13.1 The Shared Pattern

Products, Categories, and Users each follow the identical CRUD shape already defined in the wireframe spec's CRUD coverage matrix:

```
List → Add → Save → List
List → row → Edit → Save/Cancel → List
List → row → Delete/Deactivate → Confirm → List
```

This is implemented as a **composable convention**, not a shared generic class (per §1.2's over-engineering guard — Users' "Deactivate instead of Delete" is a real behavioral difference, not just a label change, so a rigid shared abstraction would need an escape hatch anyway).

```js
// features/products/composables/useProducts.js
export function useProducts() {
  const rows = ref([])
  const loading = ref(false)
  const error = ref(null)
  const { page, pageSize, total, setTotal } = usePagination()
  const filters = reactive({ search: '', category: '' })

  async function fetchProducts() { /* loading/error/rows wiring around products.service.getProducts */ }
  async function removeProduct(id) { /* calls service, then refetches or optimistically removes row */ }

  return { rows, loading, error, filters, page, pageSize, total, fetchProducts, removeProduct }
}
```

### 13.2 List / Search / Filter / Pagination

- **Search**: debounced text input (§18.5), triggers a re-fetch with the search term as a query param.
- **Filter**: category dropdown (Products), role dropdown (Users), date range + cashier (Transactions) — each an additional reactive param merged into the same fetch call.
- **Pagination**: `usePagination()` composable provides `page`/`pageSize`/`total` and a `goToPage()` method; actual page-slicing happens server-side (§14.1) — the frontend never paginates a full dataset client-side.

### 13.3 Create

Form page → schema validation → service `create()` call → on success, toast + navigate to List (row visible on next fetch) — never navigate to List *without* waiting for the create call to resolve.

### 13.4 View (Detail)

Read-only page, fetched by `id` on mount; offers Edit/Delete (or Deactivate) actions that navigate to the corresponding route/modal.

### 13.5 Edit

Same form component as Create, pre-filled (§12.4); on success, toast + navigate to List.

### 13.6 Delete / Deactivate

`ConfirmDialog` (shared component, §8.1) opens with the specific entity's name interpolated into the message; confirming calls the service's `remove()`/`deactivate()` and closes the dialog, refetching the list.

### 13.7 Success / Error Handling

Every mutation (create/update/delete) follows the same result handling: success → toast + navigate/refresh; failure → toast with the normalized error message (§16), dialog/form stays open so the user doesn't lose their input.

### 13.8 Refresh / Invalidation Strategy

No client-side cache layer (no TanStack Query / SWR) is introduced for this MVP — each page's composable fetches fresh data on mount, and any successful mutation on that page triggers an explicit refetch of the current list. This is a deliberate simplicity choice: the data volumes and concurrent-user characteristics of a single-store MVP POS do not yet justify a caching layer's complexity, and adding one prematurely would violate the project's explicit over-engineering guard. **Revisit if/when** multiple concurrent terminals writing to the same product stock becomes a real requirement (see §27).

---

## 14. Table / Data Grid Architecture

### 14.1 Server-Side Pagination, Sorting, Filtering

`AppTable` is presentation-only — it renders whatever `rows` it's given and emits events (`@page-change`, `@sort-change`) for the parent composable to act on. All actual pagination/sorting/filtering logic sends new query params to the backend and re-fetches; `AppTable` never slices or sorts an array client-side. This keeps behavior consistent regardless of dataset size and matches how the backend will own the source of truth for ordering.

### 14.2 Search

Each list page's search input feeds into the page's composable filters (§13.2), debounced (§18.5).

### 14.3 Column Configuration

```js
const columns = [
  { key: 'name', label: 'Product', align: 'left' },
  { key: 'sku', label: 'SKU', align: 'left', mono: true },
  { key: 'category', label: 'Category', align: 'left' },
  { key: 'price', label: 'Price', align: 'right', mono: true, formatter: formatRupiah },
  { key: 'stock', label: 'Stock', align: 'right', mono: true },
  { key: 'status', label: 'Status', align: 'left', component: 'AppBadge' },
]
```

Declared per feature (`ProductTable` passes this into `AppTable`), keeping `AppTable` itself entity-agnostic.

### 14.4 Row Actions

Passed as a named slot (`#row-actions="{ row }"`) so each feature decides its own action set (Edit+Delete for Products/Categories; Edit+Deactivate for Users) without `AppTable` needing to know about entities at all.

### 14.5 Empty / Loading / Error States

Built into `AppTable` directly (skeleton rows while `loading`, `EmptyState` row-spanning message when `rows.length === 0` and not loading, error banner row when `error` is set) — every list page gets these states for free, correctly, without reimplementing them.

### 14.6 Responsive Behavior

Tables scroll horizontally within their card container on narrow viewports (`overflow-x: auto` on the table wrapper) rather than reflowing into a card-list — consistent with the dense, tabular, "cashier tool not a marketing site" visual direction already established.

---

## 15. UI/UX Implementation

This section is deliberately short: **the design system, screens, and interaction patterns are already fully specified** by the approved wireframe documentation and the validated clickable prototype. This spec's job is to say *how* that design is implemented in Vue/Tailwind, not to redefine it.

### 15.1 Design System → Tailwind Theme Mapping

```js
// tailwind.config.js (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#B71C1C', hover: '#7F0000', tint: '#FDECEA' },
        danger: '#C62828',
        surface: '#FFFFFF',
        canvas: '#F6F5F4',
        ink: { DEFAULT: '#1C1B1F', soft: '#5F6368' },
        success: { DEFAULT: '#2E7D32', bg: '#E8F5E9' },
        warning: { DEFAULT: '#B26A00', bg: '#FFF3E0' },
      },
      borderRadius: { sm: '4px', md: '8px' },
      fontFamily: { sans: ['Roboto', 'sans-serif'], mono: ['Roboto Mono', 'monospace'] },
    },
  },
}
```

### 15.2 Typography, Colors, Spacing

Consumed exclusively via Tailwind utility classes generated from the theme above (`text-ink`, `bg-primary`, `font-mono`) — no ad hoc hex values or pixel values in component `<style>` blocks. A lint rule (`stylelint` on any raw hex outside `tailwind.config.js`) is recommended to enforce this in CI (§21.11).

### 15.3 Components

All 15 `components/ui` primitives (§8.1) are the single implementation of every visual pattern (buttons, badges, inputs, tables, modals) — no page hand-rolls its own button or badge styling.

### 15.4 Responsive Behavior

Breakpoints match §6.6 (sidebar) and are otherwise Tailwind's default scale (`sm`/`md`/`lg`/`xl`), applied only where the approved prototype defines responsive behavior (sidebar, table overflow, POS grid column count) — not applied speculatively to screens with no defined responsive spec.

### 15.5 Interaction Patterns

Hover/focus/active states, the 240px/64px sidebar transition, modal open/close, and toast timing all match the validated prototype's behavior exactly (same durations, same easing where specified).

### 15.6 Loading / Empty / Error / Success States

Standardized per §7.5 and §14.5 — implemented once, reused everywhere, never redesigned per screen.

**Explicit instruction carried forward:** no new screens, components, or visual patterns are introduced beyond what the approved wireframes and prototype define. Where an implementation detail is genuinely undefined by those sources (e.g., exact skeleton-loader animation), the simplest possible option consistent with the existing "no decorative excess" visual language is used, not a novel design decision.

---

## 16. Error Handling

### 16.1 Normalized Error Shape

```ts
interface AppError {
  status: 'network' | 'timeout' | 'validation' | 'auth' | 'forbidden' | 'not_found' | 'server' | 'unknown'
  message: string          // user-facing, already safe to display
  fieldErrors?: Record<string, string>
  raw?: unknown            // original error, logged but never shown to the user
}
```

Every error a component ever sees has already passed through `normalizeApiError()` (§10.5) into this shape.

### 16.2 HTTP Error Handling

| HTTP status | Normalized `status` | Handling |
| --- | --- | --- |
| 400 / 422 | `validation` | Mapped to `fieldErrors`, shown inline on the form (§12.3) |
| 401 | `auth` | Auth store cleared, redirect to `/login` |
| 403 | `forbidden` | Toast + redirect to `/403` (route-level) or inline message (action-level, e.g., a button that shouldn't have been clickable) |
| 404 | `not_found` | Page-level: redirect to `/404`; row-level (e.g., record deleted by someone else): toast + refresh list |
| 5xx | `server` | Toast: "Something went wrong. Please try again." + retry affordance |

### 16.3 Validation Errors

Handled per §12.3 — field-level, non-blocking, form stays open.

### 16.4 Authentication Errors

A 401 on **any** request (not just login) triggers an automatic logout + redirect, since it means the session is no longer valid — this is handled once, in the response interceptor, not per-caller.

### 16.5 Authorization Errors

See 403 row above — distinguished from 401 because the user *is* authenticated, just not permitted for this specific action/resource.

### 16.6 Network Errors

No response received at all (offline, DNS failure) → `status: 'network'`, message: "Can't reach the server. Check your connection." — distinct wording from a timeout or a 5xx, since the likely user fix differs.

### 16.7 Timeout Errors

See §10.8.

### 16.8 Unexpected (Uncaught) Errors

`app.config.errorHandler` (§4.3) catches anything that escapes a component's own try/catch (render errors, lifecycle-hook throws) — logs it and shows a generic toast, rather than a white screen of death.

### 16.9 User-Facing Error Messages

Always plain language, never a raw stack trace or backend error string (which may leak implementation detail) — `raw` is logged to the console (dev) / error-reporting hook (prod, TBD §27) but `message` shown to the user is always one of this spec's own controlled strings or a backend-supplied, already-safe validation message.

### 16.10 Global Error Handling

Toasts are the single, consistent surface for all non-field-level errors across the app — no page implements its own ad hoc error banner styling.

---

## 17. Security

### 17.1 Frontend Security Limitations (stated first, deliberately)

As established in §11.7: **the frontend enforces nothing that the backend does not also independently enforce.** Route guards, disabled buttons, and hidden sidebar items are UX, not security. This section describes best-effort frontend hardening, not a substitute for backend authorization.

### 17.2 Authentication Security

- Credentials are submitted over HTTPS only (enforced at the hosting/deployment level, §23).
- No password or token is ever written to `console.log`, even in development.

### 17.3 Token / Session Security

- If Bearer-token auth is used (§10.4's default assumption): store the token in memory (Pinia store) as the primary copy; if persistence across refresh is required, use `localStorage` with the explicit understanding that this is vulnerable to XSS-based token theft, mitigated by §17.4's XSS controls. If the backend instead supports HttpOnly session cookies, prefer that — it is strictly more secure against token exfiltration and removes the need for client-side token storage entirely. **This decision requires backend confirmation** (§27).
- Token expiration is handled reactively (a 401 triggers logout, §16.4) rather than the frontend attempting to predict/pre-empt expiry, unless the backend issues a refresh token (in which case a silent-refresh flow is added to the response interceptor — TBD pending backend confirmation, §27).

### 17.4 XSS Prevention

- Vue's default template interpolation (`{{ }}`) escapes all dynamic content automatically — `v-html` is **not used anywhere** in this application; no screen in the approved spec requires rendering raw HTML.
- Any user-entered text (product names, category names) is rendered exclusively through standard interpolation.

### 17.5 Sensitive Data Handling

- Passwords are never stored in Pinia/localStorage beyond the moment of submission (cleared from the form's local state immediately after the request fires).
- No sensitive data (tokens, PII) is put in the URL (query params), since URLs are logged by browsers, proxies, and analytics.

### 17.6 Secure API Communication

All API calls go over HTTPS in every environment beyond local development (enforced by `VITE_API_BASE_URL` per environment, §22).

### 17.7 Permission Handling

Centralized (§11.4) — a single permissions map, not scattered role checks (`if (user.role === 'admin')`) throughout components, which would be both a maintainability risk and a security-review risk (harder to audit correctness when the same rule is expressed in ten places).

### 17.8 Environment Variable Security

Only `VITE_`-prefixed variables are exposed to client code (Vite's built-in behavior) — no secret, API key, or credential is ever placed in a `VITE_*` variable, since anything with that prefix ships in the public JS bundle. Any genuinely secret value belongs on the backend, never in this frontend's environment configuration.

---

## 18. Performance

### 18.1 Lazy-Loaded Routes

Every route's `component` is a dynamic `import()` (already shown in §5.5), so Vite code-splits each page into its own chunk — the initial bundle only contains the shell (layouts, router, Pinia) plus whichever page the user lands on.

### 18.2 Code Splitting

Beyond route-level splitting, no manual chunk configuration is added preemptively — Vite/Rollup's default heuristics are sufficient for an app this size. Revisit only if a real bundle-analysis finding justifies it (avoids speculative optimization).

### 18.3 Bundle Optimization

- Tree-shakeable dependencies only (VueUse, Zod, vee-validate all support this natively).
- No moment.js-style heavy date library — native `Intl` (§2) avoids the bundle cost entirely.
- SVG icons inlined as components (§2) rather than an icon-font (which loads the entire glyph set regardless of usage).

### 18.4 API Optimization

Requests only include the fields/params actually needed (e.g., list endpoints request paginated, filtered data — never "fetch everything and filter client-side").

### 18.5 Debounced Search

`useDebouncedSearch` (built on VueUse's `useDebounceFn`, \~300ms) wraps every list page's search input, combined with request cancellation (§10.10) so a fast typist never triggers a pile-up of in-flight requests.

### 18.6 Pagination

Server-side only (§14.1) — bounds both payload size and DOM node count per page render.

### 18.7 Caching

No client-side data cache for this MVP (§13.8's deliberate simplicity decision). Static assets (JS/CSS chunks, fonts) are cached via standard Vite production hashing + long-lived cache headers at the hosting layer (§23).

### 18.8 Avoiding Redundant Requests

- In-flight request de-duplication isn't separately implemented (no caching layer to de-dupe against) — mitigated instead by disabling the triggering control (e.g., Save button) during `isSubmitting`/`loading`, which prevents the user-driven cause of most redundant requests.
- Navigation guards restore the session once (`initialized` flag, §5.6), never re-checking it on every navigation.

### 18.9 Rendering Optimization

- Long lists (Product/Transaction tables) render via `v-for` with a stable `:key` (entity `id`, never array index) so Vue's diffing stays correct and cheap across pagination/filter changes.
- `v-memo` / `shallowRef` are not applied preemptively — the data volumes here (tens to low hundreds of rows per page, server-paginated) do not warrant it; revisit only if profiling shows a real cost.

### 18.10 Asset Optimization

- Fonts (Roboto, Roboto Mono) loaded via `<link>` with `display=swap` (as in the validated prototype), avoiding invisible-text flash.
- No large raster images exist in this MVP's scope (no product photos defined in the approved spec) — nothing to optimize on that front yet.

---

## 19. Accessibility

### 19.1 Semantic HTML

Tables use real `<table>`/`<thead>`/`<tbody>` markup (not `<div>` grids) inside `AppTable`. Forms use `<label for="...">` paired to every input. Buttons are `<button>`, never a `<div>` with a click handler.

### 19.2 Keyboard Navigation

All interactive elements (`AppButton`, sidebar links, table row actions) are natively focusable elements (`<button>`/`<a>`) — no custom-built control relies solely on a `click` handler without also being keyboard-operable.

### 19.3 Focus Management

`AppModal` traps focus within the dialog while open and returns focus to the triggering element on close (implemented once, inherited by `ConfirmDialog` and `CurrentSaleModal`).

### 19.4 Form Accessibility

Every field has an associated label; validation errors are linked via `aria-describedby` so screen readers announce the error when a field receives focus.

### 19.5 Dialog Accessibility

`AppModal` sets `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to its title element.

### 19.6 ARIA (Where Required)

Used only where semantic HTML alone is insufficient (modal roles above, live-region announcement for toast messages via `aria-live="polite"`) — not scattered speculatively across elements that are already semantically correct.

### 19.7 Color Contrast

The approved palette (`#1C1B1F` on `#FFFFFF`, `#FFFFFF` on `#B71C1C`, etc.) meets WCAG AA contrast for body text; this is a property of the already-approved design tokens, not a new frontend decision — verified once during implementation of `tokens.css` and not re-litigated per component.

---

## 20. Testing Strategy

### 20.1 Unit Testing (Vitest)

Scope: pure functions — Zod schemas (valid/invalid cases), `apiError.js` normalization, formatting helpers (`formatRupiah`), permission-matrix lookups.

### 20.2 Component Testing (Vitest + @vue/test-utils)

Scope: `components/ui/*` in isolation (e.g., `AppTable` renders loading/empty/populated states correctly given props) and feature form components (validation errors appear/clear correctly).

### 20.3 Integration Testing

Scope: a feature composable (`useProducts`) against a mocked `products.service` (via `vi.mock`), verifying loading/error/success state transitions and that filters/pagination correctly shape the request params.

### 20.4 E2E Testing (Playwright)

Scope: full browser, against either a mocked API layer or a staging backend (TBD, §27). Covers the **critical user journeys**:

1. Login (each role) → correct landing page → correct sidebar visibility.
2. Cashier: Shift Open → POS: search, add to cart, open Current Sale modal, adjust qty, Charge → Payment: insufficient cash blocked, sufficient cash → Confirm → Success → New Sale.
3. Admin/Manager: Product List → Add Product (validation errors, then valid submit) → appears in list → Edit → Delete (confirm modal) → removed from list.
4. Admin: User List → Add User → Deactivate User → status updates.
5. Role-restriction: Cashier attempting to navigate directly to `/users` → redirected to `/403`.
6. Unknown route → `/404` → "Back to Dashboard" returns correctly.

### 20.5 Testing Conventions

- Test files colocated as `*.spec.js` next to the unit under test for unit/component tests; E2E specs live in `tests/e2e/`, one file per critical journey above.
- No test asserts on CSS class names/styling — only on behavior, visible text, and ARIA roles (resilient to visual refactors).

---

## 21. Code Quality & Development Rules

### 21.1 Clean Code / 21.2 SOLID (where applicable) / 21.3 DRY / 21.4 KISS

Applied pragmatically, not dogmatically — e.g., Single Responsibility shows up as "a composable does one thing" (§1.4), not as a mandate to fragment every 10-line function. DRY is satisfied by the shared `AppTable`/`ConfirmDialog`/composable conventions (§8, §13) — **not** by forcing genuinely different entities (Users vs. Products) into one rigid abstraction, which the project brief explicitly warns against.

### 21.5 Separation of Concerns

Enforced structurally by the layer boundaries in §1.3/§1.6, not left to convention alone.

### 21.6–21.10 Naming Conventions (Components, Composables, Stores, Services, Imports)

Covered fully in §3.2. Import convention: always use the `@/` alias (configured in `vite.config.js`) for cross-directory imports, relative imports (`./`, `../`) only within the same feature folder.

### 21.11 Formatting & Linting

- **Prettier** — single formatting authority, run via a pre-commit hook (§24.2); no manual formatting debates.
- **ESLint** (`eslint-plugin-vue`, recommended + a custom rule set enforcing the import boundaries from §1.6 via `eslint-plugin-boundaries` or equivalent) — run in CI, blocking merge on failure.

### 21.12 Avoiding Dead Code

CI includes an unused-export/unused-import check (via ESLint's `no-unused-vars` plus a periodic `vite-bundle-visualizer` review) — dead code is deleted, not commented out "just in case."

### 21.13 Avoiding Duplicated Logic

Any logic copy-pasted into a second location is immediately extracted into the appropriate composable/util — enforced at code review (§24.5), not just tooling.

### 21.14 Avoiding Unnecessary Comments

Comments explain *why*, not *what* (the code should already say what). No commented-out code blocks committed. JSDoc used only on exported composables/services where the param/return shape isn't obvious from TypeScript types alone.

### 21.15 Avoiding Over-Engineering

The recurring guardrail throughout this document (§1.2, §8.9, §13.1, §13.8, §18.2, §18.9): every abstraction introduced here is justified by an actual, current requirement from the approved spec — not by a hypothetical future need. Where a simpler option (local state over a store, a direct composable over a generic factory) satisfies the current 26-screen scope, it is chosen over the more "scalable-looking" alternative.

---

## 22. Environment & Configuration

### 22.1 Environments

| Environment | File | Purpose |
| --- | --- | --- |
| Development | `.env.development` | Local dev server, points at local/mock API |
| Staging | `.env.staging` | Pre-production, points at staging API |
| Production | `.env.production` | Live deployment |

### 22.2 Environment Variables

```
VITE_API_BASE_URL=https://api.example.com
VITE_APP_ENV=production
```

(Final variable list depends on the confirmed backend contract, §27 — the above are the minimum this architecture requires.)

### 22.3 API Configuration

Read exclusively via `import.meta.env.VITE_API_BASE_URL` inside `httpClient.js` (§10.2/10.3) — never hardcoded, never re-read in individual service files.

### 22.4 Feature Configuration

No feature flags are defined for this MVP (no A/B or partial-rollout requirement in the approved scope). If one becomes necessary later, it is added as a single `VITE_FEATURE_*` variable, read once in the relevant composable — not a generic feature-flag framework introduced speculatively.

---

## 23. Build & Deployment

### 23.1 Vite Build

`vite build` produces a static, hashed-asset bundle in `dist/` — standard Vite production output, no custom build-plugin complexity added beyond what §2's dependency list requires (Vue plugin, Tailwind's PostCSS plugin).

### 23.2 Production Bundle

Route-level code splitting (§18.1) is the primary bundle-size control; no additional manual chunking configured unless a future bundle-analysis finding justifies it.

### 23.3 SPA Routing Fallback

Because this is a client-side-routed SPA (`vue-router` in `history` mode), the web server **must** be configured to serve `index.html` for any unmatched path (so a hard refresh on `/products/12/edit` doesn't 404 at the server level before Vue Router ever runs) — this is a **hosting-configuration requirement**, not something the frontend build can guarantee alone (flagged again in §27 as a deployment dependency to confirm with whoever owns hosting).

### 23.4 Web Server Configuration

Example (Nginx) — illustrative, final config depends on the actual hosting target (TBD, §27):

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### 23.5 Deployment Structure

`dist/` is the sole deployment artifact — a static bundle deployable to any static host/CDN (Nginx, S3+CloudFront, Netlify, Vercel, etc.), pending confirmation of the actual target (§27).

### 23.6 Production Considerations

- Source maps generated but not publicly served in production (or served only to an internal error-reporting tool) — avoids exposing full source structure to end users while still enabling debugging of production errors.
- `console.log` calls are stripped in production builds (via a Vite/esbuild `drop` config) except intentional error-reporting hooks.

---

## 24. Development Workflow

### 24.1 Development Sequence

Follows the Implementation Roadmap in §25 — foundation first, features last, matching dependency order (a feature page cannot be built before the layout/router/auth it depends on exists).

### 24.2 Git Workflow

Trunk-based with short-lived feature branches: `main` is always deployable; work happens on `feature/<short-description>` or `fix/<short-description>` branches, merged via pull request.

### 24.3 Branching Strategy

- `main` — production-ready at all times.
- `feature/*`, `fix/*` — one branch per unit of work, deleted after merge.
- No long-lived `develop` branch — unnecessary process overhead for a project this size.

### 24.4 Commit Conventions

**Conventional Commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`) — enables automated changelog generation later if needed, and keeps history scannable.

### 24.5 Code Review Standards

Every PR checked against: does it respect the layer boundaries (§1.6)? Does it introduce a new shared abstraction that violates the "rule of three" (§3.3)? Are loading/empty/error states handled (§7.5)? Is any new sensitive-looking logic (auth, permissions) touching the single sources of truth (§11.4) rather than duplicating a check?

### 24.6 Definition of Done

A feature/page is "done" when: it matches the approved wireframe spec exactly; all four data states (§7.5) are implemented; form validation matches the schema; the relevant E2E journey (§20.4) passes; ESLint/Prettier pass; and role-based access has been verified for every role listed in its `meta.roles`.

---

## 25. Implementation Roadmap

Recommended build order — each phase depends only on prior phases:

1. **Foundation** — Vite + Vue 3 project scaffold, Tailwind config with design tokens (§15.1), ESLint/Prettier, folder structure (§3), `tokens.css`/`base.css`.
2. **Application shell** — `AuthLayout`, `AppLayout`, `SidebarNav`, `TopBar`, router with route table + guards (stubbed auth store for now).
3. **Authentication** — `auth.store`, `auth.service`, `LoginPage`, session restoration, real guard logic, permission matrix (§11.4).
4. **Shared components** — the 10 `components/ui` primitives (§8.1), built and visually verified against the approved prototype before any feature page consumes them.
5. **API layer** — `httpClient`, `apiError`, all `services/api/*.service.js` files (against the confirmed backend contract, §27).
6. **Features/modules**, in dependency order: a. Dashboard (read-only, simplest page — validates the whole data-fetching pattern end to end) b. Products + Categories (core CRUD pattern, establishes the form/table conventions reused everywhere else) c. POS + Payment + Transaction Success (the core business flow; depends on Products existing) d. Transactions history (depends on transactions created by POS) e. Users (Admin-only CRUD, depends on the permission matrix being solid) f. Reports (depends on transaction data existing) g. Shift Open/Close (Cashier-specific gate, can be built in parallel with POS) h. 403/404 (trivial, but should exist before QA starts clicking around)
7. **Testing** — unit/component tests written alongside each feature (not deferred to the end); E2E journeys (§20.4) once the relevant features are complete.
8. **Optimization** — bundle analysis, verify lazy-loading is working, confirm debounce/pagination behavior under realistic data volumes.
9. **Production deployment** — environment configuration (§22), SPA fallback confirmed with hosting (§23.3), final security review against §17.

---

## 26. Final Architecture Reference

### 26.1 Final Folder Tree

See §3 in full — reproduced there as the authoritative structure.

### 26.2 Final Route Map

See §5.1 in full.

### 26.3 Final Navigation Map

See §6.5 (sidebar) — six items, role-filtered, matching §11.4's permission matrix exactly.

### 26.4 Final Component Map

| Layer | Count | Location |
| --- | --- | --- |
| Shared UI primitives | 10 | `components/ui/` |
| Layout components | 3 | `components/layout/` |
| Feature components | \~12 | inside each `features/*/components/` |

### 26.5 Final State Map

Three Pinia stores (`auth`, `ui`, `posCart`) + per-page composable-local server state (§9.4) — no other global state exists.

### 26.6 Final API / Service Map

Seven service files: `auth`, `products`, `categories`, `transactions`, `reports`, `users`, `shifts` — one per backend resource, no more, no fewer than the entities defined in the approved MVP scope.

### 26.7 Final Dependency List

```
vue, vue-router, pinia, axios, vee-validate, @vee-validate/zod, zod,
tailwindcss, @vueuse/core
— dev: vite, @vitejs/plugin-vue, vitest, @vue/test-utils, playwright,
  eslint, eslint-plugin-vue, prettier
```

Nine runtime dependencies total. No UI kit, no date library, no icon library, no state-caching library — consistent with §2's justification for each inclusion and exclusion.

### 26.8 Architecture Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Vue Router   │────▶│   AppLayout /  │
│  (SPA shell) │     │  (guards)     │     │  AuthLayout    │
└──────────────┘     └──────┬───────┘     └───────┬────────┘
                             │                      │
                      ┌──────▼───────┐      ┌───────▼────────┐
                      │  auth.store   │      │   Feature Page  │
                      │  (Pinia)      │◀────▶│  (e.g. Products) │
                      └──────┬───────┘      └───────┬────────┘
                             │                       │
                      ┌──────▼──────────────────────▼────────┐
                      │        Feature Composable              │
                      │   (useProducts / useProductForm)       │
                      └──────────────────┬──────────────────-─┘
                                          │
                                ┌─────────▼──────────┐
                                │  services/api/*      │
                                │  (products.service)  │
                                └─────────┬──────────┘
                                          │
                                ┌─────────▼──────────┐
                                │   httpClient (Axios)  │
                                │  + interceptors        │
                                └─────────┬──────────┘
                                          │
                                   ┌──────▼──────┐
                                   │  Backend API  │  (contract TBD)
                                   └─────────────┘
```

### 26.9 Development Checklist

- [ ] Foundation scaffold matches §3 exactly
- [ ] Design tokens in `tailwind.config.js` match the approved palette byte-for-byte
- [ ] Every route in §5.1 exists with correct `meta.roles`
- [ ] Sidebar visibility matches §6.5/§11.4 for all three roles
- [ ] Every list page implements all four data states (§7.5)
- [ ] Every mutation (create/update/delete) shows a toast and refreshes its list
- [ ] No component imports across feature boundaries (§1.6, lint-enforced)
- [ ] No `v-html` anywhere in the codebase
- [ ] All E2E critical journeys (§20.4) pass before first production deploy
- [ ] SPA fallback confirmed working on the actual hosting target

---

## 27. Open Dependencies & Unconfirmed Requirements

The following are **required to finalize implementation** and are not assumed or invented by this document. Each should be confirmed with the backend/infrastructure owner before the corresponding section is built:

| # | Open item | Affects | Default assumption used in this spec |
| --- | --- | --- | --- |
| 1 | **Backend API contract** — exact endpoint paths, request/response payload shapes, pagination query-param names, filter param names | §10.9, §13, §14 | Illustrative REST patterns shown; not final |
| 2 | **Authentication mechanism** — Bearer JWT vs. HttpOnly session cookie; refresh-token flow or not | §10.4, §11.2, §11.3, §17.3 | Bearer token via `Authorization` header, stored client-side |
| 3 | **Field-level validation error shape** returned by the backend on 400/422 | §12.3, §16.2 | Assumed a `{ field: message }` map; format not confirmed |
| 4 | **`:id` type/format** for Product, User, Transaction, Category resources (UUID, integer, slug) | §5.4 | Treated as an opaque string; no parsing assumed |
| 5 | **Hosting/deployment target** (Nginx/static host/CDN, environment count beyond dev/staging/prod) | §23.3–23.5 | Nginx example given illustratively |
| 6 | **Error-reporting/monitoring tool** (Sentry or equivalent) for production uncaught-error capture | §4.3, §16.8, §23.6 | Hook point defined; no specific tool wired in |
| 7 | **Multi-terminal/concurrent-write behavior** — whether stock updates from simultaneous POS sessions need real-time sync beyond the current request/response model | §13.8 | Assumed single-terminal-at-a-time is sufficient for MVP; explicitly flagged as a re-evaluation trigger if concurrent terminals become a real requirement |
| 8 | **Shift/Register concept scope** — whether "shift" is per-cashier only (as currently specified) or will later extend to a register/terminal entity (explicitly excluded from the current MVP per the product review) | §11.6 | Per-cashier shift only, no register/terminal entity |

Until these are confirmed, any code written against §10 (API Integration) and §11.2–11.3 (session handling) should be treated as a best-effort pattern implementation, isolated behind the `services/api/` and `services/http/` boundaries specifically so that confirming the real contract later requires changing only those files — not the composables, stores, or components that consume them.