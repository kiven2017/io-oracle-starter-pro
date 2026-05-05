import { useMemo, useState } from 'react'

function createAvatarDataUri(name, initials, colors) {
  const [from, to] = colors
  const safeInitials = initials || name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
          <stop stop-color="${from}" />
          <stop offset="1" stop-color="${to}" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="48" fill="url(#g)" />
      <circle cx="160" cy="160" r="104" fill="rgba(255,255,255,0.08)" />
      <circle cx="160" cy="144" r="48" fill="rgba(255,255,255,0.16)" />
      <path d="M84 238c21-31 47-46 76-46s55 15 76 46" stroke="rgba(255,255,255,0.25)" stroke-width="24" stroke-linecap="round" />
      <text x="160" y="284" text-anchor="middle" fill="#F8FAFC" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="800" letter-spacing="10">${safeInitials}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export default function AvatarImage({
  src,
  alt,
  name,
  initials,
  colors,
  className,
}) {
  const [hasError, setHasError] = useState(false)
  const fallbackSrc = useMemo(() => createAvatarDataUri(name, initials, colors), [colors, initials, name])

  return (
    <img
      src={!hasError && src ? src : fallbackSrc}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  )
}
