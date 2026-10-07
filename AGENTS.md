# AGENTS.md

## Project Overview

MeStore is a POS frontend SPA built with:

- Vue 3
- Vite
- JavaScript (no TypeScript)
- Pinia
- Vue Router
- PrimeVue
- Tailwind CSS
- Axios
- Zod

This project is frontend-only. Backend integration is not finalized.

The project was originally scaffolded under the POSRetail name, but the product/project name is now MeStore.

---

# AI WORKING RULES

## Core Principles

Prioritize:

1. Correctness
2. Existing behavior preservation
3. Minimal and focused changes
4. Reusability
5. Maintainability
6. Performance
7. Consistent UI/UX

Do not optimize for code volume.

Prefer the smallest clean change that correctly solves the requested problem.

---

## Before Making Changes

For non-trivial tasks:

1. Inspect the relevant existing implementation.
2. Search for existing components, composables, stores, services, utilities, and patterns.
3. Identify all potentially affected files.
4. Understand the existing data flow.
5. Check the design specification when the task involves UI/layout.
6. Check existing mock/service implementations before changing API-related behavior.
7. Explain the implementation approach when the task has meaningful architectural impact.
8. Only then modify the code.

Do not immediately rewrite files based on assumptions.

---

## Scope Control

Modify only files that are relevant to the requested task.

Do NOT:

- Refactor unrelated code.
- Rename unrelated components/files.
- Reorganize the project without explicit instruction.
- Replace working implementations with different patterns without justification.
- Remove code simply because it appears unused.
- Introduce unnecessary abstractions.
- Introduce unnecessary dependencies.
- Rewrite large portions of the application for a small feature.

If an unrelated issue is discovered, report it separately instead of silently fixing it.

---

## Do Not Invent Functionality

Never invent:

- API endpoints
- Request/response contracts
- Database structures
- Authentication behavior
- Business rules
- Permissions
- Backend functionality
- Environment variables
- Existing services

If the backend contract is unknown, use the existing mock/service architecture.

Ask for clarification when implementation depends on an unknown backend contract.

---

# ARCHITECTURE

## Feature Structure

Features use:

src/features/<feature>/

with:

- components/
- composables/
- pages/
- schemas/

Keep feature-specific logic inside its feature.

Do not move code between features without a clear architectural reason.

---

## Shared UI Components

Shared presentational components are located under:

src/components/ui/

Examples:

- AppButton
- AppTable
- AppModal
- other shared UI components

Before creating a new UI component:

1. Search src/components/ui/.
2. Search the existing feature components.
3. Reuse an existing component when possible.
4. Extend an existing component when appropriate.
5. Create a new component only when there is a real reusable abstraction.

Do not create duplicate components that solve the same problem.

src/components/ui/index.js is the shared UI barrel.

Prefer shared UI components over directly using raw PrimeVue components when an equivalent wrapper already exists.

---

# VUE CONVENTIONS

Use:

<script setup>

Do not introduce the Options API.

Prefer:

- composables for reusable behavior
- Pinia for shared application state
- feature-local state for feature-specific state
- computed values for derived state
- existing project utilities before creating new utilities

Do not move state into Pinia unless the state actually needs to be shared or persisted at application level.

Avoid excessive watchers.

Prefer explicit data flow and computed state where possible.

---

# SERVICES AND API

## HTTP Client

The single Axios instance is:

src/services/http/httpClient.js

It:

- unwraps response.data
- normalizes errors
- attaches bearer tokens

The auth-store import inside the interceptor is intentionally lazy to avoid a circular dependency.

DO NOT convert the dynamic import into a static import.

---

## API Services

API services are located under:

src/services/api/

Current API services are MOCK implementations backed by:

src/services/mock/data.js

The backend contract is not confirmed.

Therefore:

- Continue using mock services unless explicitly instructed otherwise.
- Do not replace mock services with real HTTP calls based on assumptions.
- Do not invent API endpoints.
- Do not invent request/response structures.
- Do not modify VITE_API_BASE_URL behavior without explicit instruction.

src/services/api/index.js is intentionally an empty barrel.

Import API services directly.

---

# STATE MANAGEMENT

Pinia stores are located under:

src/stores/

Use existing stores whenever the required state already exists.

Before creating a new store:

1. Search existing stores.
2. Determine whether the state is truly application-wide.
3. Prefer local component/composable state for local concerns.

Do not introduce global state unnecessarily.

---

# ROUTING AND AUTHORIZATION

Router:

src/router/index.js
src/router/routes.js

Authorization uses:

src/constants/permissions.js

Respect:

- route permissions
- session restoration
- meta.requiresOpenShift
- cashier shift requirements

Do not bypass or weaken route guards.

Do not duplicate authorization logic inside pages unless there is an existing established pattern.

---

# MOCK DATA

Mock data is the current source of truth for frontend demonstration behavior until the backend contract is confirmed.

When implementing frontend functionality without a confirmed backend contract:

1. Update mock data if required.
2. Update the corresponding mock service.
3. Preserve the existing service interface.
4. Keep UI code independent from mock implementation details.

