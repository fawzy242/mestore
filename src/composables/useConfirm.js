import Swal from 'sweetalert2'

/**
 * Reads the resolved CSS custom property value from the document.
 * Returns a fallback if the property is empty (e.g. before mount).
 */
function cssVar(name, fallback = '') {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
  return value || fallback
}

/**
 * Reads all the theme tokens needed to style SweetAlert2 buttons.
 * Called at the moment the alert opens, so it always reflects the
 * current light/dark mode.
 */
function getThemeTokens() {
  const dark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return {
    primary: cssVar('--primary', dark ? '#EF4444' : '#C8102E'),
    primaryHover: cssVar('--primary-hover', dark ? '#DC2626' : '#A00D26'),
    primaryActive: cssVar('--primary-active', dark ? '#B91C1C' : '#8B0B20'),
    danger: cssVar('--danger', dark ? '#F87171' : '#B91C1C'),
    dangerBg: cssVar('--danger-bg', dark ? '#2A1212' : '#FEE2E2'),
    success: cssVar('--success', dark ? '#4ADE80' : '#15803D'),
    successHover: dark ? '#166534' : '#166534',
    surface: cssVar('--surface', dark ? '#18181B' : '#FFFFFF'),
    surfaceHover: cssVar('--surface-hover', dark ? '#27272A' : '#F4F4F5'),
    border: cssVar('--border', dark ? '#27272A' : '#E4E4E7'),
    borderStrong: cssVar('--border-strong', dark ? '#3F3F46' : '#D4D4D8'),
    text: cssVar('--text', dark ? '#FAFAFA' : '#18181B'),
    textMuted: cssVar('--text-muted', dark ? '#A1A1AA' : '#71717A'),
  }
}

/**
 * Applies a consistent style to a SweetAlert button element.
 * @param {HTMLElement|null} btn
 * @param {Object} opts
 * @param {'primary'|'danger'|'success'|'ghost'} opts.variant
 * @param {Object} opts.t
 */
function styleButton(btn, { variant, t }) {
  if (!btn) return

  const base = {
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    lineHeight: '1',
    transition: 'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
    minWidth: '100px',
    fontFamily: 'inherit',
  }

  if (variant === 'primary') {
    Object.assign(btn.style, base, {
      background: t.primary,
      color: '#FFFFFF',
      border: '1px solid ' + t.primary,
    })
    btn.addEventListener('mouseenter', () => {
      btn.style.background = t.primaryHover
      btn.style.borderColor = t.primaryHover
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.background = t.primary
      btn.style.borderColor = t.primary
    })
    return
  }

  if (variant === 'danger') {
    Object.assign(btn.style, base, {
      background: t.danger,
      color: '#FFFFFF',
      border: '1px solid ' + t.danger,
    })
    btn.addEventListener('mouseenter', () => {
      btn.style.background = t.primaryActive
      btn.style.borderColor = t.primaryActive
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.background = t.danger
      btn.style.borderColor = t.danger
    })
    return
  }

  if (variant === 'success') {
    Object.assign(btn.style, base, {
      background: t.success,
      color: '#FFFFFF',
      border: '1px solid ' + t.success,
    })
    btn.addEventListener('mouseenter', () => {
      btn.style.background = t.successHover
      btn.style.borderColor = t.successHover
    })
    btn.addEventListener('mouseleave', () => {
      btn.style.background = t.success
      btn.style.borderColor = t.success
    })
    return
  }

  // ghost — Cancel
  Object.assign(btn.style, base, {
    background: 'transparent',
    color: t.textMuted,
    border: '1px solid ' + t.borderStrong,
    fontWeight: '500',
  })
  btn.addEventListener('mouseenter', () => {
    btn.style.background = t.surfaceHover
    btn.style.color = t.text
    btn.style.borderColor = t.borderStrong
  })
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'transparent'
    btn.style.color = t.textMuted
    btn.style.borderColor = t.borderStrong
  })
}

export function useConfirm() {
  /**
   * @param {Object} opts
   * @param {string} opts.header
   * @param {string} opts.message
   * @param {string} [opts.acceptLabel]
   * @param {string} [opts.rejectLabel]
   * @param {'danger'|'primary'|'success'} [opts.variant]
   * @param {() => Promise<void>|void} [opts.accept]
   */
  async function confirmAction(opts) {
    const variant = opts.variant || 'danger'
    const t = getThemeTokens()

    const confirmVariant =
      variant === 'success' ? 'success' : variant === 'primary' ? 'primary' : 'danger'

    const result = await Swal.fire({
      title: opts.header || 'Are you sure?',
      text: opts.message || '',
      icon: variant === 'success' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: opts.acceptLabel || 'Confirm',
      cancelButtonText: opts.rejectLabel || 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      heightAuto: false,
      scrollbarPadding: false,
      background: t.surface,
      color: t.text,
      customClass: {
        popup: 'swal-mestore-popup',
        title: 'swal-mestore-title',
        htmlContainer: 'swal-mestore-text',
      },
      didOpen: (el) => {
        // Prevent Swal from compensating for a scrollbar (page jump fix)
        if (el?.parentElement) el.parentElement.style.paddingRight = '0'

        // Restyle the SweetAlert popup to follow the current theme
        const popup = Swal.getPopup()
        if (popup) {
          popup.style.background = t.surface
          popup.style.color = t.text
          popup.style.border = '1px solid ' + t.border
          popup.style.borderRadius = '12px'
        }

        const title = Swal.getTitle()
        if (title) title.style.color = t.text

        const html = Swal.getHtmlContainer()
        if (html) html.style.color = t.textMuted

        styleButton(Swal.getConfirmButton(), { variant: confirmVariant, t })
        styleButton(Swal.getCancelButton(), { variant: 'ghost', t })
      },
    })

    if (result.isConfirmed && typeof opts.accept === 'function') {
      await opts.accept()
    }

    return result.isConfirmed
  }

  function alert(message, title = 'Notice') {
    const t = getThemeTokens()
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      buttonsStyling: false,
      heightAuto: false,
      scrollbarPadding: false,
      background: t.surface,
      color: t.text,
      customClass: {
        popup: 'swal-mestore-popup',
        title: 'swal-mestore-title',
        htmlContainer: 'swal-mestore-text',
      },
      didOpen: () => {
        const popup = Swal.getPopup()
        if (popup) {
          popup.style.background = t.surface
          popup.style.color = t.text
          popup.style.border = '1px solid ' + t.border
          popup.style.borderRadius = '12px'
        }
        const title = Swal.getTitle()
        if (title) title.style.color = t.text
        const html = Swal.getHtmlContainer()
        if (html) html.style.color = t.textMuted
        styleButton(Swal.getConfirmButton(), { variant: 'primary', t })
      },
    })
  }

  return { confirmAction, alert }
}