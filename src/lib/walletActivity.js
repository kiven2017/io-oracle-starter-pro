import { getBackend, postBackend } from './backendApi'

const NETWORK_LABELS = {
  bsc: 'BSC',
  ethereum: 'Ethereum',
  solana: 'Solana',
}

function toNumber(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function mapWalletActivityRecord(record) {
  const networkId = String(record?.network_id || record?.networkId || '').trim().toLowerCase()
  const activityType = String(record?.activity_type || record?.activityType || 'purchase').trim().toLowerCase()
  const paymentToken = String(record?.payment_token || record?.paymentToken || '').trim().toUpperCase()

  return {
    id: record?.id ?? `${record?.reference_id || record?.referenceId || 'record'}-${record?.created_at || record?.createdAt || Date.now()}`,
    activityType,
    networkId,
    networkLabel: NETWORK_LABELS[networkId] ?? String(record?.network_label || record?.networkLabel || networkId || 'Unknown'),
    walletProviderId: String(record?.wallet_provider_id || record?.walletProviderId || '').trim().toLowerCase(),
    walletProviderName: String(record?.wallet_provider_name || record?.walletProviderName || '').trim(),
    walletProviderBrand: String(record?.wallet_provider_brand || record?.walletProviderBrand || '').trim(),
    walletProviderType: String(record?.wallet_provider_type || record?.walletProviderType || '').trim().toLowerCase(),
    token: paymentToken || 'USD',
    paymentToken: paymentToken || 'USD',
    paymentAmount: toNumber(record?.payment_amount ?? record?.paymentAmount),
    usdAmount: toNumber(record?.usd_amount ?? record?.usdAmount),
    aio: toNumber(record?.purchase_amount_aio ?? record?.purchaseAmountAio),
    baseAmountAio: toNumber(record?.base_amount_aio ?? record?.baseAmountAio),
    bonusAmountAio: toNumber(record?.bonus_amount_aio ?? record?.bonusAmountAio),
    totalAmountAio: toNumber(record?.total_amount_aio ?? record?.totalAmountAio),
    txHash: String(record?.tx_hash || record?.txHash || record?.reference_id || record?.referenceId || '').trim(),
    referenceId: String(record?.reference_id || record?.referenceId || '').trim(),
    explorerUrl: String(record?.explorer_url || record?.explorerUrl || '').trim(),
    promoCode: String(record?.promo_code || record?.promoCode || '').trim(),
    promoId: toNumber(record?.promo_id ?? record?.promoId),
    allocationRecordId: toNumber(record?.allocation_record_id ?? record?.allocationRecordId),
    status: String(record?.status || '').trim().toLowerCase(),
    allocationType: String(record?.allocation_type || record?.allocationType || activityType).trim().toLowerCase(),
    allocationDirection: String(record?.allocation_direction || record?.allocationDirection || 'credit').trim().toLowerCase(),
    chainAction: String(record?.chain_action || record?.chainAction || '').trim(),
    contractAddress: String(record?.contract_address || record?.contractAddress || '').trim(),
    buyerPositionKey: String(record?.buyer_position_key || record?.buyerPositionKey || '').trim(),
    reason: String(record?.reason || '').trim(),
    note: String(record?.note || '').trim(),
    verificationStatus: String(record?.verification_status || record?.verificationStatus || '').trim().toLowerCase(),
    verificationError: String(record?.verification_error || record?.verificationError || '').trim(),
    verifiedAt: String(record?.verified_at || record?.verifiedAt || '').trim(),
    verifiedContractAddress: String(record?.verified_contract_address || record?.verifiedContractAddress || '').trim(),
    commissionMode: String(record?.commission_mode || record?.commissionMode || 'deduction').trim().toLowerCase(),
    directReferrerWalletAddress: String(
      record?.direct_referrer_wallet_address || record?.directReferrerWalletAddress || '',
    ).trim(),
    indirectReferrerWalletAddress: String(
      record?.indirect_referrer_wallet_address || record?.indirectReferrerWalletAddress || '',
    ).trim(),
    directCommissionBps: toNumber(record?.direct_commission_bps ?? record?.directCommissionBps),
    indirectCommissionBps: toNumber(record?.indirect_commission_bps ?? record?.indirectCommissionBps),
    directCommissionAmount: toNumber(record?.direct_commission_amount ?? record?.directCommissionAmount),
    indirectCommissionAmount: toNumber(record?.indirect_commission_amount ?? record?.indirectCommissionAmount),
    totalCommissionAmount: toNumber(record?.total_commission_amount ?? record?.totalCommissionAmount),
    netAmount: toNumber(record?.net_amount ?? record?.netAmount),
    createdAt: String(record?.created_at || record?.createdAt || '').trim(),
  }
}

export async function recordWalletActivity(activity) {
  const payload = await postBackend('/api/presale/wallet-activity', {
    wallet_address: activity.walletAddress,
    network_id: activity.networkId,
    activity_type: activity.activityType ?? 'purchase',
    wallet_provider_id: activity.walletProviderId,
    wallet_provider_name: activity.walletProviderName,
    wallet_provider_brand: activity.walletProviderBrand,
    wallet_provider_type: activity.walletProviderType,
    status: activity.status ?? 'pending',
    payment_token: activity.paymentToken,
    payment_amount: activity.paymentAmount,
    purchase_amount_aio: activity.purchaseAmountAio,
    usd_amount: activity.usdAmount,
    promo_code: activity.promoCode,
    promo_id: activity.promoId,
    base_amount_aio: activity.baseAmountAio,
    bonus_amount_aio: activity.bonusAmountAio,
    allocation_type: activity.allocationType,
    chain_action: activity.chainAction,
    contract_address: activity.contractAddress,
    buyer_position_key: activity.buyerPositionKey,
    payment_method: activity.paymentMethod,
    tx_hash: activity.txHash,
    reference_id: activity.referenceId,
    explorer_url: activity.explorerUrl,
    source: activity.source ?? 'browser',
  }, 'Unable to save wallet activity record.')

  return mapWalletActivityRecord(payload?.record ?? payload)
}

export async function fetchWalletActivity({ walletAddress, networkId, limit = 20 }) {
  if (!walletAddress) {
    return []
  }

  const payload = await getBackend('/api/presale/wallet-activity', {
    wallet_address: walletAddress,
    network_id: networkId,
    limit,
  }, 'Unable to load wallet activity records.')

  const records = Array.isArray(payload?.records) ? payload.records : []
  return records.map(mapWalletActivityRecord)
}