Do not place mock-specific logic directly inside page components.

---

# VALIDATION AND SCHEMAS

Zod schemas are located under:

src/features/*/schemas/

Reuse existing schemas when possible.

Do not duplicate validation rules unnecessarily.

When modifying form behavior:

- inspect the existing schema
- preserve existing validation behavior unless explicitly requested
- keep validation close to the feature

---

# STYLING AND UI

## Design System

Primary product identity:

- Red
- White

The UI must remain visually consistent with the MeStore design.

Avoid introducing arbitrary colors that conflict with the existing design system.

Prefer existing Tailwind classes, PrimeVue theme configuration, and centralized styling.

Do not create one-off styling when an existing design token/component can be reused.

---

## Layout

The application should use the available viewport efficiently.

Avoid unnecessary:

- excessive whitespace
- oversized containers
- excessive card nesting
- decorative elements that reduce usable space

Content should feel solid, practical, and appropriate for a POS system.

---

## Dark Mode

Theme state is controlled by the theme store.

PrimeVue uses:

darkModeSelector: '.dark'

Do not implement a separate dark-mode mechanism.

Preserve the existing theme architecture.

---

## Modal

Use the project's existing modal/dialog solution.

Do not create custom modal implementations when an existing shared modal or approved library already provides the required behavior.

Modal behavior must remain consistent across CRUD operations.

---

## Notifications and Confirmations

Use the existing project notification/confirmation mechanism.

Do not introduce another notification library without explicit approval.

Avoid implementations that cause unnecessary page jumps, layout shifts, or navigation side effects.

---

# POS-SPECIFIC RULES

## Products

Product management is a separate menu/feature from Category management.

Products support:

- Active
- Inactive

Where applicable, support bulk activation/deactivation using the existing UI pattern.

Do not combine Product and Category management into a single page unless explicitly requested.

---

## Category

Category management is a separate feature from Products.

Follow the same Active/Inactive management pattern where applicable.

---

## POS

Cart quantity modification must affect the selected cart item.

Do not make the entire cart open into a modal unless explicitly requested.

Cart modal/detail behavior must follow the existing design specification.

---

## Shift

Shift Open/Close is a POS operational function.

Do not treat Shift Open/Close as equivalent to authentication login/logout.

Cashier routes that require an open shift must continue to use:

meta.requiresOpenShift

and the existing router guard behavior.

---

# DESIGN SPECIFICATION

For UI/layout changes, consult:

docs/POSRetail - Frontend Master Design & Technical Specification (Vue 3 + Vite).md

The clickable prototype located alongside the specification should also be consulted when visual behavior is relevant.

The design specification takes precedence over assumptions about UI behavior.

Do not redesign existing screens merely because another design might be preferable.

---

# PERFORMANCE

Prefer efficient implementations.

Avoid:

- unnecessary API/service calls
- duplicated computed work
- unnecessary watchers
- excessive component re-renders
- duplicated state
- unnecessary deep cloning
- unnecessary dependencies
- large abstractions for trivial functionality

For lists and tables, consider rendering and data-processing cost before introducing expensive transformations.

Do not sacrifice maintainability for micro-optimizations.

---

# DEPENDENCIES

Before adding a dependency:

1. Check whether the existing project already provides equivalent functionality.
2. Check package.json.
3. Prefer existing dependencies.
4. Explain why the new dependency is necessary.

Do not install dependencies automatically unless explicitly requested or clearly necessary for the task.

---

# ENVIRONMENT

Environment files:

- .env.development
- .env.staging
- .env.production
- .env.example

Known variables:

- VITE_API_BASE_URL
- VITE_APP_ENV

Do not hardcode environment-specific configuration.

Never commit secrets.

---

# COMMANDS

Development:

npm run dev

Build:

npm run build

Lint:

npm run lint

Format:

npm run format

Preview:

npm run preview

---

# TESTING

There is currently no test runner installed.

There is no usable automated test suite.

Do not claim tests were executed unless a test runner has actually been installed and configured.

Current verification should primarily use:

npm run lint
npm run build

Run the relevant validation commands after meaningful code changes.

---

# CODE QUALITY

Follow the existing ESLint and Prettier configuration.

Current conventions include:

- <script setup>
- no semicolons
- single quotes
- printWidth 100
- trailing commas
- unused variables should be prefixed with _
- console is allowed as warning for warn/error

Do not change linting or formatting rules merely to make a change pass.

---

# GIT SAFETY

Do not:

- reset unrelated changes
- revert user changes
- force push
- rewrite Git history
- delete branches
- commit changes automatically

When reviewing existing changes, preserve modifications that were already present before the current task.

Before making destructive Git operations, obtain explicit approval.

---

# COMPLETION REQUIREMENTS

After implementation:

1. Review modified files.
2. Review the Git diff.
3. Run relevant lint/build validation.
4. Check for accidental unrelated changes.
5. Report what changed.
6. Report validation results.
7. Explicitly report any remaining issue or uncertainty.

Never claim:

- build passed
- lint passed
- tests passed
- implementation is complete

unless the corresponding verification was actually performed.