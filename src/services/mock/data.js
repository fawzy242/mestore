let productSeq = 1000
let categorySeq = 100
let userSeq = 100
let supplierSeq = 100
let purchaseSeq = 100
let refundSeq = 100
let customerSeq = 100
let discountSeq = 100
let cashMoveSeq = 100
let shiftSeq = 100
let stockMoveSeq = 1000

// ----------------------------------------------------------------------------
// Flag helpers
// Approved/Pending entities carry: IsActive, IsDelete, Approved
// Active/Inactive entities carry:   IsActive, IsDelete
// ----------------------------------------------------------------------------

const APPROVED = (extra = {}) => ({ IsActive: 1, IsDelete: 0, Approved: 1, ...extra })
const PENDING = (extra = {}) => ({ IsActive: 1, IsDelete: 0, Approved: 0, ...extra })
const REJECTED = (extra = {}) => ({ IsActive: 0, IsDelete: 1, Approved: 0, ...extra })

const ACTIVE = (extra = {}) => ({ IsActive: 1, IsDelete: 0, ...extra })
const INACTIVE = (extra = {}) => ({ IsActive: 0, IsDelete: 0, ...extra })
const DELETED = (extra = {}) => ({ IsActive: 0, IsDelete: 1, ...extra })

// ----------------------------------------------------------------------------
// Categories
// ----------------------------------------------------------------------------
const CATEGORIES = [
  { id: 1, name: 'Beverages' },
  { id: 2, name: 'Snacks & Instant' },
  { id: 3, name: 'Bakery' },
  { id: 4, name: 'Staples' },
  { id: 5, name: 'Household' },
]

// ----------------------------------------------------------------------------
// Products (Active/Inactive)
// ----------------------------------------------------------------------------
const BASE_PRODUCTS = [
  { name: 'Indomie Goreng', sku: '8991002101', category: 'Snacks & Instant', price: 3500, cost: 2800, stock: 120, unit: 'pcs', ...ACTIVE() },
  { name: 'Aqua 600ml', sku: '8993050102', category: 'Beverages', price: 4000, cost: 3000, stock: 8, unit: 'bottle', ...ACTIVE() },
  { name: 'Teh Botol Sosro', sku: '8991103103', category: 'Beverages', price: 5000, cost: 3800, stock: 64, unit: 'bottle', ...ACTIVE() },
  { name: 'Sari Roti Tawar', sku: '8992001104', category: 'Bakery', price: 15000, cost: 11000, stock: 5, unit: 'pack', ...ACTIVE() },
  { name: 'Kopi Kapal Api', sku: '8993201105', category: 'Snacks & Instant', price: 2000, cost: 1500, stock: 200, unit: 'sachet', ...ACTIVE() },
  { name: 'Beras Premium 5kg', sku: '8991405106', category: 'Staples', price: 68000, cost: 60000, stock: 3, unit: 'bag', ...ACTIVE() },
  { name: 'Minyak Goreng 1L', sku: '8992501107', category: 'Staples', price: 19500, cost: 16500, stock: 40, unit: 'bottle', ...ACTIVE() },
  { name: 'Sabun Mandi Lifebuoy', sku: '8993601108', category: 'Household', price: 6000, cost: 4500, stock: 75, unit: 'pcs', ...ACTIVE() },
  { name: 'Mie Sedaap Soto', sku: '8991002201', category: 'Snacks & Instant', price: 3400, cost: 2700, stock: 88, unit: 'pcs', ...ACTIVE() },
  { name: 'Pocari Sweat 500ml', sku: '8993050202', category: 'Beverages', price: 8500, cost: 6800, stock: 22, unit: 'bottle', ...ACTIVE() },
  { name: 'Roti Sobek Cokelat', sku: '8992001204', category: 'Bakery', price: 12000, cost: 9000, stock: 14, unit: 'pack', ...ACTIVE() },
  { name: 'Tepung Segitiga 1kg', sku: '8991405206', category: 'Staples', price: 13500, cost: 10500, stock: 30, unit: 'pack', ...ACTIVE() },
  { name: 'Sabun Cuci Rinso', sku: '8993601208', category: 'Household', price: 24500, cost: 19500, stock: 18, unit: 'pack', ...ACTIVE() },
  { name: 'Kecap ABC 275ml', sku: '8992501307', category: 'Staples', price: 8500, cost: 6500, stock: 42, unit: 'bottle', ...ACTIVE() },
  { name: 'Sarden ABC 155g', sku: '8991405306', category: 'Staples', price: 12500, cost: 9500, stock: 26, unit: 'can', ...ACTIVE() },
  { name: 'Kopi Good Day', sku: '8993201305', category: 'Snacks & Instant', price: 2500, cost: 1800, stock: 150, unit: 'sachet', ...ACTIVE() },
  { name: 'Susu Ultra 250ml', sku: '8993050302', category: 'Beverages', price: 6500, cost: 5000, stock: 60, unit: 'pack', ...ACTIVE() },
  { name: 'Chitato Sapi 68g', sku: '8991002301', category: 'Snacks & Instant', price: 11000, cost: 8500, stock: 34, unit: 'pack', ...ACTIVE() },
  { name: 'Roti Sisir', sku: '8992001304', category: 'Bakery', price: 14000, cost: 10500, stock: 7, unit: 'pack', ...ACTIVE() },
  { name: 'Pembersih Lantai Super', sku: '8993601308', category: 'Household', price: 18500, cost: 14500, stock: 12, unit: 'bottle', ...ACTIVE() },
  { name: 'Teh Pucuk 350ml', sku: '8991103203', category: 'Beverages', price: 4500, cost: 3200, stock: 55, unit: 'bottle', ...INACTIVE() },
  { name: 'Beng Beng', sku: '8991002401', category: 'Snacks & Instant', price: 2500, cost: 1800, stock: 96, unit: 'pcs', ...INACTIVE() },
]

