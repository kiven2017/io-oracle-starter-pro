import { useEffect, useMemo, useRef, useState } from 'react'
import BackgroundDecor from './components/BackgroundDecor'
import GlobalLoader from './components/GlobalLoader'
import Navbar from './components/Navbar'
import PriceTableModal from './components/PriceTableModal'
import WalletLoginSuccessToast from './components/WalletLoginSuccessToast'
import CoreSections from './components/sections/CoreSections'
import EcosystemSections from './components/sections/EcosystemSections'
import HeroSection from './components/sections/HeroSection'
import { useLocale } from './context/LocaleContext'
import { getWalletProvider } from './data/checkoutOptions'
import { getFlowText } from './data/flowText'
import { PRESALE_CONFIG, getPriceStages } from './data/presaleConfig'
import useActiveSection from './hooks/useActiveSection'
import useCountdown from './hooks/useCountdown'
import useScrollEffects from './hooks/useScrollEffects'
import { fetchPresaleLiveStatus } from './lib/presaleLiveStatus'
import { lockBodyScroll } from './lib/scrollLock'

const DEFAULT_PRESALE_FALLBACK_SECONDS = 100 * 86400 + 23 * 3600 + 59 * 60 + 59
const DEFAULT_PRESALE_PROGRESS_PERCENT = 80
const OBSERVED_SECTIONS = ['experts', 'durian', 'whitepaper', 'tech', 'advisors']

