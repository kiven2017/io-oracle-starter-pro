let activeScrollLocks = 0
let previousOverflow = ''
let previousPaddingRight = ''

export function lockBodyScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {}
  }

  const body = document.body

  if (activeScrollLocks === 0) {
    previousOverflow = body.style.overflow
    previousPaddingRight = body.style.paddingRight

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const computedPaddingRight = Number.parseFloat(window.getComputedStyle(body).paddingRight || '0') || 0

    body.style.overflow = 'hidden'

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${computedPaddingRight + scrollbarWidth}px`
    }
  }

  activeScrollLocks += 1

  return () => {
    activeScrollLocks = Math.max(0, activeScrollLocks - 1)

    if (activeScrollLocks === 0) {
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }
}