// ----------------------------------------------------------------------------
// Users (Active/Inactive)
// ----------------------------------------------------------------------------
const BASE_USERS = [
  { name: 'Fawzy Admin', username: 'fawzy', role: 'admin', ...ACTIVE() },
  { name: 'Budi Santoso', username: 'budi', role: 'manager', ...ACTIVE() },
  { name: 'Siti Rahma', username: 'siti', role: 'cashier', ...ACTIVE() },
  { name: 'Andi Wijaya', username: 'andi', role: 'cashier', ...INACTIVE() },
  { name: 'Rina Manager', username: 'rina', role: 'manager', ...ACTIVE() },
  { name: 'Dewi Kasir', username: 'dewi', role: 'cashier', ...ACTIVE() },
  { name: 'Agus Kasir', username: 'agus', role: 'cashier', ...INACTIVE() },
  { name: 'Lina Admin', username: 'lina', role: 'admin', ...ACTIVE() },
  { name: 'Hendra Manager', username: 'hendra', role: 'manager', ...ACTIVE() },
  { name: 'Fitri Kasir', username: 'fitri', role: 'cashier', ...ACTIVE() },
  { name: 'Bayu Kasir', username: 'bayu', role: 'cashier', ...ACTIVE() },
  { name: 'Nadia Manager', username: 'nadia', role: 'manager', ...INACTIVE() },
]

