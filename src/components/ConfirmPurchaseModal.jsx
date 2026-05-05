import { LoaderCircle, ShieldAlert, X } from 'lucide-react'
import Modal from './Modal'
import { PRESALE_CONFIG } from '../data/presaleConfig'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'

function shortenSensitiveValue(value, start = 10, end = 8) {
  if (!value) {
    return value
  }

  if (value.length <= start + end + 3) {
    return value
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

function isLongAddressLike(value) {
  const normalizedValue = String(value || '').trim()

  if (!normalizedValue || normalizedValue.includes(' ')) {
    return false
  }

  return normalizedValue.startsWith('0x') || /^[1-9A-HJ-NP-Za-km-z]{28,}$/.test(normalizedValue)
}

function SummaryRow({ label, value, highlight = false, compactValue = false }) {
  const displayValue = compactValue ? shortenSensitiveValue(value) : value

  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/6 py-2.5 text-sm last:border-b-0">
      <span className="max-w-[34%] text-slate-500">{label}</span>
      <span
        title={compactValue ? value : undefined}
        className={`max-w-[66%] text-right font-semibold ${compactValue ? 'font-mono text-[0.92rem] tracking-[-0.01em]' : ''} ${highlight ? 'text-cyan-400' : 'text-white'}`}
      >
        {displayValue}
      </span>
    </div>
  )
}

export default function ConfirmPurchaseModal({
  open,
  onClose,
  quote,
  saleEnvironmentLabel,
  saleEnvironmentBadge,
  paymentAmount,
  paymentToken,
  walletAddress,
  approvalAmount = '',
  approvalToken = '',
  approvalSpender = '',
  promoCode,
  txState,
  onConfirm,
  confirmDisabled = false,
  confirmHint = '',
  statusMessage = '',
}) {
  const { locale, localeInfo } = useLocale()
  const flowText = getFlowText(locale)
  const text = flowText.confirmPurchase
  const isBusy = txState === 'awaiting_signature' || txState === 'submitted'
  const shouldShowApprovalPreview = Boolean(approvalAmount && approvalToken && approvalSpender)

  if (!quote?.selectedToken || !quote?.selectedNetwork) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={isBusy ? () => {} : onClose}
      className="w-full max-w-4xl rounded-[2.3rem] border border-cyan-400/16 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_38%),linear-gradient(180deg,rgba(10,16,31,0.98),rgba(7,12,24,0.97))] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.52)] sm:rounded-[3rem] sm:p-8 md:p-10"
    >
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400">{text.reviewPurchase}</p>
            <h3 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-white">
              {text.confirmPresaleOrder}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label={text.closePurchaseConfirmation}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-1 rounded-[2rem] bg-[#0d1527]/72 px-5 py-4">
          <SummaryRow label={text.environment} value={`${saleEnvironmentLabel} / ${saleEnvironmentBadge}`} />
          <SummaryRow label={text.network} value={quote.selectedNetwork.label} />
          <SummaryRow label={text.yourWallet} value={walletAddress} compactValue={isLongAddressLike(walletAddress)} />
          <SummaryRow label={text.youPay} value={`${paymentAmount || 0} ${paymentToken}`} />
          {shouldShowApprovalPreview ? (
            <SummaryRow label={text.approvalAmount} value={`${approvalAmount} ${approvalToken}`} />
          ) : null}
          {shouldShowApprovalPreview ? (
            <SummaryRow
              label={text.approvalSpender}
              value={approvalSpender}
              compactValue={isLongAddressLike(approvalSpender)}
            />
          ) : null}
          <SummaryRow label={text.usdtEquivalent} value={`$${quote.usdEquivalent.toLocaleString(localeInfo.intlLocale)}`} />
          <SummaryRow label={text.youReceive} value={`${quote.estimatedAio.toLocaleString(localeInfo.intlLocale)} AIO`} highlight />
          <SummaryRow
            label={flowText.interpolate(text.tgeUnlock, { percent: PRESALE_CONFIG.unlock.tgePercent })}
            value={`${quote.tgeUnlock.toLocaleString(localeInfo.intlLocale)} AIO`}
          />
          <SummaryRow
            label={flowText.interpolate(text.linearRelease, { months: PRESALE_CONFIG.unlock.linearMonths })}
            value={flowText.interpolate(text.monthlyRate, { amount: quote.monthlyUnlock.toLocaleString(localeInfo.intlLocale) })}
          />
          <SummaryRow label={text.referralCode} value={promoCode || text.notApplied} />
        </div>

        {shouldShowApprovalPreview ? (
          <div className="px-1 py-1 text-[0.82rem] leading-6 text-slate-300">
            {flowText.interpolate(text.approvalPreview, {
              amount: approvalAmount,
              token: approvalToken,
            })}
          </div>
        ) : null}

        {confirmHint ? (
          <p className="px-1 text-[0.82rem] leading-6 text-slate-400">
            {confirmHint}
          </p>
        ) : null}

        {statusMessage ? (
          <div className={`px-1 py-1 text-[0.82rem] leading-6 ${
            isBusy
              ? 'text-slate-300'
              : txState === 'failed'
                ? 'text-slate-300'
                : 'text-slate-300'
          }`}>
            {statusMessage}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onConfirm}
          disabled={isBusy || confirmDisabled}
          className="flex min-h-[3.7rem] w-full items-center justify-center gap-3 rounded-[1.35rem] bg-white px-5 py-4 text-[0.96rem] font-black uppercase tracking-[0.05em] text-black transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-0 sm:rounded-[1.8rem] sm:py-5 sm:text-lg sm:tracking-tight"
        >
          {isBusy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
          {isBusy ? text.processingPurchase : confirmDisabled ? text.purchaseDisabled : text.confirmPurchaseAction}
        </button>

        <div className="px-1 py-1 text-[0.82rem] leading-6 text-slate-400">
          <ShieldAlert className="mr-2 inline h-3.5 w-3.5 -translate-y-px text-slate-500" />
          {text.warning}
        </div>
      </div>
    </Modal>
  )
}
