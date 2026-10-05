import Swal from 'sweetalert2'

const RED = '#C8102E'
const RED_HOVER = '#A00D26'
const GREEN = '#15803D'
const GREEN_HOVER = '#166534'

function styleButton(btn, { color, hoverColor, transparent = false }) {
  if (!btn) return
  btn.style.background = transparent ? 'transparent' : color
  btn.style.color = transparent ? '#52525B' : '#fff'
  btn.style.border = transparent ? '1px solid #E4E4E7' : 'none'
  btn.style.borderRadius = '8px'
  btn.style.padding = '10px 18px'
  btn.style.fontWeight = transparent ? '500' : '600'
  btn.style.fontSize = '14px'
  btn.style.cursor = 'pointer'
  btn.style.transition = 'background 120ms ease, color 120ms ease'
  if (!transparent) {
    btn.addEventListener('mouseenter', () => (btn.style.background = hoverColor))
    btn.addEventListener('mouseleave', () => (btn.style.background = color))
  }
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
    const confirmColor = variant === 'success' ? GREEN : RED
    const confirmHover = variant === 'success' ? GREEN_HOVER : RED_HOVER

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
      customClass: {
        popup: 'swal-mestore-popup',
        title: 'swal-mestore-title',
        htmlContainer: 'swal-mestore-text',
      },
      // CRITICAL — prevent the underlying page from shifting:
      heightAuto: false, // do not override html/body height
      scrollbarPadding: false, // do not add scrollbar compensation padding
      // Swal normally adds padding-right to the body when it locks scroll.
      // Because we reserved the gutter in base.css, we don't need that.
      didOpen: (el) => {
        // Ensure the container sits above PrimeVue dialogs but doesn't reflow
        el.parentElement.style.paddingRight = '0'
        const confirmBtn = Swal.getConfirmButton()
        const cancelBtn = Swal.getCancelButton()
        styleButton(confirmBtn, { color: confirmColor, hoverColor: confirmHover })
        styleButton(cancelBtn, { color: '', hoverColor: '', transparent: true })
      },
    })

    if (result.isConfirmed && typeof opts.accept === 'function') {
      await opts.accept()
    }

    return result.isConfirmed
  }

  function alert(message, title = 'Notice') {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
      buttonsStyling: false,
      heightAuto: false,
      scrollbarPadding: false,
      customClass: {
        popup: 'swal-mestore-popup',
        title: 'swal-mestore-title',
        htmlContainer: 'swal-mestore-text',
      },
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton()
        styleButton(confirmBtn, { color: RED, hoverColor: RED_HOVER })
      },
    })
  }

  return { confirmAction, alert }
}