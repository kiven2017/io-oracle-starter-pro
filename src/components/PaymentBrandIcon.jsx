function IconWrap({ children, className = '' }) {
  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`.trim()}>
      {children}
    </div>
  )
}

export default function PaymentBrandIcon({ brand, className = '' }) {
  if (brand === 'ethereum') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <path fill="#8EA2FF" d="M12 2 6.6 12 12 9.6 17.4 12 12 2Z" />
          <path fill="#627EEA" d="M12 9.6 6.6 12 12 15.2 17.4 12 12 9.6Z" />
          <path fill="#C4D0FF" d="M12 16.2 6.6 13 12 22 17.4 13 12 16.2Z" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'solana') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <defs>
            <linearGradient id="solGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9CFF8F" />
              <stop offset="100%" stopColor="#63E3D0" />
            </linearGradient>
          </defs>
          <path fill="url(#solGradient)" d="M7 5.5h10.8L15.7 8H5Z" />
          <path fill="url(#solGradient)" d="M8.3 10h10.8l-2.1 2.5H6.2Z" />
          <path fill="url(#solGradient)" d="M7 14.5h10.8L15.7 17H5Z" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'binance') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <path fill="#F3BA2F" d="m12 3 2.6 2.6L12 8.2 9.4 5.6 12 3Zm-4.4 4.4 2.6 2.6-2.6 2.6L5 10l2.6-2.6Zm8.8 0L19 10l-2.6 2.6-2.6-2.6 2.6-2.6ZM12 11.8l2.6 2.6L12 17l-2.6-2.6 2.6-2.6Zm-4.4 4.4L10.2 19 7.6 21.6 5 19l2.6-2.8Zm8.8 0L19 19l-2.6 2.6-2.6-2.6 2.6-2.8Z" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'walletconnect') {
    return (
      <IconWrap className={`${className} rounded-lg bg-[#3b99fc]`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4/5 w-4/5">
          <path
            fill="#fff"
            d="M8.6 9.5a4.9 4.9 0 0 1 6.8 0l.3.3a.5.5 0 0 1 0 .7l-1 1a.5.5 0 0 1-.7 0l-.5-.5a2.2 2.2 0 0 0-3 0l-.6.5a.5.5 0 0 1-.7 0l-1-1a.5.5 0 0 1 0-.7l.4-.3Zm8.8 1.7.9.8a.5.5 0 0 1 0 .8l-4 4a.5.5 0 0 1-.7 0l-2.8-2.8a.2.2 0 0 0-.3 0l-2.8 2.8a.5.5 0 0 1-.7 0l-4-4a.5.5 0 0 1 0-.8l.9-.8a.5.5 0 0 1 .7 0l2.8 2.8a.2.2 0 0 0 .3 0l2.8-2.8a.5.5 0 0 1 .7 0l2.8 2.8a.2.2 0 0 0 .3 0l2.8-2.8a.5.5 0 0 1 .7 0Z"
          />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'metamask') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <path fill="#E17726" d="m4 4.3 6.2 4.6-1 2.2-5.2-1.5L4 4.3Zm16 0-.1 5.3-5.2 1.5-1-2.2L20 4.3Z" />
          <path fill="#F6851B" d="m5 10 4.1 1.2 1.4 4.4-3 2.1L5 10Zm14 0-2.5 7.7-3-2.1 1.4-4.4L19 10Z" />
          <path fill="#763D16" d="m8 19 2.2-2.1h3.6L16 19l-2.5 1.7H10.5L8 19Z" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'safepal') {
    return (
      <IconWrap className={`${className} rounded-lg bg-[#5a2ff5]`}>
        <span className="font-heading text-[0.8em] font-black text-white">S</span>
      </IconWrap>
    )
  }

  if (brand === 'trustwallet') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <path fill="#F3F4F6" d="M12 3 5 5.2v5.5c0 4.4 3 8.3 7 9.3 4-1 7-4.9 7-9.3V5.2L12 3Z" />
          <path fill="#1B6CFF" d="M12 6.2 8 7.5v3.2c0 2.8 1.8 5.4 4 6.2 2.2-.8 4-3.4 4-6.2V7.5l-4-1.3Z" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'coinbase') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <rect x="2" y="2" width="20" height="20" rx="6" fill="#1652F0" />
          <path
            fill="#fff"
            d="M12 6.2a5.8 5.8 0 1 0 0 11.6h3.3a.8.8 0 0 0 .8-.8v-2a.8.8 0 0 0-.8-.8H12a2.2 2.2 0 1 1 0-4.4h3.3a.8.8 0 0 0 .8-.8V7a.8.8 0 0 0-.8-.8H12Z"
          />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'phantom') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <path fill="#A78BFA" d="M12 4c4.4 0 8 2.8 8 6.6 0 2.8-2 5.2-4.8 6.2-.2 1.4-1.2 3.2-3.2 3.2-1 0-1.8-.5-2.2-1.3-.7.8-1.6 1.3-2.7 1.3-1.4 0-2.3-.9-2.8-2.2C2.7 16.8 2 15.1 2 13.4 2 8.2 6.5 4 12 4Z" />
          <circle cx="9.2" cy="12" r="1.1" fill="#2D1B69" />
          <circle cx="14.8" cy="12" r="1.1" fill="#2D1B69" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'tokenpocket') {
    return (
      <IconWrap className={`${className} rounded-lg bg-[linear-gradient(135deg,#60a5fa,#2563eb)]`}>
        <span className="text-[0.8em] font-black tracking-tight text-white">TP</span>
      </IconWrap>
    )
  }

  if (brand === 'bitget') {
    return (
      <IconWrap className={`${className} rounded-lg bg-[linear-gradient(135deg,#22d3ee,#38bdf8)]`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4/5 w-4/5">
          <path
            fill="#08111f"
            d="M5.8 6.1h10.1l-5.1 5 5.1 5H11l-5.2-5.1 5.1-4.9H5.8Zm7.2 0H18l-5.1 5H8l5-5Z"
          />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'solflare') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <defs>
            <linearGradient id="flareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="8.5" fill="url(#flareGradient)" />
          <path fill="#fff" d="M7 14.2 13.6 7H17l-5.5 6h5.1L11 20H7.7l4.5-5.8H7Z" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'mastercard') {
    return (
      <IconWrap className={className}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-full w-full">
          <circle cx="9.5" cy="12" r="5" fill="#EB001B" />
          <circle cx="14.5" cy="12" r="5" fill="#F79E1B" fillOpacity="0.95" />
        </svg>
      </IconWrap>
    )
  }

  if (brand === 'visa') {
    return (
      <IconWrap className={className}>
        <span className="text-[0.72em] font-black italic tracking-tight text-white">VISA</span>
      </IconWrap>
    )
  }

  if (brand === 'applepay') {
    return (
      <IconWrap className={className}>
        <span className="text-[0.72em] font-semibold tracking-tight text-white">Apple</span>
      </IconWrap>
    )
  }

  if (brand === 'gpay') {
    return (
      <IconWrap className={className}>
        <span className="text-[0.72em] font-semibold tracking-tight text-white">G Pay</span>
      </IconWrap>
    )
  }

  return (
    <IconWrap className={className}>
      <span className="text-[0.75em] font-black uppercase text-white">{brand}</span>
    </IconWrap>
  )
}
