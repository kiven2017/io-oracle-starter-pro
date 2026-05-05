import { useRef, useState } from 'react'
import {
  ArrowUpRight,
  BadgeDollarSign,
  Copy,
  CreditCard,
  Gift,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Wallet,
  X,
} from 'lucide-react'
import Modal from './Modal'
import PaymentBrandIcon from './PaymentBrandIcon'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'

function formatBalance(value, locale, maximumFractionDigits = 4) {
  if (value == null || Number.isNaN(Number(value))) {
    return '--'
  }

  return Number(value).toLocaleString(locale, {
    maximumFractionDigits,
  })
}

function shortValue(value, start = 8, end = 6) {
  if (!value) {
    return '--'
  }

  if (value.length <= start + end + 3) {
    return value
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

function shortenUrl(value, start = 24, end = 18) {
  if (!value) {
    return '--'
  }

  if (value.length <= start + end + 3) {
    return value
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`
}

function formatRecordTime(value, locale) {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '--'
  }

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelation(role, directLabel, indirectLabel) {
  return role === 'indirect' ? indirectLabel : directLabel
}

function SummaryCard({ label, value, hint, tone = 'default' }) {
  const toneClass =
    tone === 'accent'
      ? 'border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(16,24,40,0.58))]'
      : 'border-white/10 bg-white/5'

  return (
    <div className={`rounded-[1.4rem] border p-4 ${toneClass}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
    </div>
  )
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">{title}</p>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </div>
  )
}

function NavCard({ active, icon, label, description, onClick, ariaLabel }) {
  const NavIcon = icon

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`w-full rounded-[1.4rem] border p-4 text-left transition-all ${
        active
          ? 'border-cyan-400/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.16),rgba(15,23,42,0.7))] shadow-[0_16px_40px_rgba(34,211,238,0.08)]'
          : 'border-white/10 bg-white/5 hover:border-cyan-400/20 hover:bg-white/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/6">
          <NavIcon className={`h-5 w-5 ${active ? 'text-cyan-300' : 'text-slate-400'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-white">{label}</p>
          <p className="mt-1 text-sm leading-5 text-slate-400">{description}</p>
        </div>
      </div>
    </button>
  )
}

function CopyField({
  label,
  value,
  displayValue,
  hint,
  buttonLabel,
  copiedLabel,
  copied,
  onCopy,
  mono = false,
  emphasis = 'default',
}) {
  const buttonClass =
    emphasis === 'primary'
      ? 'border-cyan-300/40 bg-[linear-gradient(135deg,rgba(34,211,238,0.2),rgba(14,165,233,0.12))] text-cyan-100 shadow-[0_10px_28px_rgba(34,211,238,0.18)] hover:border-cyan-200/60 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.28),rgba(14,165,233,0.16))]'
      : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'

  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className={`mt-2 break-all text-sm text-white ${mono ? 'font-mono' : ''}`}>{displayValue || value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-400">{hint}</p> : null}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-200 sm:w-auto sm:shrink-0 ${buttonClass}`}
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? copiedLabel : buttonLabel}
        </button>
      </div>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 px-5 py-8 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-[460px] text-sm leading-6 text-slate-400">{description}</p>
    </div>
  )
}

