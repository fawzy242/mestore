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

  // ---------- AuthLayout ----------
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

  // ---------- AppLayout ----------
  {
    path: '/',
    component: AppLayout,
    children: [
      // Dashboard
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/features/dashboard/pages/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },

      // POS
      {
        path: 'pos',
        name: 'pos',
        component: () => import('@/features/pos/pages/PosPage.vue'),
        meta: { requiresAuth: true, title: 'POS / Sales', requiresOpenShift: true },
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

      // Shift
      {
        path: 'shift/open',
        name: 'shift.open',
        component: () => import('@/features/shift/pages/ShiftOpenPage.vue'),
        meta: { requiresAuth: true, title: 'Open Shift' },
      },

      // Products
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

      // Categories
      {
        path: 'categories',
        name: 'categories.list',
        component: () => import('@/features/categories/pages/CategoryListPage.vue'),
        meta: { requiresAuth: true, title: 'Categories' },
      },

      // Product Stock
      {
        path: 'stock',
        name: 'stock.list',
        component: () => import('@/features/product-stock/pages/ProductStockPage.vue'),
        meta: { requiresAuth: true, title: 'Product Stock' },
      },

      // Transactions
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

      // Shift Management (view-only)
      {
        path: 'shifts',
        name: 'shifts.list',
        component: () => import('@/features/shift/pages/ShiftListPage.vue'),
        meta: { requiresAuth: true, title: 'Shift Management' },
      },

      // Suppliers
      {
        path: 'suppliers',
        name: 'suppliers.list',
        component: () => import('@/features/suppliers/pages/SupplierListPage.vue'),
        meta: { requiresAuth: true, title: 'Suppliers' },
      },

      // Purchases
      {
        path: 'purchases',
        name: 'purchases.list',
        component: () => import('@/features/purchases/pages/PurchaseListPage.vue'),
        meta: { requiresAuth: true, title: 'Purchases' },
      },

      // Refunds
      {
        path: 'refunds',
        name: 'refunds.list',
        component: () => import('@/features/refunds/pages/RefundListPage.vue'),
        meta: { requiresAuth: true, title: 'Refunds' },
      },

      // Customers (members)
      {
        path: 'customers',
        name: 'customers.list',
        component: () => import('@/features/customers/pages/CustomerListPage.vue'),
        meta: { requiresAuth: true, title: 'Customers' },
      },

      // Discounts & Promotions
      {
        path: 'discounts',
        name: 'discounts.list',
        component: () => import('@/features/discounts/pages/DiscountListPage.vue'),
        meta: { requiresAuth: true, title: 'Discount & Promotions' },
      },

      // Cash In / Out
      {
        path: 'cash-movements',
        name: 'cash-movements.list',
        component: () => import('@/features/cash-movements/pages/CashMovementListPage.vue'),
        meta: { requiresAuth: true, title: 'Cash In / Cash Out' },
      },

      // Reports
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/features/reports/pages/ReportsPage.vue'),
        meta: { requiresAuth: true, title: 'Reports' },
      },

      // Users
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