import { useEffect, useState } from 'react'

export default function useScrollEffects() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let frameId = 0

    const updateScroll = () => {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0)
        frameId = 0
      })
    }

    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateScroll)
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return {
    scrollY,
    isScrolled: scrollY > 50,
  }
}
