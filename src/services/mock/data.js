let productSeq = 1000
let categorySeq = 100
let userSeq = 100

const CATEGORIES = [
  { id: 1, name: 'Beverages' },
  { id: 2, name: 'Snacks & Instant' },
  { id: 3, name: 'Bakery' },
  { id: 4, name: 'Staples' },
  { id: 5, name: 'Household' },
]

const BASE_PRODUCTS = [
  { name: 'Indomie Goreng', sku: '8991002101', category: 'Snacks & Instant', price: 3500, cost: 2800, stock: 120, unit: 'pcs', status: 'Active' },
  { name: 'Aqua 600ml', sku: '8993050102', category: 'Beverages', price: 4000, cost: 3000, stock: 8, unit: 'bottle', status: 'Active' },
  { name: 'Teh Botol Sosro', sku: '8991103103', category: 'Beverages', price: 5000, cost: 3800, stock: 64, unit: 'bottle', status: 'Active' },
  { name: 'Sari Roti Tawar', sku: '8992001104', category: 'Bakery', price: 15000, cost: 11000, stock: 5, unit: 'pack', status: 'Active' },
  { name: 'Kopi Kapal Api', sku: '8993201105', category: 'Snacks & Instant', price: 2000, cost: 1500, stock: 200, unit: 'sachet', status: 'Active' },
  { name: 'Beras Premium 5kg', sku: '8991405106', category: 'Staples', price: 68000, cost: 60000, stock: 3, unit: 'bag', status: 'Active' },
  { name: 'Minyak Goreng 1L', sku: '8992501107', category: 'Staples', price: 19500, cost: 16500, stock: 40, unit: 'bottle', status: 'Active' },
  { name: 'Sabun Mandi Lifebuoy', sku: '8993601108', category: 'Household', price: 6000, cost: 4500, stock: 75, unit: 'pcs', status: 'Active' },
  { name: 'Mie Sedaap Soto', sku: '8991002201', category: 'Snacks & Instant', price: 3400, cost: 2700, stock: 88, unit: 'pcs', status: 'Active' },
  { name: 'Pocari Sweat 500ml', sku: '8993050202', category: 'Beverages', price: 8500, cost: 6800, stock: 22, unit: 'bottle', status: 'Active' },
  { name: 'Roti Sobek Cokelat', sku: '8992001204', category: 'Bakery', price: 12000, cost: 9000, stock: 14, unit: 'pack', status: 'Active' },
  { name: 'Tepung Segitiga 1kg', sku: '8991405206', category: 'Staples', price: 13500, cost: 10500, stock: 30, unit: 'pack', status: 'Active' },
  { name: 'Sabun Cuci Rinso', sku: '8993601208', category: 'Household', price: 24500, cost: 19500, stock: 18, unit: 'pack', status: 'Active' },
  { name: 'Kecap ABC 275ml', sku: '8992501307', category: 'Staples', price: 8500, cost: 6500, stock: 42, unit: 'bottle', status: 'Active' },
  { name: 'Sarden ABC 155g', sku: '8991405306', category: 'Staples', price: 12500, cost: 9500, stock: 26, unit: 'can', status: 'Active' },
  { name: 'Kopi Good Day', sku: '8993201305', category: 'Snacks & Instant', price: 2500, cost: 1800, stock: 150, unit: 'sachet', status: 'Active' },
  { name: 'Susu Ultra 250ml', sku: '8993050302', category: 'Beverages', price: 6500, cost: 5000, stock: 60, unit: 'pack', status: 'Active' },
  { name: 'Chitato Sapi 68g', sku: '8991002301', category: 'Snacks & Instant', price: 11000, cost: 8500, stock: 34, unit: 'pack', status: 'Active' },
  { name: 'Roti Sisir', sku: '8992001304', category: 'Bakery', price: 14000, cost: 10500, stock: 7, unit: 'pack', status: 'Active' },
  { name: 'Pembersih Lantai Super', sku: '8993601308', category: 'Household', price: 18500, cost: 14500, stock: 12, unit: 'bottle', status: 'Active' },
  { name: 'Teh Pucuk 350ml', sku: '8991103203', category: 'Beverages', price: 4500, cost: 3200, stock: 55, unit: 'bottle', status: 'Inactive' },
  { name: 'Beng Beng', sku: '8991002401', category: 'Snacks & Instant', price: 2500, cost: 1800, stock: 96, unit: 'pcs', status: 'Inactive' },
]