function formatWalletLabel(address) {
  if (!address) {
    return ''
  }

  if (address.length <= 12) {
    return address
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function App() {
  const { content, locale } = useLocale()
  const flowText = useMemo(() => getFlowText(locale), [locale])
  const fallbackCountdownTargetRef = useRef(Date.now() + DEFAULT_PRESALE_FALLBACK_SECONDS * 1000)
  const [isPriceTableOpen, setIsPriceTableOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [connectedWalletInfo, setConnectedWalletInfo] = useState(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [globalLoaderState, setGlobalLoaderState] = useState({
    active: false,
    label: '',
    message: '',
  })
  const [walletSuccessNotice, setWalletSuccessNotice] = useState(null)
  const [presaleLiveStatus, setPresaleLiveStatus] = useState({
    countdownEndAt: null,
    progressPercent: null,
    remainingAio: null,
    auditLinks: null,
  })
  const walletSuccessTimeoutRef = useRef(null)

  const resolvedCountdownTargetMs = useMemo(() => {
    const parsedTargetMs = presaleLiveStatus.countdownEndAt ? Date.parse(presaleLiveStatus.countdownEndAt) : Number.NaN
    return Number.isFinite(parsedTargetMs) ? parsedTargetMs : fallbackCountdownTargetRef.current
  }, [presaleLiveStatus.countdownEndAt])
  const resolvedProgressPercent = useMemo(() => {
    const nextValue = Number(presaleLiveStatus.progressPercent)
    if (!Number.isFinite(nextValue)) {
      return DEFAULT_PRESALE_PROGRESS_PERCENT
    }

    return Math.min(Math.max(nextValue, 0), 100)
  }, [presaleLiveStatus.progressPercent])
  const resolvedRemainingAio = useMemo(() => {
    const nextValue = Number(presaleLiveStatus.remainingAio)
    if (!Number.isFinite(nextValue)) {
      return PRESALE_CONFIG.remainingAio
    }

    return Math.max(Math.floor(nextValue), 0)
  }, [presaleLiveStatus.remainingAio])
  const countdownText = useCountdown(resolvedCountdownTargetMs, locale)
  const { scrollY, isScrolled } = useScrollEffects()
  const activeSection = useActiveSection(OBSERVED_SECTIONS)
  const presaleHref = '#presale'
  const priceStages = getPriceStages(PRESALE_CONFIG.currentStage)

  useEffect(() => {
    let cancelled = false

    async function loadPresaleLiveStatus() {
      try {
        const nextStatus = await fetchPresaleLiveStatus()
        if (!cancelled) {
          setPresaleLiveStatus(nextStatus)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to load presale live status.', error)
        }
      }
    }

    void loadPresaleLiveStatus()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setIsPageLoading(false)
    }, 3000)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    const shouldLockScroll = isPriceTableOpen || isMobileMenuOpen
    if (!shouldLockScroll) {
      return undefined
    }

    const releaseScrollLock = lockBodyScroll()

    return () => {
      releaseScrollLock()
    }
  }, [isMobileMenuOpen, isPriceTableOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsPriceTableOpen(false)
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const handleWalletState = (event) => {
      const nextAddress = event.detail?.address ?? ''
      const providerId = event.detail?.providerId ?? ''
      const provider = getWalletProvider(providerId)

      if (!nextAddress) {
        setConnectedWalletInfo(null)
        return
      }

      setConnectedWalletInfo({
        label: formatWalletLabel(nextAddress),
        providerId,
        providerName: event.detail?.providerName ?? provider?.name ?? '',
        brand: provider?.brand ?? event.detail?.network ?? '',
      })
    }

    window.addEventListener('aioracle:wallet-state', handleWalletState)

    return () => {
      window.removeEventListener('aioracle:wallet-state', handleWalletState)
    }
  }, [])

  useEffect(() => {
    const handleGlobalLoader = (event) => {
      const nextDetail = event.detail ?? {}

      setGlobalLoaderState((current) => ({
        active: Boolean(nextDetail.active),
        label: nextDetail.label ?? current.label ?? '',
        message: nextDetail.message ?? current.message ?? '',
      }))
    }

    window.addEventListener('aioracle:global-loader', handleGlobalLoader)

    return () => {
      window.removeEventListener('aioracle:global-loader', handleGlobalLoader)
    }
  }, [])

  useEffect(() => {
    const handleCloseMobileMenu = () => {
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('aioracle:close-mobile-menu', handleCloseMobileMenu)

    return () => {
      window.removeEventListener('aioracle:close-mobile-menu', handleCloseMobileMenu)
    }
  }, [])

  useEffect(() => {
    const showSuccessNotice = (title, message) => {
      if (walletSuccessTimeoutRef.current) {
        window.clearTimeout(walletSuccessTimeoutRef.current)
      }

      setWalletSuccessNotice({
        title,
        message,
      })

      walletSuccessTimeoutRef.current = window.setTimeout(() => {
        setWalletSuccessNotice(null)
        walletSuccessTimeoutRef.current = null
      }, 2400)
    }

    const handleWalletLoginSuccess = (event) => {
      const providerName = event.detail?.providerName || 'Wallet'

      showSuccessNotice(
        flowText.successNotice.walletConnectedTitle,
        flowText.interpolate(flowText.successNotice.walletConnectedMessage, {
          provider: providerName,
        }),
      )
    }

    const handleSuccessNotice = (event) => {
      const title = String(event.detail?.title || '').trim()
      const message = String(event.detail?.message || '').trim()

      if (!title || !message) {
        return
      }

      showSuccessNotice(title, message)
    }

    window.addEventListener('aioracle:wallet-login-success', handleWalletLoginSuccess)
    window.addEventListener('aioracle:success-notice', handleSuccessNotice)

    return () => {
      window.removeEventListener('aioracle:wallet-login-success', handleWalletLoginSuccess)
      window.removeEventListener('aioracle:success-notice', handleSuccessNotice)
    }
  }, [flowText])

  useEffect(
    () => () => {
      if (walletSuccessTimeoutRef.current) {
        window.clearTimeout(walletSuccessTimeoutRef.current)
      }
    },
    [],
  )

  const navigateTo = (href) => {
    setIsMobileMenuOpen(false)

    const target = document.querySelector(href)
    if (target) {
      const navbar = document.querySelector('#navbar')
      const navbarHeight = navbar?.getBoundingClientRect().height ?? 112
      const targetTop = target.getBoundingClientRect().top + window.scrollY
      const offsetTop = Math.max(targetTop - navbarHeight - 24, 0)

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      })
    }
  }

  const openPresaleWallet = () => {
    navigateTo(presaleHref)
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('aioracle:open-wallet-modal', {
          detail: { mode: 'login' },
        }),
      )
    }, 300)
  }

  const handleWalletAction = () => {
    if (connectedWalletInfo?.label) {
      setIsMobileMenuOpen(false)
      window.dispatchEvent(new CustomEvent('aioracle:open-wallet-overview'))
      return
    }

    openPresaleWallet()
  }

  const loaderLabel = isPageLoading
    ? content.loading.label
    : globalLoaderState.label || content.loading.label
  const loaderMessage = isPageLoading
    ? content.loading.message
    : globalLoaderState.message || content.loading.message

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#020617] text-slate-200 antialiased">
      <GlobalLoader
        active={isPageLoading || globalLoaderState.active}
        label={loaderLabel}
        message={loaderMessage}
      />
      <WalletLoginSuccessToast
        open={Boolean(walletSuccessNotice)}
        title={walletSuccessNotice?.title ?? ''}
        message={walletSuccessNotice?.message ?? ''}
      />
      <BackgroundDecor scrollY={scrollY} />

      <Navbar
        navItems={content.navItems}
        activeSection={activeSection}
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        connectedWalletInfo={connectedWalletInfo}
        onToggleMobileMenu={() => setIsMobileMenuOpen((current) => !current)}
        onNavigate={navigateTo}
        onJoinPresale={handleWalletAction}
      />

      <main className="relative z-10">
        <HeroSection
          countdownText={countdownText}
          onOpenPriceTable={() => setIsPriceTableOpen(true)}
          scrollY={scrollY}
          onJoinPresale={handleWalletAction}
          onWhitepaper={() => navigateTo('#whitepaper')}
          isWalletConnected={Boolean(connectedWalletInfo?.label)}
          presaleProgressPercent={resolvedProgressPercent}
          presaleRemainingAio={resolvedRemainingAio}
          auditLinks={presaleLiveStatus.auditLinks}
        />

        <CoreSections onJoinPresale={() => navigateTo(presaleHref)} />

        <EcosystemSections
          openFaqIndex={openFaqIndex}
          onFaqToggle={(index) => {
            setOpenFaqIndex((currentIndex) => (currentIndex === index ? -1 : index))
          }}
          onJoinPresale={() => navigateTo(presaleHref)}
        />
      </main>

      <PriceTableModal
        open={isPriceTableOpen}
        onClose={() => setIsPriceTableOpen(false)}
        priceStages={priceStages}
      />
    </div>
  )
}