// ----------------------------------------------------------------------------
// Transactions (view-only, no flags)
// ----------------------------------------------------------------------------
const BASE_TRANSACTIONS = [
  { id: 'RC-0192', time: 'Sep 24, 2026, 10:41 AM', cashier: 'Siti', total: 47500, method: 'Cash', tendered: 50000, items: [{ name: 'Indomie Goreng', qty: 3, price: 3500 }, { name: 'Aqua 600ml', qty: 9, price: 4000 }] },
  { id: 'RC-0191', time: 'Sep 24, 2026, 10:22 AM', cashier: 'Budi', total: 132000, method: 'Cash', tendered: 150000, items: [{ name: 'Beras Premium 5kg', qty: 1, price: 68000 }, { name: 'Minyak Goreng 1L', qty: 1, price: 19500 }, { name: 'Sabun Mandi Lifebuoy', qty: 7, price: 6000 }] },
  { id: 'RC-0190', time: 'Sep 24, 2026, 09:58 AM', cashier: 'Siti', total: 19500, method: 'Cash', tendered: 20000, items: [{ name: 'Minyak Goreng 1L', qty: 1, price: 19500 }] },
  { id: 'RC-0189', time: 'Sep 23, 2026, 04:12 PM', cashier: 'Budi', total: 8000, method: 'Cash', tendered: 10000, items: [{ name: 'Kopi Kapal Api', qty: 4, price: 2000 }] },
  { id: 'RC-0188', time: 'Sep 23, 2026, 03:44 PM', cashier: 'Dewi', total: 24600, method: 'QRIS', tendered: 24600, items: [{ name: 'Pocari Sweat 500ml', qty: 2, price: 8500 }, { name: 'Chitato Sapi 68g', qty: 1, price: 11000 }] },
  { id: 'RC-0187', time: 'Sep 23, 2026, 02:12 PM', cashier: 'Siti', total: 45500, method: 'Cash', tendered: 50000, items: [{ name: 'Tepung Segitiga 1kg', qty: 1, price: 13500 }, { name: 'Sarden ABC 155g', qty: 2, price: 12500 }, { name: 'Kecap ABC 275ml', qty: 1, price: 8500 }] },
  { id: 'RC-0186', time: 'Sep 23, 2026, 11:35 AM', cashier: 'Fitri', total: 34500, method: 'Card', tendered: 34500, items: [{ name: 'Roti Sisir', qty: 2, price: 14000 }, { name: 'Susu Ultra 250ml', qty: 1, price: 6500 }] },
]

// ----------------------------------------------------------------------------
// Suppliers (Active/Inactive)
// ----------------------------------------------------------------------------
const BASE_SUPPLIERS = [
  { id: 1, name: 'PT Sumber Pangan Nusantara', code: 'SUP-001', contact: 'Andi Prasetyo', phone: '+62 811 2345 678', email: 'sales@sumberpangan.co.id', address: 'Jl. Industri No. 45, Jakarta', joinedAt: 'Jan 15, 2025', ...ACTIVE() },
  { id: 2, name: 'CV Mitra Segar Abadi', code: 'SUP-002', contact: 'Budi Hartono', phone: '+62 812 3456 789', email: 'order@mitrasegar.id', address: 'Jl. Raya Bekasi KM 18, Jakarta', joinedAt: 'Feb 03, 2025', ...ACTIVE() },
  { id: 3, name: 'PT Bumi Snack Indonesia', code: 'SUP-003', contact: 'Siti Nurhaliza', phone: '+62 813 4567 890', email: 'info@bumisnack.co.id', address: 'Kawasan Industri Pulogadung, Jakarta', joinedAt: 'Mar 22, 2025', ...ACTIVE() },
  { id: 4, name: 'UD Roti Sehat Makmur', code: 'SUP-004', contact: 'Hendra Wijaya', phone: '+62 814 5678 901', email: 'hhendra@rotisehat.com', address: 'Jl. Pasar Baru No. 12, Tangerang', joinedAt: 'Apr 10, 2025', ...ACTIVE() },
  { id: 5, name: 'PT Kimia Bersih Sentosa', code: 'SUP-005', contact: 'Rina Marlina', phone: '+62 815 6789 012', email: 'sales@kimiabersih.id', address: 'Jl. Daan Mogot KM 12, Jakarta', joinedAt: 'May 08, 2025', ...INACTIVE() },
  { id: 6, name: 'CV Berkah Staples', code: 'SUP-006', contact: 'Ahmad Fauzi', phone: '+62 816 7890 123', email: 'berkah.staples@gmail.com', address: 'Jl. Cikini Raya No. 88, Jakarta', joinedAt: 'Jun 14, 2025', ...ACTIVE() },
]

