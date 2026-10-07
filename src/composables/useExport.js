import { formatRupiah } from '@/composables/useFormatters.js'

/**
 * CSV export — plain text download with proper escaping.
 * @param {string} filename
 * @param {Array<{label:string, value:string}>} headers
 * @param {Array<Array<string|number>>} rows
 */
export function exportCsv(filename, headers, rows) {
  const escape = (v) => {
    const s = v == null ? '' : String(v)
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const head = headers.map((h) => escape(h.label)).join(',')
  const body = rows.map((r) => r.map(escape).join(',')).join('\n')
  const csv = `${head}\n${body}\n`

  // Add UTF-8 BOM so Excel opens with correct encoding
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

/**
 * XLSX export — real Excel file via SheetJS.
 * @param {string} filename
 * @param {string} sheetName
 * @param {Array<{label:string, key:string, format?:Function}>} columns
 * @param {Array<Object>} rows
 * @param {Object} [meta] — additional sheet-level info rows
 */
export async function exportXlsx(filename, sheetName, columns, rows, meta = {}) {
  const XLSX = await import('xlsx')

  const headers = columns.map((c) => c.label)
  const dataRows = rows.map((row) =>
    columns.map((c) => {
      const raw = row[c.key]
      return c.format ? c.format(raw, row) : raw
    }),
  )

  const sheetData = []
  // Meta rows at the top
  Object.entries(meta).forEach(([k, v]) => {
    sheetData.push([k, v])
  })
  if (Object.keys(meta).length > 0) sheetData.push([])

  sheetData.push(headers)
  dataRows.forEach((r) => sheetData.push(r))

  const sheet = XLSX.utils.aoa_to_sheet(sheetData)

  // Auto column widths
  const colWidths = headers.map((h, i) => {
    const values = [h, ...dataRows.map((r) => String(r[i] ?? ''))]
    const max = Math.max(...values.map((v) => v.length))
    return { wch: Math.min(Math.max(max + 2, 12), 40) }
  })
  sheet['!cols'] = colWidths

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

/**
 * PDF export — tabular PDF via jsPDF + autotable.
 * @param {string} filename
 * @param {string} title
 * @param {string} subtitle
 * @param {Array<{label:string, key:string, align?:string, format?:Function}>} columns
 * @param {Array<Object>} rows
 * @param {Object} [summaryRows] — key/value pairs shown above the table
 */
export async function exportPdf(filename, title, subtitle, columns, rows, summaryRows = null) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const primary = '#C8102E'
  const ink = '#1C1B1F'
  const inkSoft = '#5F6368'

  // Header
  doc.setFillColor(primary)
  doc.rect(0, 0, 595, 60, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('MeStore', 40, 32)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Reports & Analytics', 40, 48)

  // Title block
  doc.setTextColor(ink)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 40, 92)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(inkSoft)
  doc.text(subtitle, 40, 108)

  let cursorY = 130

  // Summary rows
  if (summaryRows && Object.keys(summaryRows).length) {
    const entries = Object.entries(summaryRows)
    doc.setFontSize(10)
    doc.setTextColor(ink)
    entries.forEach(([k, v], i) => {
      const x = 40 + (i % 2) * 260
      const y = cursorY + Math.floor(i / 2) * 18
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(inkSoft)
      doc.text(`${k}:`, x, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(ink)
      doc.text(String(v), x + 110, y)
    })
    cursorY += Math.ceil(entries.length / 2) * 18 + 14
  }

  // Table
  autoTable(doc, {
    startY: cursorY,
    head: [columns.map((c) => c.label)],
    body: rows.map((r) =>
      columns.map((c) => {
        const raw = r[c.key]
        return c.format ? c.format(raw, r) : String(raw ?? '')
      }),
    ),
    theme: 'grid',
    headStyles: { fillColor: primary, textColor: '#FFFFFF', fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: ink },
    alternateRowStyles: { fillColor: '#FAFAFA' },
    margin: { left: 40, right: 40 },
    columnStyles: columns.reduce((acc, c, i) => {
      if (c.align) acc[i] = { halign: c.align }
      return acc
    }, {}),
  })

  // Footer
  const finalY = doc.lastAutoTable?.finalY || cursorY
  doc.setFontSize(8)
  doc.setTextColor(inkSoft)
  doc.text(
    `Generated on ${new Date().toLocaleString('en-GB')}  ·  MeStore POS System`,
    40,
    finalY + 24,
  )

  doc.save(filename)
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Small helper to normalize a Rupiah string for CSV numeric columns.
 * Exported so pages can build their own column definitions cleanly.
 */
export const exportFormatters = {
  rupiah: (v) => formatRupiah(v),
  number: (v) => Number(v || 0).toLocaleString('id-ID'),
  percent: (v) => `${v}%`,
}