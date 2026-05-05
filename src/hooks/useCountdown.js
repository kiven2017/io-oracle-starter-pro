import { useEffect, useState } from 'react'

function formatCountdown(secondsLeft, locale = 'en') {
  const safeSeconds = Math.max(Math.floor(Number(secondsLeft) || 0), 0)
  const days = Math.floor(safeSeconds / 86400)
  const hours = String(Math.floor((safeSeconds % 86400) / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(safeSeconds % 60).padStart(2, '0')
  const dayLabel = locale === 'zh' ? '天' : 'D '

  return `${days}${dayLabel}${hours}:${minutes}:${seconds}`
}

export default function useCountdown(targetTimestampMs, locale = 'en') {
  const resolveSecondsLeft = () => {
    const normalizedTarget = Number(targetTimestampMs)
    if (!Number.isFinite(normalizedTarget)) {
      return 0
    }

    return Math.max(Math.floor((normalizedTarget - Date.now()) / 1000), 0)
  }

  const [secondsLeft, setSecondsLeft] = useState(resolveSecondsLeft)

  useEffect(() => {
    setSecondsLeft(resolveSecondsLeft())
  }, [targetTimestampMs])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft(resolveSecondsLeft())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [targetTimestampMs])

  return formatCountdown(secondsLeft, locale)
}
