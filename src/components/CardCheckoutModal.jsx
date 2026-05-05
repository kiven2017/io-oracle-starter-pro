import { CreditCard, LoaderCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import Modal from './Modal'
import PaymentBrandIcon from './PaymentBrandIcon'
import { startWertCheckout } from '../lib/wertCheckout'
import { recordWalletActivity } from '../lib/walletActivity'
import { PRESALE_CONFIG } from '../data/presaleConfig'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'
import { getPromoCodeMessage } from '../lib/promoCodes'

function getRouteSummary(networkId, tokenSymbol) {
  if (networkId === 'ethereum') {
    return `Ethereum / ${tokenSymbol}`
  }

  if (networkId === 'solana') {
    return `Solana / ${tokenSymbol}`
  }

  return `BNB Chain / ${tokenSymbol}`
}

export default function CardCheckoutModal({
  open,
  onClose,
  amount,
  quote,
  networkId,
  tokenSymbol,
  promoCode,
  preferredMethodId,
  methods,
  beneficiaryAddress,
  directReferrerAddress,
  indirectReferrerAddress,
  walletAddress,
  onActivityRecorded,
  onAmountChange,
  onMethodSelect,
}) {
  const { locale, localeInfo } = useLocale()
  const flowText = getFlowText(locale)
  const text = flowText.cardCheckout
  const [isLaunching, setIsLaunching] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const canContinue = !isLaunching
  const routeSummary = getRouteSummary(networkId, tokenSymbol)
  const numberFormatter = new Intl.NumberFormat(localeInfo.intlLocale)
  const promoFeedbackMessage = getPromoCodeMessage({
    locale,
    status: quote.promoCodeStatus,
    promoCode: quote.promoCodeNormalized,
    rule: quote.promoCodeRule,
    validCodes: quote.validPromoCodes,
    numberFormatter,
  })

  useEffect(() => {
    if (!open) {
      setIsLaunching(false)
      setErrorMessage('')
    }
  }, [open])

  const handleCheckout = async () => {
    if (isLaunching) {
      return
    }

    if (quote.hasPromoCodeIssue) {
      setErrorMessage(promoFeedbackMessage || 'Promo code requirements were not met.')
      return
    }

    if (!quote.canReview) {
      onAmountChange(String(PRESALE_CONFIG.minPurchaseUsd))
      setErrorMessage(flowText.interpolate(text.minimumResetError, { amount: PRESALE_CONFIG.minPurchaseUsd }))
      return
    }

    setIsLaunching(true)
    setErrorMessage('')

    try {
      if (networkId === 'solana' && !beneficiaryAddress) {
        throw new Error('Connect a Solana wallet first so Wert can assign the purchase to your beneficiary address.')
      }

      const checkoutResult = await startWertCheckout({
        amountUsd: Number(amount) || quote.usdEquivalent,
        networkId,
        tokenSymbol,
        paymentMethodId: preferredMethodId,
        promoCode,
        beneficiaryAddress,
        directReferrerAddress,
        indirectReferrerAddress,
      })

      const recordWalletAddress = walletAddress || beneficiaryAddress
      if (recordWalletAddress) {
        try {
          await recordWalletActivity({
            walletAddress: recordWalletAddress,
            networkId,
            activityType: 'purchase',
            status: 'checkout_started',
            paymentToken: 'USD',
            paymentAmount: Number(amount) || quote.usdEquivalent,
            purchaseAmountAio: quote.estimatedAio,
            baseAmountAio: quote.estimatedAioBase,
            bonusAmountAio: quote.promoBonusAio,
            usdAmount: quote.usdEquivalent,
            promoCode,
            promoId: quote.promoId,
            chainAction: networkId === 'solana' ? 'wert_checkout' : 'wert_session',
            paymentMethod: preferredMethodId,
            referenceId: checkoutResult?.session?.session_id || checkoutResult?.session?.click_id || '',
            source: 'card',
          })
          await onActivityRecorded?.()
        } catch (recordError) {
          console.warn('Unable to record card checkout activity.', recordError)
        }
      }

      onClose()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : text.unableToStart)
    } finally {
      setIsLaunching(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-[860px] rounded-[2.2rem] border border-white/10 bg-[#242424]/95 p-4 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:rounded-[2.6rem] sm:p-5 md:p-8"
    >
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-lime-300">{text.buyWithCard}</p>
            <h3 className="mt-2 text-3xl font-semibold">
              {networkId === 'solana' ? text.prepareSolana : text.createWertSession}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLaunching}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={text.closeCardCheckout}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {methods.map((method) => {
            const active = preferredMethodId === method.id

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => onMethodSelect(method.id)}
                className={`rounded-[1.5rem] border p-4 transition-all ${
                  active
                    ? 'border-lime-300/50 bg-[linear-gradient(180deg,rgba(163,230,53,0.18),rgba(99,227,208,0.08))] shadow-[0_0_0_1px_rgba(163,230,53,0.15),0_18px_40px_rgba(163,230,53,0.08)]'
                    : 'border-white/6 bg-white/5 hover:border-cyan-300/30 hover:bg-white/10'
                }`}
              >
                <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                  active ? 'bg-black/35' : 'bg-black/20'
                }`}>
                  <PaymentBrandIcon brand={method.brand} className="h-6 w-6" />
                </div>
                <p className={`mt-3 text-sm font-semibold ${active ? 'text-white' : 'text-slate-100'}`}>{method.label}</p>
              </button>
            )
          })}
        </div>

        <div className="rounded-[2rem] border border-lime-300/10 bg-[#151818] p-5">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.checkoutAmount}</label>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <CreditCard className="h-5 w-5 text-slate-500" />
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="100"
              className="w-full bg-transparent text-2xl font-semibold text-white outline-none"
            />
            <span className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">USD</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-white/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.youReceive}</p>
              <p className="mt-2 text-xl font-semibold text-lime-300">{quote.estimatedAio.toLocaleString(localeInfo.intlLocale)} AIO</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.tgeUnlock}</p>
              <p className="mt-2 text-xl font-semibold text-white">{quote.tgeUnlock.toLocaleString(localeInfo.intlLocale)} AIO</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/5 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.settlementRoute}</p>
              <p className="mt-2 text-xl font-semibold text-white">{routeSummary}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] border border-white/6 bg-white/5 p-4 text-sm leading-relaxed text-slate-400">
          {text.creditHint}
        </div>

        {!quote.canReview && !quote.hasPromoCodeIssue ? (
          <p className="text-sm text-amber-300">
            {flowText.interpolate(text.cardMinReset, { amount: PRESALE_CONFIG.minPurchaseUsd })}
          </p>
        ) : null}

        {promoCode && promoFeedbackMessage ? (
          <p className={`text-sm ${quote.promoCodeStatus === 'applied' ? 'text-emerald-300' : 'text-amber-300'}`}>
            {promoFeedbackMessage}
          </p>
        ) : null}

        {networkId === 'solana' ? (
          <div className="space-y-2 text-sm text-cyan-300">
            <p>{flowText.interpolate(text.solanaCardMapped, { token: tokenSymbol })}</p>
            <p>
              {beneficiaryAddress
                ? flowText.interpolate(text.beneficiaryWallet, { address: beneficiaryAddress })
                : text.connectSolanaFirst}
            </p>
          </div>
        ) : null}

        {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!canContinue}
          className="inline-flex min-h-[3.7rem] w-full items-center justify-center gap-3 rounded-[1.35rem] bg-gradient-to-r from-lime-300 to-[#63e3d0] px-5 py-4 font-mono text-[0.95rem] font-black uppercase tracking-[0.08em] text-[#081108] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:rounded-[1.8rem] sm:py-5 sm:text-lg sm:tracking-[0.16em]"
        >
          {isLaunching ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
          {isLaunching
            ? text.creatingWertSession
            : quote.hasPromoCodeIssue
              ? 'Promo Code Not Eligible'
            : quote.canReview
              ? text.openWertCheckout
              : flowText.interpolate(text.useUsdMinimum, { amount: PRESALE_CONFIG.minPurchaseUsd })}
        </button>
      </div>
    </Modal>
  )
}
