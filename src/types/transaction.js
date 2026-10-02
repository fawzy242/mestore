/**
 * @typedef {Object} TransactionLine
 * @property {string} name
 * @property {number} qty
 * @property {number} price
 */

/**
 * @typedef {'Cash'|'Card'|'QRIS'} PaymentMethod
 */

/**
 * @typedef {Object} Transaction
 * @property {string} id
 * @property {string} time
 * @property {string} cashier
 * @property {number} total
 * @property {PaymentMethod} method
 * @property {number} tendered
 * @property {TransactionLine[]} items
 */

/**
 * @typedef {Object} TransactionPayload
 * @property {TransactionLine[]} items
 * @property {number} discount
 * @property {PaymentMethod} method
 * @property {number} tendered
 */

/**
 * @typedef {Object} ReceiptPayload
 * @property {string} receiptNo
 * @property {TransactionLine[]} items
 * @property {number} subtotal
 * @property {number} discount
 * @property {number} total
 * @property {number} tendered
 * @property {number} change
 */

export {}