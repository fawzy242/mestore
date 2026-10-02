const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * @param {number} value
 * @returns {string} e.g. "Rp 12.500"
 */
export function formatRupiah(value) {
  return rupiahFormatter.format(Number(value) || 0).replace(/\u00A0/g, ' ')
}

/**
 * @param {Date|string|number} value
 * @returns {string}
 */
export function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateTimeFormatter.format(date)
}