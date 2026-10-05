/**
 * Full route table.
 * Names must match `ROUTE_PERMISSIONS` in constants/permissions.js.
 */

const AuthLayout = () => import('@/layouts/AuthLayout.vue')
const AppLayout = () => import('@/layouts/AppLayout.vue')

export const routes = [
  {
    path: '/',
    redirect: () => ({ name: 'dashboard' }),
  },

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

  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/dashboard/pages/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },
      {
        path: 'pos',
        name: 'pos',
        component: () => import('@/features/pos/pages/PosPage.vue'),
        meta: { requiresAuth: true, title: 'POS / Sales' },
      },
      {
        path: 'pos/payment',
        name: 'pos.payment',
        component: () => import('@/features/pos/pages/PaymentPage.vue'),
        meta: { requiresAuth: true, title: 'Payment' },
      },
      {
        path: 'pos/success',
        name: 'pos.success',
        component: () => import('@/features/pos/pages/TransactionSuccessPage.vue'),
        meta: { requiresAuth: true, title: 'Transaction Complete' },
      },
      {
        path: 'products',
        name: 'products.list',
        component: () => import('@/features/products/pages/ProductListPage.vue'),
        meta: { requiresAuth: true, title: 'Products' },
      },
      {
        path: 'products/:id',
        name: 'products.detail',
        component: () => import('@/features/products/pages/ProductDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Product Detail' },
      },
      {
        path: 'categories',
        name: 'categories.list',
        component: () => import('@/features/categories/pages/CategoryListPage.vue'),
        meta: { requiresAuth: true, title: 'Categories' },
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
        path: 'users/:id',
        name: 'users.detail',
        component: () => import('@/features/users/pages/UserDetailPage.vue'),
        meta: { requiresAuth: true, title: 'User Detail' },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'not-found' },
  },
]