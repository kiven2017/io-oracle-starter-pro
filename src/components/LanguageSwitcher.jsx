import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../context/LocaleContext'

function FlagIcon({ countryCode }) {
  const code = countryCode?.toUpperCase()

  if (code === 'US') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#fff" />
        <rect width="24" height="2" y="0" fill="#b91c1c" />
        <rect width="24" height="2" y="4" fill="#b91c1c" />
        <rect width="24" height="2" y="8" fill="#b91c1c" />
        <rect width="24" height="2" y="12" fill="#b91c1c" />
        <rect width="10" height="8" fill="#1d4ed8" />
      </svg>
    )
  }

  if (code === 'CN') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#dc2626" />
        <circle cx="6" cy="5" r="2.2" fill="#fde047" />
      </svg>
    )
  }

  if (code === 'TH') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#dc2626" />
        <rect y="3" width="24" height="2" fill="#fff" />
        <rect y="5" width="24" height="6" fill="#1d4ed8" />
        <rect y="11" width="24" height="2" fill="#fff" />
      </svg>
    )
  }

  if (code === 'KH') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#1d4ed8" />
        <rect y="3" width="24" height="10" fill="#dc2626" />
      </svg>
    )
  }

  if (code === 'DE') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#f59e0b" />
        <rect width="24" height="10.6" fill="#dc2626" />
        <rect width="24" height="5.3" fill="#111827" />
      </svg>
    )
  }

  if (code === 'IT') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#fff" />
        <rect width="8" height="16" fill="#16a34a" />
        <rect x="16" width="8" height="16" fill="#dc2626" />
      </svg>
    )
  }

  if (code === 'ES') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#dc2626" />
        <rect y="4" width="24" height="8" fill="#facc15" />
      </svg>
    )
  }

  if (code === 'JP') {
    return (
      <svg viewBox="0 0 24 16" className="h-4 w-6 rounded-[3px]">
        <rect width="24" height="16" fill="#fff" />
        <circle cx="12" cy="8" r="4" fill="#dc2626" />
      </svg>
    )
  }

  return <span className="text-xs font-bold uppercase text-white">{code}</span>
}

function LanguageBadge({ countryCode, active = false }) {
  return (
    <span
      className={`inline-flex min-w-9 items-center justify-center rounded-md px-1.5 py-1 ${
        active ? 'bg-cyan-300/16' : 'bg-white/10'
      }`}
      aria-hidden="true"
    >
      <FlagIcon countryCode={countryCode} />
    </span>
  )
}

export default function LanguageSwitcher({ mobile = false, compact = false }) {
  const { locale, setLocale, localeInfo, languages, content } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const toggleClass = mobile
    ? 'w-full px-3.5 py-3 text-left'
    : compact
      ? 'w-full min-w-[152px] px-3.5 py-2.5 text-left sm:w-auto sm:min-w-[168px]'
      : 'min-w-[168px] px-3.5 py-2.5 text-left'

  return (
    <div
      ref={wrapperRef}
      className={`relative ${mobile ? 'w-full' : compact ? 'w-full sm:w-auto' : 'min-w-[168px]'}`}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={content.languageLabel}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex items-center gap-2.5 rounded-[1.35rem] border border-cyan-200/18 bg-[#1d2c44] text-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.24)] transition-colors hover:border-cyan-300/30 hover:bg-[#243754] ${toggleClass}`}
      >
        <LanguageBadge countryCode={localeInfo.countryCode} active />
        <div className="min-w-0 flex-1">
          <div className={`${mobile ? 'text-[0.95rem]' : 'text-[0.92rem]'} truncate font-bold leading-none text-white`}>
            {localeInfo.nativeLabel}
          </div>
        </div>
        <ChevronDown
          className={`h-4.5 w-4.5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className={`absolute z-[90] mt-2 overflow-hidden rounded-[1.1rem] border border-cyan-100/22 bg-[#17283f] shadow-[0_24px_60px_rgba(0,0,0,0.42)] ${
            mobile ? 'left-0 right-0' : 'left-0 min-w-full'
          }`}
        >
          <div className="max-h-[20rem] overflow-y-auto py-1">
            {languages.map((language) => {
              const isActive = language.id === locale

              return (
                <button
                  key={language.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setIsOpen(false)
                    window.setTimeout(() => {
                      setLocale(language.id)
                    }, 0)
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-sky-200 text-slate-950' : 'text-white hover:bg-white/8'
                  }`}
                >
                  <LanguageBadge countryCode={language.countryCode} active={!isActive} />
                  <span className={`${mobile ? 'text-[0.95rem]' : 'text-[0.9rem]'} min-w-0 flex-1 truncate font-semibold leading-none`}>
                    {language.nativeLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