export default function WalletOverviewModal({
  open,
  onClose,
  wallet,
  balances,
  purchasedAmount = 0,
  claimableAmount = 0,
  isLoading,
  onDisconnect,
  walletSummaryLabel = '',
  warningMessage = '',
  history = [],
  promoCode = '',
  referralSummary = null,
  showClaimAction = false,
  onClaim,
  claimLabel = '',
  claimDisabled = true,
  isClaimBusy = false,
}) {
  const { locale, localeInfo } = useLocale()
  const flowText = getFlowText(locale)
  const text = flowText.walletOverview
  const [activeSection, setActiveSection] = useState('overview')
  const [copiedField, setCopiedField] = useState('')
  const sectionContentRef = useRef(null)
  const paidLabel = locale.startsWith('zh') ? '支付金額' : 'Paid'
  const purchasedLabel = locale.startsWith('zh') ? '購買數量' : 'Purchased'
  const statusLabel = locale.startsWith('zh') ? '狀態' : 'Status'
  const timeLabel = locale.startsWith('zh') ? '時間' : 'Time'
  const referralTimeLabel = locale.startsWith('zh') ? '綁定時間' : 'Bound Time'
  const grossLabel = locale.startsWith('zh') ? '原始轉帳' : 'Gross Transfer'
  const commissionLabel = locale.startsWith('zh') ? '抽佣合計' : 'Commission'
  const netLabel = locale.startsWith('zh') ? '實際到帳' : 'Net Transfer'
  const directLabel = locale.startsWith('zh') ? '直接推薦' : 'Direct'
  const indirectLabel = locale.startsWith('zh') ? '間接推薦' : 'Indirect'
  const directMembersLabel = locale.startsWith('zh') ? '直屬成員' : 'Direct Members'
  const indirectMembersLabel = locale.startsWith('zh') ? '二級成員' : 'Indirect Members'
  const commissionHistoryLabel = locale.startsWith('zh') ? '佣金記錄' : 'Commission Records'

  const hasProjectTokenConfig = balances?.hasProjectTokenConfig !== false
  const referralStats = referralSummary?.stats ?? {
    directReferralCount: 0,
    indirectReferralCount: 0,
    directCommissionAmount: 0,
    indirectCommissionAmount: 0,
    totalCommissionAmount: 0,
  }
  const directReferrals = referralSummary?.directReferrals ?? []
  const indirectReferrals = referralSummary?.indirectReferrals ?? []
  const commissionRecords = referralSummary?.commissionRecords ?? []
  const referralAccount = referralSummary?.account ?? null
  const referralPreviewLink =
    typeof window === 'undefined' || !wallet?.address
      ? ''
      : (() => {
          const url = new URL(window.location.href)
          url.searchParams.set('ref_wallet', wallet.address)
          return url.toString()
        })()

  const referralPreviewCode = referralAccount?.referralCode || text.referralCodePending
  const referralPreviewLinkLabel = shortenUrl(referralPreviewLink)

  const handleCopy = async (field, value) => {
    if (!value) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? '' : current))
      }, 1200)
    } catch {
      setCopiedField('')
    }
  }

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)

    if (typeof window === 'undefined') {
      return
    }

    window.requestAnimationFrame(() => {
      sectionContentRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const paymentRecords = history
    .filter((record) => {
      const activityType = String(record?.activityType || '').toLowerCase()
      return activityType === 'purchase' || activityType === 'claim'
    })
    .map((record) => ({
      ...record,
      type: String(record.activityType || '').toLowerCase() === 'claim' ? 'claim' : 'purchase',
    }))

  const navigationItems = [
    {
      id: 'overview',
      icon: Wallet,
      label: text.overviewNav,
      description: text.directBalances,
    },
    {
      id: 'income',
      icon: BadgeDollarSign,
      label: text.incomeNav,
      description: text.revenueDescription,
    },
    {
      id: 'payments',
      icon: CreditCard,
      label: text.paymentsNav,
      description: text.paymentsDescription,
    },
    {
      id: 'referrals',
      icon: Gift,
      label: text.referralsNav,
      description: text.referralsDescription,
    },
  ]

  if (!wallet) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="w-full max-w-6xl overflow-hidden rounded-[2.2rem] border border-cyan-400/16 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.1),transparent_34%),linear-gradient(180deg,rgba(10,16,31,0.98),rgba(7,12,24,0.98))] shadow-[0_32px_120px_rgba(0,0,0,0.56)]"
    >
      <div className="space-y-6 p-4 md:p-6">
        <div className="sticky top-0 z-20 -mx-4 -mt-4 border-b border-white/8 bg-[linear-gradient(180deg,rgba(9,15,28,0.96),rgba(9,15,28,0.88))] px-4 pb-4 pt-4 backdrop-blur-xl md:-mx-6 md:-mt-6 md:px-6 md:pb-5 md:pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 pr-4 md:pr-8">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] bg-cyan-400/12">
                <PaymentBrandIcon brand={wallet.brand || wallet.providerId} className="h-8 w-8" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300">{text.accountCenter}</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">{wallet.providerName}</h3>
                <p className="mt-1 text-sm text-slate-400">{text.accountCenterLead}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={text.closeWalletOverview}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-400 transition-colors hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{text.connectedAddress}</p>
                <button
                  type="button"
                  onClick={() => handleCopy('address', wallet.address)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300 transition-colors hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copiedField === 'address' ? text.copied : text.copyAddress}
                </button>
              </div>
              <p
                className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-white"
                title={wallet.address}
              >
                {shortValue(wallet.address, 10, 8)}
              </p>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-[#0d1527]/88 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8">
                    <Wallet className="h-5 w-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{walletSummaryLabel || (wallet.network === 'solana' ? text.solanaWallet : text.evmWallet)}</p>
                    <p className="text-sm text-slate-400">{text.realTimeBalance}</p>
                  </div>
                </div>
                {isLoading ? (
                  <LoaderCircle className="h-5 w-5 animate-spin text-cyan-300" />
                ) : (
                  <p className="text-2xl font-black tracking-tight text-white">
                    {formatBalance(balances?.nativeBalanceUi, localeInfo.intlLocale)} {balances?.nativeSymbol ?? ''}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <SectionTitle title={text.quickAccess} />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {navigationItems.map((item) => (
                  <NavCard
                    key={item.id}
                    active={activeSection === item.id}
                    icon={item.icon}
                    label={item.label}
                    description={item.description}
                    onClick={() => handleSectionChange(item.id)}
                    ariaLabel={flowText.interpolate(text.openSection, { label: item.label })}
                  />
                ))}
              </div>
            </div>
          </div>

          <div ref={sectionContentRef} className="space-y-5">
            {activeSection === 'overview' ? (
              <>
                <SectionTitle title={text.walletAssets} description={text.directBalances} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard
                    label={`${balances?.paymentSymbol ?? 'Payment'} ${text.balanceSuffix}`}
                    value={`${formatBalance(balances?.paymentBalanceUi, localeInfo.intlLocale)} ${balances?.paymentSymbol ?? ''}`}
                    hint={text.walletTokenBalance}
                  />
                  <SummaryCard
                    label={`${balances?.saleSymbol ?? 'AIO'} ${text.balanceSuffix}`}
                    value={`${formatBalance(balances?.saleBalanceUi, localeInfo.intlLocale)} ${balances?.saleSymbol ?? ''}`}
                    hint={text.currentTokenHoldings}
                  />
                </div>

                <SectionTitle title={text.presalePosition} description={text.presaleTracked} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard
                    label={text.purchased}
                    value={`${formatBalance(purchasedAmount, localeInfo.intlLocale)} AIO`}
                    hint={text.purchasedHint}
                    tone="accent"
                  />
                  <SummaryCard
                    label={text.claimable}
                    value={`${formatBalance(claimableAmount, localeInfo.intlLocale)} AIO`}
                    hint={text.claimableHint}
                    tone="accent"
                  />
                </div>
              </>
            ) : null}

            {activeSection === 'income' ? (
              <>
                <SectionTitle title={text.revenueTitle} description={text.revenueDescription} />
                <div className="grid gap-4 sm:grid-cols-3">
                  <SummaryCard
                    label={text.totalRevenue}
                    value={formatBalance(referralStats.totalCommissionAmount, localeInfo.intlLocale, 2)}
                    hint={commissionHistoryLabel}
                  />
                  <SummaryCard
                    label={directLabel}
                    value={formatBalance(referralStats.directCommissionAmount, localeInfo.intlLocale, 2)}
                    hint={`${directMembersLabel} ${referralStats.directReferralCount}`}
                  />
                  <SummaryCard
                    label={indirectLabel}
                    value={formatBalance(referralStats.indirectCommissionAmount, localeInfo.intlLocale, 2)}
                    hint={`${indirectMembersLabel} ${referralStats.indirectReferralCount}`}
                  />
                </div>
                {commissionRecords.length ? (
                  <div className="space-y-3">
                    {commissionRecords.map((record) => (
                      <div key={record.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-white">
                              {formatRelation(record.role, directLabel, indirectLabel)}
                            </p>
                            <p className="mt-1 break-all font-mono text-xs text-slate-400">{shortValue(record.buyerWalletAddress, 10, 8)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-cyan-300">
                              {formatBalance(record.commissionAmount, localeInfo.intlLocale, 2)} {record.paymentToken || 'USD'}
                            </p>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{record.commissionBps / 100}%</p>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{grossLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.paymentAmount, localeInfo.intlLocale, 2)} {record.paymentToken || 'USD'}
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{purchasedLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.purchaseAmountAio, localeInfo.intlLocale, 2)} AIO
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{referralTimeLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatRecordTime(record.createdAt, localeInfo.intlLocale)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title={text.noRevenueRecords} description={text.revenuePendingHint} />
                )}
              </>
            ) : null}

            {activeSection === 'payments' ? (
              <>
                <SectionTitle title={text.paymentsTitle} description={text.paymentsDescription} />
                {paymentRecords.length ? (
                  <div className="space-y-3">
                    {paymentRecords.map((record) => (
                      <div
                        key={record.id}
                        className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black uppercase tracking-[0.16em] text-white">
                              {record.type === 'claim' ? text.claimRecord : text.purchaseRecord}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">{record.networkLabel}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-cyan-300">
                              {formatBalance(record.aio, localeInfo.intlLocale, 2)} AIO
                            </p>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{record.token}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{paidLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.paymentAmount, localeInfo.intlLocale, 2)} {record.paymentToken || record.token || 'USD'}
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{purchasedLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.aio, localeInfo.intlLocale, 2)} AIO
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{statusLabel}</p>
                            <p className="mt-1 text-sm font-semibold uppercase text-white">
                              {record.status || '--'}
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{timeLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatRecordTime(record.createdAt, localeInfo.intlLocale)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{grossLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.paymentAmount, localeInfo.intlLocale, 2)} {record.paymentToken || record.token || 'USD'}
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{commissionLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.totalCommissionAmount, localeInfo.intlLocale, 2)} {record.paymentToken || record.token || 'USD'}
                            </p>
                          </div>
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{netLabel}</p>
                            <p className="mt-1 text-sm font-semibold text-white">
                              {formatBalance(record.netAmount, localeInfo.intlLocale, 2)} {record.paymentToken || record.token || 'USD'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                          <div className="rounded-[1.1rem] border border-white/8 bg-black/20 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{text.txHash}</p>
                            <p className="mt-1 break-all font-mono text-sm text-white">{shortValue(record.txHash, 14, 10)}</p>
                            <p className="mt-2 text-xs text-slate-500">{text.routeLabel}: {record.networkLabel}</p>
                          </div>
                          {record.explorerUrl ? (
                            <a
                              href={record.explorerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center gap-2 rounded-[1.1rem] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-cyan-200 transition-colors hover:bg-cyan-400/20"
                            >
                              {text.viewExplorer}
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState title={text.noPaymentRecords} description={text.paymentPendingHint} />
                )}
              </>
            ) : null}

            {activeSection === 'referrals' ? (
              <>
                <SectionTitle title={text.referralsTitle} description={text.referralsDescription} />
                <div className="grid gap-4">
                  <CopyField
                    label={text.referralCode}
                    value={referralPreviewCode}
                    hint={text.referralCodeHint}
                    buttonLabel={text.copyCode}
                    copiedLabel={text.copied}
                    copied={copiedField === 'referral-code'}
                    onCopy={() => handleCopy('referral-code', referralPreviewCode)}
                  />
                  <CopyField
                    label={text.referralLink}
                    value={referralPreviewLink || '--'}
                    displayValue={referralPreviewLink ? referralPreviewLinkLabel : '--'}
                    hint={text.referralLinkHint}
                    buttonLabel={text.copyLink}
                    copiedLabel={text.copied}
                    copied={copiedField === 'referral-link'}
                    onCopy={() => handleCopy('referral-link', referralPreviewLink)}
                    mono
                    emphasis="primary"
                  />
                  <CopyField
                    label={text.appliedPromoCode}
                    value={promoCode || text.noPromoCode}
                    hint={text.appliedPromoCodeHint}
                    buttonLabel={text.copyPromoCode}
                    copiedLabel={text.copied}
                    copied={copiedField === 'promo-code'}
                    onCopy={() => handleCopy('promo-code', promoCode)}
                  />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{directMembersLabel}</p>
                      <p className="text-sm font-semibold text-cyan-300">{directReferrals.length}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {directReferrals.length ? directReferrals.map((record) => (
                        <div key={`direct-${record.id}`} className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <p className="break-all font-mono text-sm text-white">{shortValue(record.walletAddress, 12, 8)}</p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatRelation(record.role, directLabel, indirectLabel)} · {formatRecordTime(record.boundAt, localeInfo.intlLocale)}
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-400">{text.referralCodeHint}</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">{indirectMembersLabel}</p>
                      <p className="text-sm font-semibold text-cyan-300">{indirectReferrals.length}</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {indirectReferrals.length ? indirectReferrals.map((record) => (
                        <div key={`indirect-${record.id}`} className="rounded-[1rem] border border-white/8 bg-black/20 px-4 py-3">
                          <p className="break-all font-mono text-sm text-white">{shortValue(record.walletAddress, 12, 8)}</p>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatRelation(record.role, directLabel, indirectLabel)} · {formatRecordTime(record.boundAt, localeInfo.intlLocale)}
                          </p>
                        </div>
                      )) : (
                        <p className="text-sm text-slate-400">{text.referralCodeHint}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {!hasProjectTokenConfig ? null : null}

            {warningMessage ? (
              <p className="rounded-[1.2rem] border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {warningMessage}
              </p>
            ) : null}

            {showClaimAction ? (
              <button
                type="button"
                onClick={onClaim}
                disabled={claimDisabled}
                className="flex w-full items-center justify-center gap-3 rounded-[1.6rem] border border-cyan-400/20 bg-cyan-400/10 py-4 text-base font-black uppercase tracking-[0.18em] text-cyan-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isClaimBusy ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                {claimLabel}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onDisconnect}
              className="flex w-full items-center justify-center gap-3 rounded-[1.6rem] border border-red-400/20 bg-red-500/10 py-4 text-base font-black uppercase tracking-[0.18em] text-red-200 transition-colors hover:border-red-400/40 hover:bg-red-500/20"
            >
              <LogOut className="h-5 w-5" />
              {text.disconnect}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