// ----------------------------------------------------------------------------
// Purchases (Approve/Pending)
// ----------------------------------------------------------------------------
const BASE_PURCHASES = [
  { id: 1, refNo: 'PO-2026-0091', supplierId: 1, supplierName: 'PT Sumber Pangan Nusantara', date: 'Sep 24, 2026', items: [{ name: 'Indomie Goreng', qty: 200, price: 2700 }, { name: 'Mie Sedaap Soto', qty: 150, price: 2600 }], total: 930000, ...APPROVED() },
  { id: 2, refNo: 'PO-2026-0090', supplierId: 2, supplierName: 'CV Mitra Segar Abadi', date: 'Sep 23, 2026', items: [{ name: 'Aqua 600ml', qty: 300, price: 2900 }, { name: 'Pocari Sweat 500ml', qty: 120, price: 6500 }], total: 1650000, ...APPROVED() },
  { id: 3, refNo: 'PO-2026-0089', supplierId: 4, supplierName: 'UD Roti Sehat Makmur', date: 'Sep 22, 2026', items: [{ name: 'Sari Roti Tawar', qty: 80, price: 10500 }, { name: 'Roti Sisir', qty: 60, price: 10000 }], total: 1440000, ...APPROVED() },
  { id: 4, refNo: 'PO-2026-0088', supplierId: 3, supplierName: 'PT Bumi Snack Indonesia', date: 'Sep 21, 2026', items: [{ name: 'Chitato Sapi 68g', qty: 100, price: 8300 }], total: 830000, ...PENDING() },
  { id: 5, refNo: 'PO-2026-0087', supplierId: 6, supplierName: 'CV Berkah Staples', date: 'Sep 20, 2026', items: [{ name: 'Beras Premium 5kg', qty: 50, price: 58000 }, { name: 'Minyak Goreng 1L', qty: 100, price: 16000 }], total: 4500000, ...APPROVED() },
  { id: 6, refNo: 'PO-2026-0086', supplierId: 1, supplierName: 'PT Sumber Pangan Nusantara', date: 'Sep 25, 2026', items: [{ name: 'Kopi Kapal Api', qty: 500, price: 1400 }], total: 700000, ...PENDING() },
]

// ----------------------------------------------------------------------------
// Refunds (Approve/Pending)
// ----------------------------------------------------------------------------
const BASE_REFUNDS = [
  { id: 1, refNo: 'RF-2026-0012', originalTxId: 'RC-0189', customerName: 'Walk-in', items: [{ name: 'Kopi Kapal Api', qty: 2, price: 2000 }], amount: 4000, date: 'Sep 24, 2026', reason: 'Damaged packaging', ...APPROVED() },
  { id: 2, refNo: 'RF-2026-0011', originalTxId: 'RC-0186', customerName: 'Member (C-0042)', items: [{ name: 'Roti Sisir', qty: 1, price: 14000 }], amount: 14000, date: 'Sep 23, 2026', reason: 'Wrong item purchased', ...APPROVED() },
  { id: 3, refNo: 'RF-2026-0010', originalTxId: 'RC-0188', customerName: 'Walk-in', items: [{ name: 'Pocari Sweat 500ml', qty: 1, price: 8500 }], amount: 8500, date: 'Sep 23, 2026', reason: 'Customer complaint', ...PENDING() },
  { id: 4, refNo: 'RF-2026-0009', originalTxId: 'RC-0192', customerName: 'Walk-in', items: [{ name: 'Aqua 600ml', qty: 3, price: 4000 }], amount: 12000, date: 'Sep 25, 2026', reason: 'Overcharge on receipt', ...PENDING() },
]

