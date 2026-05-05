import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Download, ExternalLink, Globe, LoaderCircle, Monitor, Smartphone, X } from 'lucide-react'
import Modal from './Modal'
import PaymentBrandIcon from './PaymentBrandIcon'
import { buildWalletRoute, generateWalletQrDataUrl } from '../lib/solanaWalletDeeplinks'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'

const routeCache = new Map()

function WalletProviderQrModal({
  open,
  onClose,
  provider,
  onContinue,
  saleEnvironmentId = 'devnet',
  networkId = '',
  flowMode = 'purchase',
  prefetchedRoute = null,
  waitForPrefetchedRoute = false,
  awaitingWalletConfirmation = false,
}) {
  const { locale } = useLocale()
  const flowText = getFlowText(locale)
  const text = flowText.qrModal
  const [activeTab, setActiveTab] = useState('mobile')
  const [copied, setCopied] = useState(false)
  const [connectLink, setConnectLink] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkSource, setLinkSource] = useState('none')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrState, setQrState] = useState('idle')
  const routeCacheRef = useRef(null)
  const safeProvider = useMemo(
    () => ({
      id: provider?.id ?? '',
      name: provider?.name ?? '',
      brand: provider?.brand ?? 'walletconnect',
      groupId: provider?.groupId ?? '',
      installUrl: provider?.installUrl ?? '',
      mobileInstallUrl: provider?.mobileInstallUrl ?? '',
    }),
    [provider?.brand, provider?.groupId, provider?.id, provider?.installUrl, provider?.mobileInstallUrl, provider?.name],
  )
  const providerRouteKey = `${safeProvider.id}:${safeProvider.groupId}:${safeProvider.installUrl}:${safeProvider.mobileInstallUrl}:${safeProvider.name}`
  const showBrowserInstall = activeTab === 'browser' && (safeProvider.installUrl || safeProvider.mobileInstallUrl)
  const showQr = !showBrowserInstall
  const isSolanaProvider = safeProvider.groupId === 'solana'
  const isEvmProvider = safeProvider.groupId === 'evm'
  const canUseExtensionFallback = isSolanaProvider && qrState === 'error' && typeof onContinue === 'function'
  const canUseQrActions = showQr && Boolean(connectLink) && qrState === 'ready'
  const canOpenQrLink = canUseQrActions && !String(connectLink).trim().toLowerCase().startsWith('wc:')
  const isAwaitingWalletConfirmation = awaitingWalletConfirmation && isEvmProvider && showQr

  useEffect(() => {
    if (!open) {
      if (routeCacheRef.current?.key) {
        routeCache.delete(routeCacheRef.current.key)
      }
      routeCacheRef.current = null
      return
    }

    let cancelled = false
    const cacheKey = `${providerRouteKey}:${activeTab}:${flowMode}:${saleEnvironmentId}:${networkId}`

    async function resolveWalletRoute() {
      if (waitForPrefetchedRoute && isEvmProvider && !prefetchedRoute) {
        setQrState('loading')
        return
      }

      const cachedEntry = routeCacheRef.current?.key === cacheKey ? routeCacheRef.current : routeCache.get(cacheKey)

      if (cachedEntry) {
        routeCacheRef.current = cachedEntry
        const cachedRoute = cachedEntry.route
        setConnectLink(cachedRoute.link)
        setLinkLabel(cachedRoute.label)
        setLinkSource(cachedRoute.source)
        setQrDataUrl(cachedEntry.qrDataUrl ?? '')
        setQrState(cachedEntry.qrState ?? (cachedRoute.link ? 'ready' : 'idle'))
        return
      }

      const route =
        prefetchedRoute && isEvmProvider
          ? prefetchedRoute
          : await buildWalletRoute({
              provider: safeProvider,
              mode: activeTab,
              flowMode,
              environmentId: saleEnvironmentId,
              networkId,
            })

      if (cancelled) {
        return
      }

      setConnectLink(route.link)
      setLinkLabel(route.label)
      setLinkSource(route.source)

      if (activeTab === 'browser' || !route.link) {
        const nextEntry = {
          key: cacheKey,
          route,
          qrDataUrl: '',
          qrState: 'idle',
        }
        routeCacheRef.current = nextEntry
        routeCache.set(cacheKey, nextEntry)
        setQrDataUrl('')
        setQrState('idle')
        return
      }

      setQrState('loading')

      try {
        const nextQrDataUrl = await generateWalletQrDataUrl(route.qrLink ?? route.link)
        if (!cancelled) {
          const nextEntry = {
            key: cacheKey,
            route,
            qrDataUrl: nextQrDataUrl,
            qrState: 'ready',
          }
          routeCacheRef.current = nextEntry
          routeCache.set(cacheKey, nextEntry)
          setQrDataUrl(nextQrDataUrl)
          setQrState('ready')
        }
      } catch {
        if (!cancelled) {
          const nextEntry = {
            key: cacheKey,
            route,
            qrDataUrl: '',
            qrState: 'error',
          }
          routeCacheRef.current = nextEntry
          routeCache.set(cacheKey, nextEntry)
          setQrDataUrl('')
          setQrState('error')
        }
      }
    }

    resolveWalletRoute()

    return () => {
      cancelled = true
    }
  }, [activeTab, flowMode, isEvmProvider, networkId, open, prefetchedRoute, providerRouteKey, safeProvider, saleEnvironmentId, waitForPrefetchedRoute])

  if (!provider) {
    return null
  }

  const handleCopy = async () => {
    if (!connectLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(connectLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  const handleOpenLink = () => {
    if (!connectLink) {
      return
    }

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent || navigator.vendor || '' : ''
    const shouldUseSameTabNavigation = isSolanaProvider || /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)

    if (shouldUseSameTabNavigation) {
      window.location.assign(connectLink)
      return
    }

    window.open(connectLink, '_blank', 'noopener,noreferrer')
  }

  const helperText = showBrowserInstall
    ? flowText.interpolate(text.extensionDescription, { provider: provider.name })
    : activeTab === 'webapp'
      ? flowText.interpolate(text.webappDescription, { provider: provider.name })
      : isSolanaProvider
        ? flowText.interpolate(text.solanaDescription, { provider: provider.name })
        : isEvmProvider
          ? text.evmDescription
          : flowText.interpolate(text.genericDescription, { provider: provider.name })

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-[660px] rounded-t-[2rem] border border-white/10 bg-[#232323]/95 p-4 pb-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:max-w-[700px] md:rounded-[2.15rem] md:p-6"
    >
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-400 md:text-[11px] md:tracking-[0.3em]">{text.walletProvider}</p>
            <h3 className="mt-1.5 text-[1.45rem] font-semibold leading-tight md:text-[2.25rem]">{provider.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:text-white"
            aria-label={text.closeQrModal}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-[1.1rem] bg-white/5 p-1 md:inline-flex md:rounded-full">
          {[
            { id: 'mobile', label: text.mobile, icon: Smartphone },
            { id: 'webapp', label: text.webapp, icon: Monitor },
            { id: 'browser', label: text.browser, icon: Globe },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id)
                  setCopied(false)
                }}
                className={`flex items-center justify-center gap-2 rounded-[0.9rem] px-3 py-2 text-sm transition-colors md:rounded-full md:px-3 md:py-1.5 ${
                  active ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {showQr ? (
          <div className="relative mx-auto w-full max-w-[300px] rounded-[1.35rem] bg-white p-3 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] md:max-w-[360px] md:rounded-[1.6rem] md:p-4">
            {qrState === 'ready' && qrDataUrl ? (
              <>
                <img
                  src={qrDataUrl}
                  alt={flowText.interpolate(text.qrAlt, { provider: safeProvider.name, tab: activeTab })}
                  className="h-auto w-full rounded-[1.1rem] bg-white"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1rem] bg-[#111313] shadow-2xl md:h-20 md:w-20 md:rounded-[1.2rem]">
                    <PaymentBrandIcon brand={safeProvider.brand} className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-[1rem] bg-white px-5 py-7 text-center text-[#111313] md:min-h-[320px] md:rounded-[1.1rem] md:px-6 md:py-8">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-[1rem] bg-[#111313] text-white">
                  <PaymentBrandIcon brand={safeProvider.brand} className="h-9 w-9" />
                  {qrState !== 'error' ? (
                    <div className="absolute -right-2 -top-2 rounded-full bg-cyan-400 p-1 text-[#081108] shadow-lg">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    </div>
                  ) : null}
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {qrState === 'error' ? text.unableToGenerateQr : text.loadingWalletQr}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {qrState === 'error'
                      ? text.copyLink
                      : waitForPrefetchedRoute && isEvmProvider
                        ? text.preparingWalletConnectLogin
                        : text.generatingSecureWalletLink}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="space-y-2 text-center">
          <p className="text-[1.1rem] font-medium leading-tight md:text-2xl">
            {showBrowserInstall
              ? flowText.interpolate(text.installExtension, { provider: provider.name })
              : activeTab === 'webapp'
                ? flowText.interpolate(text.openWebRoute, { provider: provider.name })
                : text.scanQrWithPhone}
          </p>
          <p className="text-[0.92rem] leading-6 text-slate-400 md:text-sm">{helperText}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          {provider.installUrl || provider.mobileInstallUrl ? (
            <a
              href={provider.mobileInstallUrl || provider.installUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-white/10 bg-white/5 px-5 py-3 text-base font-medium transition-colors hover:bg-white/10 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              {showBrowserInstall ? text.openExtensionPage : text.getApp}
            </a>
          ) : null}
          {showQr ? (
            <>
              <button
                type="button"
                onClick={handleOpenLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-white/10 bg-white/5 px-5 py-3 text-base font-medium transition-colors hover:bg-white/10 sm:w-auto"
                disabled={!canOpenQrLink}
              >
                <ExternalLink className="h-4 w-4" />
                {activeTab === 'webapp' ? text.openWebappRoute : text.openMobileLink}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[1.1rem] border border-white/10 bg-white/5 px-5 py-3 text-base font-medium transition-colors hover:bg-white/10 sm:w-auto"
                disabled={!canUseQrActions}
              >
                <Copy className="h-4 w-4" />
                {copied ? text.copied : text.copyLink}
              </button>
              {!isSolanaProvider && canUseQrActions ? (
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={isAwaitingWalletConfirmation}
                  className="w-full rounded-[1.1rem] bg-gradient-to-r from-lime-300 to-[#63e3d0] px-5 py-3 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#081108] sm:w-auto sm:text-base sm:tracking-[0.14em]"
                >
                  {isAwaitingWalletConfirmation ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      {text.continueAfterScan}
                    </span>
                  ) : (
                    text.continueAfterScan
                  )}
                </button>
              ) : null}
              {canUseExtensionFallback ? (
                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full rounded-[1.1rem] bg-gradient-to-r from-lime-300 to-[#63e3d0] px-5 py-3 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#081108] sm:w-auto sm:text-base sm:tracking-[0.14em]"
                >
                  {text.useBrowserExtension}
                </button>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="rounded-[1.25rem] border border-white/6 bg-white/5 px-4 py-3 text-[0.92rem] leading-6 text-slate-400 md:rounded-[1.4rem] md:text-sm">
          {showBrowserInstall
            ? flowText.interpolate(text.afterInstall, { provider: provider.name })
            : qrState === 'error'
              ? flowText.interpolate(text.routeGenerationFailed, {
                  provider: provider.name,
                  hint: isSolanaProvider ? text.routeGenerationFailedSolanaHint : text.routeGenerationFailedEvmHint,
                })
              : (waitForPrefetchedRoute || isAwaitingWalletConfirmation) && isEvmProvider
                ? flowText.interpolate(text.keepModalOpen, { provider: provider.name })
                : flowText.interpolate(text.routePrepared, {
                    label: linkLabel || provider.name,
                    routeType: linkSource === 'connect' ? text.routeTypeConnect : text.routeTypeWallet,
                  })}
        </div>
      </div>
    </Modal>
  )
}

function areQrModalPropsEqual(previousProps, nextProps) {
  return (
    previousProps.open === nextProps.open &&
    previousProps.saleEnvironmentId === nextProps.saleEnvironmentId &&
    previousProps.networkId === nextProps.networkId &&
    previousProps.flowMode === nextProps.flowMode &&
    previousProps.provider?.id === nextProps.provider?.id &&
    previousProps.provider?.name === nextProps.provider?.name &&
    previousProps.provider?.brand === nextProps.provider?.brand &&
    previousProps.provider?.groupId === nextProps.provider?.groupId &&
    previousProps.provider?.installUrl === nextProps.provider?.installUrl &&
    previousProps.prefetchedRoute?.link === nextProps.prefetchedRoute?.link &&
    previousProps.prefetchedRoute?.qrLink === nextProps.prefetchedRoute?.qrLink &&
    previousProps.prefetchedRoute?.label === nextProps.prefetchedRoute?.label &&
    previousProps.prefetchedRoute?.source === nextProps.prefetchedRoute?.source &&
    previousProps.waitForPrefetchedRoute === nextProps.waitForPrefetchedRoute &&
    previousProps.awaitingWalletConfirmation === nextProps.awaitingWalletConfirmation
  )
}

export default memo(WalletProviderQrModal, areQrModalPropsEqual)
