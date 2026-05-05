import { getBackend, postBackend } from './backendApi'

const REFERRAL_STORAGE_KEY = 'aioracle-pending-referral'

function toNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function mapBinding(binding) {
  if (!binding) {
    return null
  }

  return {
    id: binding.id,
    role: String(binding.role || 'self').trim().toLowerCase(),
    walletAddress: String(binding.wallet_address || '').trim(),
    directReferrerWalletAddress: String(binding.direct_referrer_wallet_address || '').trim(),
    indirectReferrerWalletAddress: String(binding.indirect_referrer_wallet_address || '').trim(),
    bindSource: String(binding.bind_source || '').trim(),
    boundAt: String(binding.bound_at || '').trim(),
    createdAt: String(binding.created_at || '').trim(),
    updatedAt: String(binding.updated_at || '').trim(),
  }
}

function mapCommissionRecord(record) {
  return {
    id: record?.id ?? `commission-${record?.source_activity_id || Date.now()}`,
    role: String(record?.role || 'direct').trim().toLowerCase(),
    buyerWalletAddress: String(record?.buyer_wallet_address || '').trim(),
    networkId: String(record?.network_id || '').trim().toLowerCase(),
    paymentToken: String(record?.payment_token || '').trim().toUpperCase(),
    paymentAmount: toNumber(record?.payment_amount),
    purchaseAmountAio: toNumber(record?.purchase_amount_aio),
    usdAmount: toNumber(record?.usd_amount),
    commissionAmount: toNumber(record?.commission_amount),
    commissionBps: toNumber(record?.commission_bps),
    status: String(record?.status || '').trim().toLowerCase(),
    sourceActivityId: record?.source_activity_id ?? null,
    txHash: String(record?.tx_hash || '').trim(),
    referenceId: String(record?.reference_id || '').trim(),
    createdAt: String(record?.created_at || '').trim(),
    updatedAt: String(record?.updated_at || '').trim(),
  }
}

function mapStats(stats) {
  return {
    directReferralCount: toNumber(stats?.direct_referral_count),
    indirectReferralCount: toNumber(stats?.indirect_referral_count),
    directCommissionAmount: toNumber(stats?.direct_commission_amount),
    indirectCommissionAmount: toNumber(stats?.indirect_commission_amount),
    totalCommissionAmount: toNumber(stats?.total_commission_amount),
  }
}

function mapReferralSummary(payload) {
  return {
    account: payload?.account
      ? {
          id: payload.account.id,
          walletAddress: String(payload.account.wallet_address || '').trim(),
          referralCode: String(payload.account.referral_code || '').trim(),
          createdAt: String(payload.account.created_at || '').trim(),
          updatedAt: String(payload.account.updated_at || '').trim(),
        }
      : null,
    binding: mapBinding(payload?.binding),
    directReferrals: Array.isArray(payload?.direct_referrals) ? payload.direct_referrals.map(mapBinding) : [],
    indirectReferrals: Array.isArray(payload?.indirect_referrals) ? payload.indirect_referrals.map(mapBinding) : [],
    commissionRecords: Array.isArray(payload?.commission_records) ? payload.commission_records.map(mapCommissionRecord) : [],
    stats: mapStats(payload?.stats),
  }
}

function persistReferralCandidate(candidate) {
  if (typeof window === 'undefined') {
    return candidate
  }

  window.localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(candidate))
  return candidate
}

export function consumeReferralCandidateFromUrl() {
  if (typeof window === 'undefined') {
    return null
  }

  const url = new URL(window.location.href)
  const referrerWalletAddress = url.searchParams.get('ref_wallet')?.trim() || ''
  const referralCode = url.searchParams.get('ref_code')?.trim().toUpperCase() || ''

  if (!referrerWalletAddress && !referralCode) {
    return null
  }

  return persistReferralCandidate({
    referrerWalletAddress: referrerWalletAddress || null,
    referralCode: referralCode || null,
    bindSource: 'share_link',
  })
}

export function getStoredReferralCandidate() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(REFERRAL_STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue)
  } catch {
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY)
    return null
  }
}

export function attachStoredReferralCandidateToUrl(targetUrl) {
  if (typeof window === 'undefined' || !(targetUrl instanceof URL)) {
    return targetUrl
  }

  const hasReferralParams = Boolean(
    targetUrl.searchParams.get('ref_wallet') || targetUrl.searchParams.get('ref_code'),
  )
  if (hasReferralParams) {
    return targetUrl
  }

  const candidate = getStoredReferralCandidate()
  const referrerWalletAddress = String(candidate?.referrerWalletAddress || '').trim()
  const referralCode = String(candidate?.referralCode || '').trim().toUpperCase()

  if (referrerWalletAddress) {
    targetUrl.searchParams.set('ref_wallet', referrerWalletAddress)
  }

  if (referralCode) {
    targetUrl.searchParams.set('ref_code', referralCode)
  }

  return targetUrl
}

export function clearStoredReferralCandidate({ clearUrl = true } = {}) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(REFERRAL_STORAGE_KEY)

  if (!clearUrl) {
    return
  }

  const url = new URL(window.location.href)
  const hasReferralParams = Boolean(
    url.searchParams.get('ref_wallet') || url.searchParams.get('ref_code'),
  )
  if (!hasReferralParams) {
    return
  }

  url.searchParams.delete('ref_wallet')
  url.searchParams.delete('ref_code')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export async function bindWalletReferral({
  walletAddress,
  referrerWalletAddress,
  referralCode,
  bindSource = 'share_link',
}) {
  const payload = await postBackend('/api/presale/referrals/bind', {
    wallet_address: walletAddress,
    referrer_wallet_address: referrerWalletAddress,
    referral_code: referralCode,
    bind_source: bindSource,
  }, 'Unable to bind referral relationship.')

  return {
    account: mapReferralSummary(payload).account,
    binding: mapBinding(payload?.binding),
    created: Boolean(payload?.created),
  }
}

export async function fetchReferralSummary({ walletAddress, limit = 20 }) {
  if (!walletAddress) {
    return mapReferralSummary(null)
  }

  const payload = await getBackend('/api/presale/referrals/summary', {
    wallet_address: walletAddress,
    limit,
  }, 'Unable to load referral summary.')

  return mapReferralSummary(payload)
}