// ----------------------------------------------------------------------------
// Customers (Active/Inactive)
// ----------------------------------------------------------------------------
const BASE_CUSTOMERS = [
  { id: 1, name: 'Ahmad Yusuf', memberCode: 'C-0041', phone: '+62 811 1111 111', email: 'ahmad.yusuf@email.com', address: 'Jl. Merdeka No. 12, Jakarta', joinedAt: 'Jan 05, 2026', ...ACTIVE() },
  { id: 2, name: 'Siti Aisyah', memberCode: 'C-0042', phone: '+62 811 2222 222', email: 'siti.aisyah@email.com', address: 'Jl. Sudirman No. 45, Jakarta', joinedAt: 'Feb 14, 2026', ...ACTIVE() },
  { id: 3, name: 'Budi Setiawan', memberCode: 'C-0043', phone: '+62 811 3333 333', email: 'budi.setiawan@email.com', address: 'Jl. Thamrin No. 8, Jakarta', joinedAt: 'Mar 20, 2026', ...ACTIVE() },
  { id: 4, name: 'Rina Melati', memberCode: 'C-0044', phone: '+62 811 4444 444', email: 'rina.melati@email.com', address: 'Jl. Gatot Subroto No. 120, Jakarta', joinedAt: 'Apr 08, 2026', ...ACTIVE() },
  { id: 5, name: 'Hendra Kusuma', memberCode: 'C-0045', phone: '+62 811 5555 555', email: 'hendra.k@email.com', address: 'Jl. Rasuna Said No. 30, Jakarta', joinedAt: 'May 22, 2026', ...INACTIVE() },
]

// ----------------------------------------------------------------------------
// Discounts (Approve/Pending)
// ----------------------------------------------------------------------------
const BASE_DISCOUNTS = [
  { id: 1, name: 'Weekend Flash Sale', type: 'percentage', value: 10, scope: 'all', appliesTo: 'All products', minPurchase: 100000, startDate: 'Sep 20, 2026', endDate: 'Sep 30, 2026', ...APPROVED() },
  { id: 2, name: 'Beverage Bulk Deal', type: 'percentage', value: 15, scope: 'category', appliesTo: 'Beverages', minPurchase: 50000, startDate: 'Sep 01, 2026', endDate: 'Oct 31, 2026', ...APPROVED() },
  { id: 3, name: 'Member Welcome Voucher', type: 'fixed', value: 5000, scope: 'all', appliesTo: 'All products', minPurchase: 25000, startDate: 'Sep 01, 2026', endDate: 'Dec 31, 2026', ...APPROVED() },
  { id: 4, name: 'Bakery Morning Promo', type: 'percentage', value: 20, scope: 'category', appliesTo: 'Bakery', minPurchase: 0, startDate: 'Aug 01, 2026', endDate: 'Sep 15, 2026', ...APPROVED() },
  { id: 5, name: 'Weekend Snack Attack', type: 'percentage', value: 12, scope: 'category', appliesTo: 'Snacks & Instant', minPurchase: 30000, startDate: 'Oct 01, 2026', endDate: 'Oct 31, 2026', ...PENDING() },
  { id: 6, name: 'New Member Bonus', type: 'fixed', value: 10000, scope: 'all', appliesTo: 'All products', minPurchase: 50000, startDate: 'Oct 05, 2026', endDate: 'Nov 30, 2026', ...PENDING() },
]

// ----------------------------------------------------------------------------
// Cash Movements (Approve/Pending)
// ----------------------------------------------------------------------------
const BASE_CASH_MOVES = [
  { id: 1, type: 'in', amount: 500000, reason: 'Petty cash top-up from manager', user: 'Fawzy Admin', shiftRef: 'SH-2026-0088', date: 'Sep 24, 2026, 11:20 AM', ...APPROVED() },
  { id: 2, type: 'out', amount: 125000, reason: 'Purchase of office supplies', user: 'Budi Santoso', shiftRef: 'SH-2026-0088', date: 'Sep 24, 2026, 09:45 AM', ...APPROVED() },
  { id: 3, type: 'out', amount: 80000, reason: 'Cleaning service payment', user: 'Siti Rahma', shiftRef: 'SH-2026-0087', date: 'Sep 23, 2026, 05:30 PM', ...APPROVED() },
  { id: 4, type: 'in', amount: 300000, reason: 'Petty cash replenishment', user: 'Fawzy Admin', shiftRef: 'SH-2026-0087', date: 'Sep 23, 2026, 08:00 AM', ...APPROVED() },
  { id: 5, type: 'out', amount: 45000, reason: 'Staff meal reimbursement', user: 'Siti Rahma', shiftRef: 'SH-2026-0088', date: 'Sep 25, 2026, 12:10 PM', ...PENDING() },
  { id: 6, type: 'in', amount: 250000, reason: 'Cash deposit from drawer', user: 'Budi Santoso', shiftRef: 'SH-2026-0088', date: 'Sep 25, 2026, 02:00 PM', ...PENDING() },
]