const BASE_USERS = [
  { name: 'Fawzy Admin', username: 'fawzy', role: 'admin', status: 'Active' },
  { name: 'Budi Santoso', username: 'budi', role: 'manager', status: 'Active' },
  { name: 'Siti Rahma', username: 'siti', role: 'cashier', status: 'Active' },
  { name: 'Andi Wijaya', username: 'andi', role: 'cashier', status: 'Inactive' },
  { name: 'Rina Manager', username: 'rina', role: 'manager', status: 'Active' },
  { name: 'Dewi Kasir', username: 'dewi', role: 'cashier', status: 'Active' },
  { name: 'Agus Kasir', username: 'agus', role: 'cashier', status: 'Inactive' },
  { name: 'Lina Admin', username: 'lina', role: 'admin', status: 'Active' },
  { name: 'Hendra Manager', username: 'hendra', role: 'manager', status: 'Active' },
  { name: 'Fitri Kasir', username: 'fitri', role: 'cashier', status: 'Active' },
  { name: 'Bayu Kasir', username: 'bayu', role: 'cashier', status: 'Active' },
  { name: 'Nadia Manager', username: 'nadia', role: 'manager', status: 'Inactive' },
]

const BASE_TRANSACTIONS = [
  { id: 'RC-0192', time: 'Sep 24, 2026, 10:41 AM', cashier: 'Siti', total: 47500, method: 'Cash', tendered: 50000, items: [{ name: 'Indomie Goreng', qty: 3, price: 3500 }, { name: 'Aqua 600ml', qty: 9, price: 4000 }] },
  { id: 'RC-0191', time: 'Sep 24, 2026, 10:22 AM', cashier: 'Budi', total: 132000, method: 'Cash', tendered: 150000, items: [{ name: 'Beras Premium 5kg', qty: 1, price: 68000 }, { name: 'Minyak Goreng 1L', qty: 1, price: 19500 }, { name: 'Sabun Mandi Lifebuoy', qty: 7, price: 6000 }] },
  { id: 'RC-0190', time: 'Sep 24, 2026, 09:58 AM', cashier: 'Siti', total: 19500, method: 'Cash', tendered: 20000, items: [{ name: 'Minyak Goreng 1L', qty: 1, price: 19500 }] },
  { id: 'RC-0189', time: 'Sep 23, 2026, 04:12 PM', cashier: 'Budi', total: 8000, method: 'Cash', tendered: 10000, items: [{ name: 'Kopi Kapal Api', qty: 4, price: 2000 }] },
  { id: 'RC-0188', time: 'Sep 23, 2026, 03:44 PM', cashier: 'Dewi', total: 24600, method: 'QRIS', tendered: 24600, items: [{ name: 'Pocari Sweat 500ml', qty: 2, price: 8500 }, { name: 'Chitato Sapi 68g', qty: 1, price: 11000 }] },
  { id: 'RC-0187', time: 'Sep 23, 2026, 02:12 PM', cashier: 'Siti', total: 45500, method: 'Cash', tendered: 50000, items: [{ name: 'Tepung Segitiga 1kg', qty: 1, price: 13500 }, { name: 'Sarden ABC 155g', qty: 2, price: 12500 }, { name: 'Kecap ABC 275ml', qty: 1, price: 8500 }] },
  { id: 'RC-0186', time: 'Sep 23, 2026, 11:35 AM', cashier: 'Fitri', total: 34500, method: 'Card', tendered: 34500, items: [{ name: 'Roti Sisir', qty: 2, price: 14000 }, { name: 'Susu Ultra 250ml', qty: 1, price: 6500 }] },
]

function buildProducts() {
  return BASE_PRODUCTS.map((p, idx) => ({ id: idx + 1, ...p }))
}
function buildCategories() {
  return CATEGORIES.map((c, idx) => ({ ...c, status: idx < 4 ? 'Active' : 'Active' }))
}
function buildUsers() {
  return BASE_USERS.map((u, idx) => ({ id: idx + 1, ...u }))
}
function buildTransactions() {
  return BASE_TRANSACTIONS.map((t) => ({ ...t, items: t.items.map((i) => ({ ...i })) }))
}

export const db = {
  products: buildProducts(),
  categories: buildCategories(),
  users: buildUsers(),
  transactions: buildTransactions(),
}

export function nextProductId() {
  return ++productSeq
}
export function nextCategoryId() {
  return ++categorySeq
}
export function nextUserId() {
  return ++userSeq
}

export function resetDb() {
  db.products = buildProducts()
  db.categories = buildCategories()
  db.users = buildUsers()
  db.transactions = buildTransactions()
  productSeq = 1000
  categorySeq = 100
  userSeq = 100
}

export function delay(value, ms = 120) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}