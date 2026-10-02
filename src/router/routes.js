/**
 * Full route table.
 * Names must match `ROUTE_PERMISSIONS` in constants/permissions.js.
 *
 * Architecture: two layout routes (`AuthLayout`, `AppLayout`) each render
 * `<router-view />` internally so their children mount inside the layout.
 */

const AuthLayout = () => import('@/layouts/AuthLayout.vue')
const AppLayout = () => import('@/layouts/AppLayout.vue')

export const routes = [
  {
    path: '/',
    redirect: () => ({ name: 'dashboard' }),
  },

  // ---------- AuthLayout (gate screens: Login, Shift, 403, 404) ----------
  {
    path: '/',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/features/auth/pages/LoginPage.vue'),
        meta: { public: true, title: 'Login' },
      },
      {
        path: 'shift/open',
        name: 'shift.open',
        component: () => import('@/features/shift/pages/ShiftOpenPage.vue'),
        meta: { requiresAuth: true, roles: ['cashier'], title: 'Start Shift' },
      },
      {
        path: 'shift/close',
        name: 'shift.close',
        component: () => import('@/features/shift/pages/ShiftClosePage.vue'),
        meta: { requiresAuth: true, roles: ['cashier'], title: 'Close Shift' },
      },
      {
        path: '403',
        name: 'forbidden',
        component: () => import('@/features/system/pages/ForbiddenPage.vue'),
        meta: { requiresAuth: true, title: 'No access' },
      },
      {
        path: '404',
        name: 'not-found',
        component: () => import('@/features/system/pages/NotFoundPage.vue'),
        meta: { public: true, title: 'Not found' },
      },
    ],
  },

  // ---------- AppLayout (authenticated app shell) ----------
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/dashboard/pages/DashboardPage.vue'),
        meta: { requiresAuth: true, requiresOpenShift: true, title: 'Dashboard' },
      },
      {
        path: 'pos',
        name: 'pos',
        component: () => import('@/features/pos/pages/PosPage.vue'),
        meta: { requiresAuth: true, requiresOpenShift: true, title: 'POS / Sales' },
      },
      {
        path: 'pos/payment',
        name: 'pos.payment',
        component: () => import('@/features/pos/pages/PaymentPage.vue'),
        meta: { requiresAuth: true, requiresOpenShift: true, title: 'Payment' },
      },
      {
        path: 'pos/success',
        name: 'pos.success',
        component: () => import('@/features/pos/pages/TransactionSuccessPage.vue'),
        meta: { requiresAuth: true, requiresOpenShift: true, title: 'Transaction Complete' },
      },
      {
        path: 'products',
        name: 'products.list',
        component: () => import('@/features/products/pages/ProductListPage.vue'),
        meta: { requiresAuth: true, title: 'Products' },
      },
      {
        path: 'products/new',
        name: 'products.new',
        component: () => import('@/features/products/pages/ProductFormPage.vue'),
        meta: { requiresAuth: true, title: 'Add Product' },
      },
      {
        path: 'products/:id',
        name: 'products.detail',
        component: () => import('@/features/products/pages/ProductDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Product Detail' },
      },
      {
        path: 'products/:id/edit',
        name: 'products.edit',
        component: () => import('@/features/products/pages/ProductFormPage.vue'),
        meta: { requiresAuth: true, title: 'Edit Product' },
      },
      {
        path: 'categories',
        name: 'categories.list',
        component: () => import('@/features/categories/pages/CategoryListPage.vue'),
        meta: { requiresAuth: true, title: 'Categories' },
      },
      {
        path: 'categories/new',
        name: 'categories.new',
        component: () => import('@/features/categories/pages/CategoryFormPage.vue'),
        meta: { requiresAuth: true, title: 'Add Category' },
      },
      {
        path: 'categories/:id/edit',
        name: 'categories.edit',
        component: () => import('@/features/categories/pages/CategoryFormPage.vue'),
        meta: { requiresAuth: true, title: 'Edit Category' },
      },
      {
        path: 'transactions',
        name: 'transactions.list',
        component: () => import('@/features/transactions/pages/TransactionListPage.vue'),
        meta: { requiresAuth: true, title: 'Transactions' },
      },
      {
        path: 'transactions/:id',
        name: 'transactions.detail',
        component: () => import('@/features/transactions/pages/TransactionDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Transaction Detail' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/features/reports/pages/ReportsPage.vue'),
        meta: { requiresAuth: true, title: 'Reports' },
      },
      {
        path: 'users',
        name: 'users.list',
        component: () => import('@/features/users/pages/UserListPage.vue'),
        meta: { requiresAuth: true, title: 'Users' },
      },
      {
        path: 'users/new',
        name: 'users.new',
        component: () => import('@/features/users/pages/UserFormPage.vue'),
        meta: { requiresAuth: true, title: 'Add User' },
      },
      {
        path: 'users/:id',
        name: 'users.detail',
        component: () => import('@/features/users/pages/UserDetailPage.vue'),
        meta: { requiresAuth: true, title: 'User Detail' },
      },
      {
        path: 'users/:id/edit',
        name: 'users.edit',
        component: () => import('@/features/users/pages/UserFormPage.vue'),
        meta: { requiresAuth: true, title: 'Edit User' },
      },
    ],
  },

  // ---------- Catch-all ----------
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'not-found' },
  },
]