// ----------------------------------------------------------------------------
// Shifts (view-only)
// ----------------------------------------------------------------------------
const BASE_SHIFTS = [
  { id: 'SH-2026-0088', cashier: 'Siti Rahma', date: 'Sep 24, 2026', openedAt: '08:00 AM', closedAt: '05:00 PM', openingCash: 300000, closingCash: 512000, expectedCash: 512000, variance: 0, status: 'Closed' },
  { id: 'SH-2026-0087', cashier: 'Dewi Kasir', date: 'Sep 23, 2026', openedAt: '08:15 AM', closedAt: '05:10 PM', openingCash: 300000, closingCash: 648500, expectedCash: 650000, variance: -1500, status: 'Closed' },
  { id: 'SH-2026-0086', cashier: 'Siti Rahma', date: 'Sep 22, 2026', openedAt: '08:05 AM', closedAt: '05:00 PM', openingCash: 250000, closingCash: 425000, expectedCash: 425000, variance: 0, status: 'Closed' },
  { id: 'SH-2026-0085', cashier: 'Fitri Kasir', date: 'Sep 21, 2026', openedAt: '08:00 AM', closedAt: '05:00 PM', openingCash: 300000, closingCash: 388000, expectedCash: 390000, variance: -2000, status: 'Closed' },
  { id: 'SH-2026-0089', cashier: 'Siti Rahma', date: 'Sep 24, 2026', openedAt: '05:30 PM', closedAt: '', openingCash: 300000, closingCash: 0, expectedCash: 0, variance: 0, status: 'Open' },
]

// ----------------------------------------------------------------------------
// Stock Movements (Approve/Pending)
// ----------------------------------------------------------------------------
const BASE_STOCK_MOVES = [
  { id: 1, productId: 1, productName: 'Indomie Goreng', sku: '8991002101', type: 'in', quantity: 200, before: 20, after: 220, reason: 'Purchase receipt PO-2026-0091', user: 'Fawzy Admin', date: 'Sep 24, 2026, 11:40 AM', ...APPROVED() },
  { id: 2, productId: 2, productName: 'Aqua 600ml', sku: '8993050102', type: 'out', quantity: 12, before: 20, after: 8, reason: 'Sold via POS RC-0192', user: 'Siti Rahma', date: 'Sep 24, 2026, 10:41 AM', ...APPROVED() },
  { id: 3, productId: 6, productName: 'Beras Premium 5kg', sku: '8991405106', type: 'adjust', quantity: -2, before: 5, after: 3, reason: 'Damaged bag during handling', user: 'Budi Santoso', date: 'Sep 23, 2026, 03:20 PM', ...PENDING() },
  { id: 4, productId: 4, productName: 'Sari Roti Tawar', sku: '8992001104', type: 'in', quantity: 80, before: 25, after: 105, reason: 'Purchase receipt PO-2026-0089', user: 'Budi Santoso', date: 'Sep 22, 2026, 02:00 PM', ...APPROVED() },
  { id: 5, productId: 8, productName: 'Sabun Mandi Lifebuoy', sku: '8993601108', type: 'out', quantity: 7, before: 82, after: 75, reason: 'Sold via POS RC-0191', user: 'Budi Santoso', date: 'Sep 24, 2026, 10:22 AM', ...APPROVED() },
  { id: 6, productId: 7, productName: 'Minyak Goreng 1L', sku: '8992501107', type: 'out', quantity: 2, before: 42, after: 40, reason: 'Sold via POS RC-0191, RC-0190', user: 'Siti Rahma', date: 'Sep 24, 2026, 10:41 AM', ...APPROVED() },
  { id: 7, productId: 3, productName: 'Teh Botol Sosro', sku: '8991103103', type: 'adjust', quantity: -4, before: 68, after: 64, reason: 'Stock count discrepancy', user: 'Fawzy Admin', date: 'Sep 25, 2026, 09:15 AM', ...PENDING() },
]

