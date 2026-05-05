import { ArrowRight, Download, LoaderCircle, Smartphone, X } from 'lucide-react'
import { useMemo } from 'react'
import Modal from './Modal'
import PaymentBrandIcon from './PaymentBrandIcon'
import { PRESALE_CONFIG, getNetworkOptionsForProviderGroup } from '../data/presaleConfig'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'

function ProviderButton({ provider, active, pending, onClick, text }) {
  const statusLabel = provider.detected === false ? text.statusNotFound : provider.status
  const routeLabel =
    provider.groupId === 'evm' && provider.detected === true
      ? text.routeExtensionAvailable
      : provider.connectMode === 'qr'
        ? text.routeQr
        : text.routeDirect
  const statusClass =
    provider.detected === false
      ? 'bg-red-500/10 text-red-300'
      : provider.detected === true || provider.connectMode === 'direct'
        ? 'bg-emerald-500/10 text-emerald-300'
        : 'bg-sky-500/10 text-sky-300'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1rem] border px-3 py-3.5 text-left transition-all md:rounded-[1.2rem] md:py-3 ${
        active
          ? 'border-lime-300/40 bg-lime-300/10'
          : 'border-white/6 bg-white/5 hover:border-lime-300/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.85rem] bg-white/5 md:rounded-[0.95rem]">
          <PaymentBrandIcon brand={provider.brand} className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[0.98rem] font-semibold leading-tight text-white md:text-[15px]">{provider.name}</p>
              <p className="mt-1 text-[0.58rem] uppercase tracking-[0.1em] text-slate-500 md:text-[10px] md:tracking-[0.16em]">
                {routeLabel}
              </p>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[0.55rem] font-bold uppercase tracking-[0.1em] md:text-[9px] md:tracking-[0.16em] ${statusClass}`}
            >
              {pending ? (
                <span className="inline-flex items-center gap-1.5">
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  {text.statusLoading}
                </span>
              ) : (
                statusLabel
              )}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function WalletConnectModal({
  open,
  onClose,
  providerGroups,
  visibleProviderGroupId = null,
  selectedProvider,
  selectedProviderId,
  onProviderSelect,
  networkId,
  tokenSymbol,
  amount,
  promoCode,
  quote,
  isBusy,
  onNetworkChange,
  onTokenChange,
  onAmountChange,
  onPromoCodeChange,
  onContinue,
  walletNotice,
  selectedProviderMissing,
  onOpenMissingWalletRoute,
  onInstallSelectedWallet,
  mode = 'purchase',
  pendingProviderId = null,
  prefersSolanaMobileWalletRoute = false,
  preparingProvider = null,
}) {
  const { locale } = useLocale()
  const flowText = getFlowText(locale)
  const text = flowText.walletConnect
  const isLoginMode = mode === 'login'
  const isPreparingRoute = Boolean(preparingProvider)
  const activeProviderGroupId =
    visibleProviderGroupId ?? (isLoginMode ? null : selectedProvider?.groupId ?? (networkId === 'solana' ? 'solana' : 'evm'))
  const availableNetworks = useMemo(
    () => getNetworkOptionsForProviderGroup(activeProviderGroupId ?? 'evm'),
    [activeProviderGroupId],
  )

  const filteredGroups = useMemo(
    () => (activeProviderGroupId ? providerGroups.filter((group) => group.id === activeProviderGroupId) : providerGroups),
    [activeProviderGroupId, providerGroups],
  )
  const orderedGroups = useMemo(() => {
    const groupOrder = {
      solana: 0,
      evm: 1,
    }

    return [...filteredGroups].sort((left, right) => {
      const leftOrder = groupOrder[left.id] ?? 99
      const rightOrder = groupOrder[right.id] ?? 99
      return leftOrder - rightOrder
    })
  }, [filteredGroups])

  const selectedProviderCanDirectConnect =
    selectedProvider?.connectMode === 'direct' || selectedProvider?.detected === true
  const canContinue = selectedProviderCanDirectConnect && (isLoginMode || quote.canReview) && !isBusy && !isPreparingRoute
  const continueLabel =
    selectedProvider?.groupId === 'solana' && prefersSolanaMobileWalletRoute && selectedProvider?.detected !== true
      ? text.openWalletApp
      : selectedProvider?.groupId === 'solana' && selectedProviderCanDirectConnect
        ? isLoginMode
          ? text.connectWalletAction
          : text.connectReview
        : selectedProvider?.groupId === 'evm' && selectedProvider?.detected === true
          ? text.connectExtension
          : isLoginMode
            ? text.connectWalletAction
            : text.connectReview

  return (
    <Modal
      open={open}
      onClose={isPreparingRoute ? () => {} : onClose}
      className="max-w-[1040px] rounded-t-[2rem] border border-white/10 bg-[#1f2221]/95 p-4 pb-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:rounded-[2.25rem] md:p-6"
    >
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lime-300 md:text-[11px] md:tracking-[0.3em]">{text.connectWallet}</p>
            <h3 className="mt-1.5 text-[1.45rem] font-semibold leading-tight tracking-tight md:text-[2.2rem]">
              {isPreparingRoute
                ? preparingProvider.heading ?? flowText.interpolate(text.prepareConnectTitle, { provider: preparingProvider.providerName })
                : isLoginMode
                  ? text.chooseSignIn
                  : text.chooseContinue}
            </h3>
          </div>
          <button
            type="button"
            onClick={isPreparingRoute ? undefined : onClose}
            disabled={isPreparingRoute}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40 md:p-2.5"
            aria-label={text.closeWalletModal}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isPreparingRoute ? (
          <div className="rounded-[1.6rem] border border-cyan-400/20 bg-[#111923] px-4 py-6 text-center md:rounded-[1.9rem] md:px-5 md:py-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1rem] border border-white/10 bg-white/5 md:h-16 md:w-16 md:rounded-[1.25rem]">
              <PaymentBrandIcon brand={preparingProvider.providerBrand ?? 'walletconnect'} className="h-8 w-8" />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-300 md:text-[11px] md:tracking-[0.28em]">{text.preparingWallet}</p>
            <h4 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-white md:text-[1.7rem]">
              {preparingProvider.title ?? flowText.interpolate(text.prepareConnectTitle, { provider: preparingProvider.providerName })}
            </h4>
            <p className="mx-auto mt-3 max-w-[520px] text-[0.95rem] leading-6 text-slate-300 md:text-sm">
              {preparingProvider.description ?? text.prepareConnectDescription}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs text-cyan-100 md:text-sm">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {preparingProvider.badgeLabel ?? text.prepareConnectBadge}
            </div>
          </div>
        ) : (
          <div className={`grid gap-3 ${orderedGroups.length > 1 ? 'lg:grid-cols-2' : ''}`}>
            {orderedGroups.map((group) => (
              <div key={group.id} className="min-w-0 rounded-[1.35rem] border border-white/6 bg-white/5 p-3.5 md:rounded-[1.6rem] md:p-4">
                <p className="text-[1.2rem] font-semibold leading-tight text-white md:text-[1.65rem]">{group.title}</p>
                <p className="mt-1.5 text-[12px] leading-5 text-slate-400 md:text-[13px]">{group.description}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {group.providers.map((provider) => (
                    <ProviderButton
                      key={provider.id}
                      provider={provider}
                      active={selectedProviderId === provider.id}
                      pending={pendingProviderId === provider.id}
                      onClick={() => onProviderSelect(provider.id)}
                      text={text}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isPreparingRoute && !isLoginMode ? (
          <div className="rounded-[1.45rem] border border-lime-300/10 bg-[#141816] p-3.5 md:rounded-[1.75rem] md:p-4">
            <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_220px]">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.network}</label>
                <select
                  value={networkId}
                  onChange={(event) => onNetworkChange(event.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-[1.1rem] border border-white/10 bg-[#202423] px-4 py-3 text-white outline-none"
                >
                  {availableNetworks.map((network) => (
                    <option key={network.id} value={network.id}>
                      {network.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.paymentToken}</label>
                <select
                  value={tokenSymbol}
                  onChange={(event) => onTokenChange(event.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-[1.1rem] border border-white/10 bg-[#202423] px-4 py-3 text-white outline-none"
                >
                  {quote.availableTokens.map((token) => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.amount}</label>
                <input
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => onAmountChange(event.target.value)}
                  disabled={isBusy}
                  className="w-full rounded-[1.1rem] border border-white/10 bg-[#202423] px-4 py-3 text-white outline-none"
                />
              </div>
                <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3 text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.estimatedReceive}</p>
                  <p className="mt-1 text-lg font-semibold text-lime-300">{quote.estimatedAio.toLocaleString()} AIO</p>
                </div>
              </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <input
                type="text"
                value={promoCode}
                onChange={(event) => onPromoCodeChange(event.target.value.toUpperCase())}
                placeholder={text.referralOptional}
                disabled={isBusy}
                className="w-full rounded-[1.1rem] border border-white/10 bg-[#202423] px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-lime-200 outline-none placeholder:text-slate-500"
              />
              <div className="flex flex-col items-start gap-2 rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                <span>Min 100 USDT</span>
                <span>
                  Unlock {PRESALE_CONFIG.unlock.tgePercent}% TGE / {PRESALE_CONFIG.unlock.linearMonths}M
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-1 py-1 text-[0.9rem] leading-6 text-slate-400">
            {text.signInFirst}
          </div>
        )}

        {!isPreparingRoute && !isLoginMode && !quote.canReview ? (
          <p className="text-sm text-amber-300">{text.minEquivalent}</p>
        ) : null}

        {walletNotice ? (
          <div className="px-1 py-1 text-[0.82rem] leading-6 text-slate-300">
            {walletNotice}
          </div>
        ) : null}

        {pendingProviderId ? (
          <div className="px-1 py-1 text-[0.82rem] leading-6 text-slate-300">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {text.securePreparing}
            </span>
          </div>
        ) : null}

        {!isPreparingRoute && selectedProviderMissing ? (
          <div className="grid gap-3 rounded-[1.2rem] border border-red-400/20 bg-red-500/10 p-4 md:grid-cols-2">
            <button
              type="button"
              onClick={onInstallSelectedWallet}
              className="inline-flex min-h-[3.35rem] items-center justify-center gap-2 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-[0.9rem] font-black uppercase tracking-[0.06em] text-white sm:text-sm sm:tracking-[0.12em]"
            >
              <Download className="h-4 w-4" />
              {text.installWallet}
            </button>
            {!isLoginMode ? (
                <button
                  type="button"
                  onClick={onOpenMissingWalletRoute}
                  className="inline-flex min-h-[3.35rem] items-center justify-center gap-2 rounded-[1rem] bg-gradient-to-r from-lime-300 to-[#63e3d0] px-4 py-3 text-[0.9rem] font-black uppercase tracking-[0.06em] text-[#081108] sm:text-sm sm:tracking-[0.12em]"
                >
                  <Smartphone className="h-4 w-4" />
                  {text.useMobileWallet}
                </button>
            ) : null}
          </div>
        ) : null}

        {!isPreparingRoute ? (
          <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <div className="text-[13px] leading-6 text-slate-400">
              {selectedProvider
                ? selectedProvider.groupId === 'evm' && selectedProvider.detected === true
                  ? flowText.interpolate(text.selectedProviderDetected, { provider: selectedProvider.name })
                  : flowText.interpolate(text.selectedProvider, { provider: selectedProvider.name })
                : text.selectProviderHint}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {selectedProviderMissing && !isLoginMode ? (
                <button
                  type="button"
                  onClick={onOpenMissingWalletRoute}
                  className="inline-flex min-h-[3.4rem] w-full items-center justify-center gap-2 rounded-[1.1rem] border border-white/10 bg-white/5 px-5 py-3 font-mono text-[0.9rem] font-black uppercase tracking-[0.06em] text-white sm:w-auto sm:text-sm sm:tracking-[0.12em] md:rounded-[1.3rem] md:px-6 md:tracking-[0.16em]"
                >
                  {text.openWalletRoute}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : null}
              {!isLoginMode ? (
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={!canContinue}
                  className="min-h-[3.45rem] w-full rounded-[1.1rem] bg-gradient-to-r from-lime-300 to-[#63e3d0] px-6 py-3.5 font-mono text-[0.92rem] font-black uppercase tracking-[0.06em] text-[#081108] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-sm sm:tracking-[0.12em] md:rounded-[1.3rem] md:px-7 md:text-base md:tracking-[0.16em]"
                >
                  {continueLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