// ----------------------------------------------------------------------------
// Builders
// ----------------------------------------------------------------------------
function buildProducts() {
  return BASE_PRODUCTS.map((p, idx) => ({ id: idx + 1, ...p }))
}
function buildCategories() {
  return CATEGORIES.map((c) => ({ ...c, ...ACTIVE() }))
}
function buildUsers() {
  return BASE_USERS.map((u, idx) => ({ id: idx + 1, ...u }))
}
function buildTransactions() {
  return BASE_TRANSACTIONS.map((t) => ({ ...t, items: t.items.map((i) => ({ ...i })) }))
}
function buildSuppliers() {
  return BASE_SUPPLIERS.map((s) => ({ ...s }))
}
function buildPurchases() {
  return BASE_PURCHASES.map((p) => ({ ...p, items: p.items.map((i) => ({ ...i })) }))
}
function buildRefunds() {
  return BASE_REFUNDS.map((r) => ({ ...r, items: r.items.map((i) => ({ ...i })) }))
}
function buildCustomers() {
  return BASE_CUSTOMERS.map((c) => ({ ...c }))
}
function buildDiscounts() {
  return BASE_DISCOUNTS.map((d) => ({ ...d }))
}
function buildCashMoves() {
  return BASE_CASH_MOVES.map((c) => ({ ...c }))
}
function buildShifts() {
  return BASE_SHIFTS.map((s) => ({ ...s }))
}
function buildStockMoves() {
  return BASE_STOCK_MOVES.map((s) => ({ ...s }))
}

export const db = {
  products: buildProducts(),
  categories: buildCategories(),
  users: buildUsers(),
  transactions: buildTransactions(),
  suppliers: buildSuppliers(),
  purchases: buildPurchases(),
  refunds: buildRefunds(),
  customers: buildCustomers(),
  discounts: buildDiscounts(),
  cashMoves: buildCashMoves(),
  shifts: buildShifts(),
  stockMoves: buildStockMoves(),
}

export function nextProductId() { return ++productSeq }
export function nextCategoryId() { return ++categorySeq }
export function nextUserId() { return ++userSeq }
export function nextSupplierId() { return ++supplierSeq }
export function nextPurchaseId() { return ++purchaseSeq }
export function nextRefundId() { return ++refundSeq }
export function nextCustomerId() { return ++customerSeq }
export function nextDiscountId() { return ++discountSeq }
export function nextCashMoveId() { return ++cashMoveSeq }
export function nextShiftId() { return ++shiftSeq }
export function nextStockMoveId() { return ++stockMoveSeq }

export function resetDb() {
  db.products = buildProducts()
  db.categories = buildCategories()
  db.users = buildUsers()
  db.transactions = buildTransactions()
  db.suppliers = buildSuppliers()
  db.purchases = buildPurchases()
  db.refunds = buildRefunds()
  db.customers = buildCustomers()
  db.discounts = buildDiscounts()
  db.cashMoves = buildCashMoves()
  db.shifts = buildShifts()
  db.stockMoves = buildStockMoves()
  productSeq = 1000
  categorySeq = 100
  userSeq = 100
  supplierSeq = 100
  purchaseSeq = 100
  refundSeq = 100
  customerSeq = 100
  discountSeq = 100
  cashMoveSeq = 100
  shiftSeq = 100
  stockMoveSeq = 1000
}

export function delay(value, ms = 120) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}