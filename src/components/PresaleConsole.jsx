import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import {
  ArrowUpRight,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from 'lucide-react'
import CardCheckoutModal from './CardCheckoutModal'
import ConfirmPurchaseModal from './ConfirmPurchaseModal'
import PaymentBrandIcon from './PaymentBrandIcon'
import PurchaseFollowupModal from './PurchaseFollowupModal'
import WalletConnectModal from './WalletConnectModal'
import WalletOverviewModal from './WalletOverviewModal'
import WalletProviderQrModal from './WalletProviderQrModal'
import { useLocale } from '../context/LocaleContext'
import { getFlowText } from '../data/flowText'
import {
  buildWalletRoute,
  buildSolanaMobileTransactionRoute,
  clearPendingMobileTransaction,
  clearStoredMobileSession,
  consumeSolanaWalletCallback,
  getPendingMobileTransaction,
  storePendingMobileTransaction,
} from '../lib/solanaWalletDeeplinks'
import { fetchWalletActivity, recordWalletActivity } from '../lib/walletActivity'
import {
  bindWalletReferral,
  clearStoredReferralCandidate,
  consumeReferralCandidateFromUrl,
  fetchReferralSummary,
  getStoredReferralCandidate,
} from '../lib/referrals'
import {
  CARD_METHODS,
  QUICK_ACCESS_METHODS,
  WALLET_PROVIDER_GROUPS,
  getWalletProvider,
} from '../data/checkoutOptions'
import {
  PRESALE_CONFIG,
  TX_STATE_META,
  getCardTokenForNetwork,
  getDefaultTokenForNetwork,
  getTokenOptionsForNetwork,
  getStagePrice,
} from '../data/presaleConfig'
import { getSaleEnvironment } from '../data/presaleEnvironment'
import usePresaleCalculator from '../hooks/usePresaleCalculator'
import {
  buildEvmInAppBrowserRoute,
  clearEvmWalletConnectRoute,
  completeEvmWalletConnectSession,
  connectInjectedEvmWallet,
  getActiveEvmWalletConnectSession,
  getCachedEvmWalletConnectRoute,
  getInjectedEvmProvider,
  hasWalletConnectProjectId,
  prefetchEvmWalletConnectRoute,
  supportsEvmInAppBrowserRoute,
} from '../lib/evmWallet'
import { lockBodyScroll } from '../lib/scrollLock'
import { getPromoCodeMessage } from '../lib/promoCodes'
import {
  ensureEvmChain,
  fetchEvmWalletOverview,
  fetchEvmBuyerSnapshot,
  loadEvmConfig,
  submitEvmBuy,
  submitEvmClaim,
} from '../lib/evmPresale'
import {
  buildSolanaBuyTransaction,
  buildSolanaClaimTransaction,
  confirmSolanaSignature,
  connectInjectedSolanaWallet,
  fetchSolanaBuyerSnapshot,
  fetchSolanaWalletOverview,
  formatSolanaExplorerUrl,
  getInjectedSolanaProvider,
  getSolanaProviderInstallUrl,
  loadDevnetSolanaConfig,
  shortAddress,
  submitSignedSolanaTransaction,
  submitSolanaBuy,
  submitSolanaClaim,
} from '../lib/solanaPresale'

const EVM_MOBILE_PENDING_PROVIDER_KEY = 'aioracle-evm-mobile-pending-provider'
const EVM_TESTNET_PROMPT_PROVIDER_IDS = new Set(['trustwallet', 'safepal', 'binance'])
const EVM_MOBILE_RESUME_ATTEMPT_TIMEOUT_MS = 8000
const EVM_MOBILE_RESUME_RETRY_INTERVAL_MS = 2000
const EVM_MOBILE_RESUME_MAX_WAIT_MS = 45000

function persistPendingEvmMobileProvider(providerId) {
  if (typeof window === 'undefined' || !providerId) {
    return
  }

  window.sessionStorage.setItem(EVM_MOBILE_PENDING_PROVIDER_KEY, providerId)
}

function readPendingEvmMobileProvider() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.sessionStorage.getItem(EVM_MOBILE_PENDING_PROVIDER_KEY) || ''
}

function clearPendingEvmMobileProvider() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(EVM_MOBILE_PENDING_PROVIDER_KEY)
}

function withAsyncTimeout(task, timeoutMs, timeoutMessage) {
  let timeoutId

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, timeoutMs)
  })

  return Promise.race([Promise.resolve().then(task), timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  })
}

function getInitialSaleEnvironmentId() {
  const validEnvironmentIds = new Set(['production', 'devnet', 'local'])

  if (typeof window === 'undefined') {
    return 'devnet'
  }

  const query = new URLSearchParams(window.location.search).get('sale_env')
  if (validEnvironmentIds.has(query)) {
    return query
  }

  const envFromBuild = import.meta.env.VITE_APP_ENV
  if (validEnvironmentIds.has(envFromBuild)) {
    return envFromBuild
  }

  const stored = window.localStorage.getItem('aioracle-sale-environment')
  if (stored === 'production') {
    return 'devnet'
  }

  if (validEnvironmentIds.has(stored)) {
    return stored
  }

  // Default to devnet unless production is explicitly requested. This keeps
  // local development and ad hoc previews on the safer test route by default.
  return 'devnet'
}

function getInitialNetworkId() {
  return getInitialSaleEnvironmentId() === 'devnet' ? 'bsc' : PRESALE_CONFIG.defaultNetworkId
}

function getBaseTxState({ wallet, networkId, canReview, amountNumber }) {
  if (!wallet) {
    return 'wallet_not_connected'
  }

  if (wallet.network !== networkId) {
    return 'wrong_network'
  }

  if (amountNumber > 0 && !canReview) {
    return 'input_invalid'
  }

  return 'idle'
}

function createMockAddress(networkId) {
  if (networkId === 'solana') {
    const seed = Math.random().toString(36).slice(2, 12)
    return `${seed.toUpperCase()}...${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  }

  const seed = Math.random().toString(16).slice(2, 12)
  return `0x${seed}...${Math.random().toString(16).slice(2, 6)}`
}

function isMobileClient() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent || navigator.vendor || ''
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent)
}

function getInstallUrlForProvider(provider) {
  if (!provider) {
    return ''
  }

  if (isMobileClient()) {
    return provider.mobileInstallUrl || provider.installUrl || getSolanaProviderInstallUrl(provider.id)
  }

  return provider.installUrl || getSolanaProviderInstallUrl(provider.id)
}

function consumeWalletEntryParams() {
  if (typeof window === 'undefined') {
    return null
  }

  const url = new URL(window.location.href)
  const providerId = url.searchParams.get('wallet_entry')

  if (!providerId) {
    return null
  }

  const environmentId = url.searchParams.get('sale_env') || 'devnet'
  const networkId = url.searchParams.get('wallet_network') || ''

  url.searchParams.delete('wallet_entry')
  url.searchParams.delete('wallet_cluster')
  url.searchParams.delete('wallet_network')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)

  return {
    providerId,
    environmentId,
    networkId,
  }
}

function getSuggestedAmountForToken(symbol) {
  if (symbol === 'ETH') {
    return '0.12'
  }

  if (symbol === 'SOL') {
    return '8'
  }

  return String(PRESALE_CONFIG.minPurchaseUsd)
}

function formatUsd(value, formatter) {
  return `$${formatter.format(value)}`
}

function formatStagePrice(value, formatter) {
  if (value < 0.01) {
    return `$${value.toFixed(4)}`
  }

  if (value < 1) {
    return `$${value.toFixed(3)}`
  }

  return `$${formatter.format(value)}`
}

function dispatchWalletLoginSuccess(providerName) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent('aioracle:wallet-login-success', {
      detail: {
        providerName: providerName ?? 'Wallet',
      },
    }),
  )
}

function dispatchSuccessNotice(title, message) {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent('aioracle:success-notice', {
      detail: {
        title,
        message,
      },
    }),
  )
}

function getDisplayNetworkLabel(networkId) {
  return networkId === 'solana' ? 'SOLANA' : 'BSC/ETH'
}

function getMaxAmountForToken(symbol) {
  if (symbol === 'ETH') {
    return '0.5'
  }

  if (symbol === 'SOL') {
    return '20'
  }

  return '2500'
}

function extractErrorMessage(error) {
  if (!error) {
    return 'Transaction failed. Please try again.'
  }

  const nestedCandidates = [
    error.details,
    error.error?.details,
    error.error?.reason,
    error.cause?.reason,
    error.info?.error?.message,
    error.info?.error?.data?.message,
    error.info?.message,
    error.cause?.message,
    error.originalError?.message,
    error.error?.data?.message,
    error.data?.originalError?.message,
  ]

  const candidates = [
    error.shortMessage,
    error.reason,
    error.error?.message,
    error.data?.message,
    error.message,
    ...nestedCandidates,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  const errorCode = error?.code ?? error?.error?.code ?? error?.info?.error?.code
  if (errorCode != null && errorCode !== '') {
    return `Wallet request failed (code: ${String(errorCode)}).`
  }

  if (typeof error === 'object') {
    try {
      const serialized = JSON.stringify(error)
      if (serialized && serialized !== '{}' && serialized !== '[]') {
        return serialized.length > 220 ? `${serialized.slice(0, 217)}...` : serialized
      }
    } catch {
      // Ignore serialization errors and fall through to the generic fallback.
    }
  }

  return 'Transaction failed. Please try again.'
}

function normalizeWalletErrorMessage(error) {
  const message = extractErrorMessage(error)
  const normalized = message.toLowerCase()
  const code = error?.code
  const nestedCode = error?.error?.code

  if (
    code === 4001 ||
    nestedCode === 4001 ||
    code === 'ACTION_REJECTED' ||
    normalized.includes('action_rejected') ||
    normalized.includes('user denied') ||
    normalized.includes('user rejected') ||
    normalized.includes('ethers-user-denied') ||
    normalized.includes('transaction signature') && normalized.includes('denied') ||
    normalized.includes('request rejected')
  ) {
    return 'You canceled the wallet confirmation.'
  }

  if (normalized.includes('missing walletconnect project id')) {
    return 'WalletConnect is not available for this deployment yet.'
  }

  if (normalized.includes('wallet connected but did not return an account')) {
    return 'The wallet connected, but no account address was returned.'
  }

  if (normalized.includes('selected evm wallet extension was not detected')) {
    return 'The selected wallet extension was not detected in this browser.'
  }

  return message.length > 220 ? `${message.slice(0, 217)}...` : message
}

function isWalletConfirmationCanceledMessage(message) {
  const normalized = String(message || '').toLowerCase()

  return (
    normalized.includes('you canceled the wallet confirmation') ||
    normalized.includes('user denied') ||
    normalized.includes('user rejected') ||
    normalized.includes('request rejected') ||
    normalized.includes('action_rejected')
  )
}

function classifyPendingEvmWalletResumeMessage(message) {
  const normalized = String(message || '').toLowerCase()

  if (isWalletConfirmationCanceledMessage(normalized)) {
    return 'canceled'
  }

  if (
    normalized.includes('no walletconnect pairing is active') ||
    normalized.includes('wallet connected but did not return an account') ||
    normalized.includes('walletconnect session expired while returning from your wallet')
  ) {
    return 'missing_result'
  }

  if (
    normalized.includes('walletconnect pairing finished, but the wallet account is still syncing') ||
    normalized.includes('walletconnect pairing finished without returning an account') ||
    normalized.includes('timed out while creating a walletconnect session') ||
    normalized.includes('did not sync yet')
  ) {
    return 'waiting'
  }

  return 'error'
}

function toBigIntComparable(value) {
  if (value == null || value === '') {
    return 0n
  }

  try {
    return BigInt(String(value))
  } catch {
    return 0n
  }
}

function getEvmSnapshotMarker(snapshot) {
  const buyerPosition = snapshot?.buyerPosition

  return {
    purchaseCount: toBigIntComparable(buyerPosition?.purchaseCount),
    purchasedTokens: toBigIntComparable(buyerPosition?.purchasedTokens),
    paidAmount: toBigIntComparable(buyerPosition?.paidAmount),
  }
}

function didEvmPurchaseAdvance(previousMarker, nextMarker) {
  return (
    nextMarker.purchaseCount > previousMarker.purchaseCount ||
    nextMarker.purchasedTokens > previousMarker.purchasedTokens ||
    nextMarker.paidAmount > previousMarker.paidAmount
  )
}

function QuickAccessButton({ method, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(method)}
      className="group flex h-10 items-center justify-center rounded-[0.95rem] transition-all hover:-translate-y-0.5 sm:h-12 sm:rounded-[1.15rem]"
      aria-label={method.label}
      title={method.label}
    >
      <PaymentBrandIcon brand={method.brand} className="h-5 w-5 transition-transform group-hover:scale-105 sm:h-7 sm:w-7" />
    </button>
  )
}

function getDefaultProviderForNetwork(networkId) {
  return networkId === 'solana' ? 'phantom' : 'metamask'
}

function getExplorerClusterForEnvironment(saleEnvironmentId) {
  return saleEnvironmentId === 'devnet' ? 'devnet' : ''
}

function toHistoryRecord(record) {
  return {
    id: record.id,
    activityType: record.activityType ?? 'purchase',
    networkLabel: record.networkLabel,
    token: record.token,
    paymentToken: record.paymentToken ?? record.token,
    paymentAmount: record.paymentAmount ?? 0,
    usdAmount: record.usdAmount ?? 0,
    aio: record.aio ?? 0,
    txHash: record.txHash ?? '',
    referenceId: record.referenceId ?? '',
    explorerUrl: record.explorerUrl ?? '',
    promoCode: record.promoCode ?? '',
    status: record.status ?? '',
    commissionMode: record.commissionMode ?? 'deduction',
    directReferrerWalletAddress: record.directReferrerWalletAddress ?? '',
    indirectReferrerWalletAddress: record.indirectReferrerWalletAddress ?? '',
    directCommissionBps: record.directCommissionBps ?? 0,
    indirectCommissionBps: record.indirectCommissionBps ?? 0,
    directCommissionAmount: record.directCommissionAmount ?? 0,
    indirectCommissionAmount: record.indirectCommissionAmount ?? 0,
    totalCommissionAmount: record.totalCommissionAmount ?? 0,
    netAmount: record.netAmount ?? record.paymentAmount ?? 0,
    createdAt: record.createdAt ?? '',
  }
}

function isDisplayableWalletActivity(record) {
  const activityType = String(record?.activityType ?? '').trim().toLowerCase()
  return activityType === 'purchase' || activityType === 'claim'
}

function normalizeEvmChainId(chainId) {
  if (chainId == null) {
    return null
  }

  if (typeof chainId === 'string') {
    return chainId.startsWith('0x') ? Number.parseInt(chainId, 16) : Number.parseInt(chainId, 10)
  }

  return Number(chainId)
}

function getEvmNetworkIdForChainId(chainId) {
  const normalizedChainId = normalizeEvmChainId(chainId)

  if (normalizedChainId === 56 || normalizedChainId === 97) {
    return 'bsc'
  }

  if (normalizedChainId === 1 || normalizedChainId === 11155111 || normalizedChainId === 31337) {
    return 'ethereum'
  }

  return null
}

async function resolveEvmProviderChainId(walletProvider, fallbackChainId = null) {
  if (!walletProvider?.request) {
    return fallbackChainId
  }

  try {
    return await walletProvider.request({ method: 'eth_chainId' })
  } catch {
    return fallbackChainId
  }
}

function getRecommendedWalletNetworkLabel({ networkId, saleEnvironmentId }) {
  if (networkId === 'solana') {
    return saleEnvironmentId === 'devnet' ? 'Solana Devnet' : 'Solana Mainnet'
  }

  if (saleEnvironmentId === 'devnet') {
    return networkId === 'ethereum' ? 'Ethereum Sepolia' : 'BNB Smart Chain Testnet'
  }

  if (saleEnvironmentId === 'local') {
    return networkId === 'ethereum' ? 'Local Ethereum' : 'BNB Smart Chain Testnet'
  }

  return networkId === 'bsc' ? 'BNB Smart Chain' : 'Ethereum'
}

function getRouteTokenOptions({ networkId, evmConfig }) {
  const networkTokens = getTokenOptionsForNetwork(networkId)

  if (networkId !== 'bsc' && networkId !== 'ethereum') {
    return networkTokens
  }

  const configuredSymbol = String(evmConfig?.paymentTokenSymbol || PRESALE_CONFIG.defaultToken || 'USDC')
    .trim()
    .toUpperCase()
  const configuredToken = networkTokens.find((token) => token.symbol === configuredSymbol)

  if (configuredToken) {
    return [configuredToken]
  }

  const defaultToken = networkTokens.find((token) => token.symbol === PRESALE_CONFIG.defaultToken)
  if (defaultToken) {
    return [defaultToken]
  }

  return networkTokens.slice(0, 1)
}

function getEvmClaimNetworkLabel({ networkId, saleEnvironmentId, evmConfig }) {
  return evmConfig?.chainName || getRecommendedWalletNetworkLabel({ networkId, saleEnvironmentId })
}

function isEvmNetworkId(networkId) {
  return networkId === 'ethereum' || networkId === 'bsc'
}

function shouldPromptEvmTestnetForProvider(providerId) {
  return EVM_TESTNET_PROMPT_PROVIDER_IDS.has(providerId)
}

function enrichProviderWithRuntimeState(provider, walletConnectReady) {
  if (!provider) {
    return null
  }

  const mobileClient = isMobileClient()
  let detected = null
  let status = provider.status

  if (provider.groupId === 'solana') {
    detected = provider.connectMode === 'direct' ? Boolean(getInjectedSolanaProvider(provider.id)) : null
  } else if (provider.groupId === 'evm') {
    const injectedProviderDetected = Boolean(getInjectedEvmProvider(provider.id))
    const hasMobileAppRoute = supportsEvmInAppBrowserRoute(provider.id) || Boolean(provider.mobileInstallUrl)

    if (mobileClient && !injectedProviderDetected) {
      detected = null
      status = hasMobileAppRoute
        ? 'OPEN APP'
        : walletConnectReady
          ? provider.status
          : 'SETUP REQUIRED'
    } else {
      detected = injectedProviderDetected
    }

    if (!mobileClient && provider.connectMode === 'qr' && detected !== true && !walletConnectReady) {
      status = 'SETUP REQUIRED'
    }
  }

  return {
    ...provider,
    detected,
    status: detected === false ? 'NOT FOUND' : status,
  }
}

export default function PresaleConsole({
  countdownText,
  onOpenPriceTable,
  presaleProgressPercent = PRESALE_CONFIG.soldPercent,
  presaleRemainingAio = PRESALE_CONFIG.remainingAio,
}) {
  const { content, formatText, localeInfo, locale } = useLocale()
  const flowText = useMemo(() => getFlowText(locale), [locale])
  const [networkId, setNetworkId] = useState(getInitialNetworkId)
  const [saleEnvironmentId, setSaleEnvironmentId] = useState(getInitialSaleEnvironmentId)
  const [tokenSymbol, setTokenSymbol] = useState(PRESALE_CONFIG.defaultToken)
  const [amount, setAmount] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [wallet, setWallet] = useState(null)
  const [txState, setTxState] = useState('idle')
  const [txMessage, setTxMessage] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isWalletQrOpen, setIsWalletQrOpen] = useState(false)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [cardNetworkId, setCardNetworkId] = useState(getInitialNetworkId)
  const [cardTokenSymbol, setCardTokenSymbol] = useState(getCardTokenForNetwork(PRESALE_CONFIG.defaultNetworkId))
  const [cardAmount, setCardAmount] = useState(String(PRESALE_CONFIG.minPurchaseUsd))
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState(getDefaultProviderForNetwork(PRESALE_CONFIG.defaultNetworkId))
  const [qrProviderId, setQrProviderId] = useState(null)
  const [qrRoute, setQrRoute] = useState(null)
  const [pendingQrProviderId, setPendingQrProviderId] = useState(null)
  const [isDesktopQrAwaitingWallet, setIsDesktopQrAwaitingWallet] = useState(false)
  const [preferredCardMethodId, setPreferredCardMethodId] = useState('mastercard')
  const [history, setHistory] = useState([])
  const [referralSummary, setReferralSummary] = useState(null)
  const [lastResolvedInputKey, setLastResolvedInputKey] = useState('')
  const [solanaConfig, setSolanaConfig] = useState(null)
  const [solanaBuyerSnapshot, setSolanaBuyerSnapshot] = useState(null)
  const [evmConfig, setEvmConfig] = useState(null)
  const [evmWalletNetworkConfig, setEvmWalletNetworkConfig] = useState(null)
  const [evmBuyerSnapshot, setEvmBuyerSnapshot] = useState(null)
  const [walletOverview, setWalletOverview] = useState(null)
  const [isWalletOverviewOpen, setIsWalletOverviewOpen] = useState(false)
  const [isWalletOverviewLoading, setIsWalletOverviewLoading] = useState(false)
  const [isPurchaseFollowupOpen, setIsPurchaseFollowupOpen] = useState(false)
  const [isPurchaseFollowupChecking, setIsPurchaseFollowupChecking] = useState(false)
  const [purchaseFollowupMessage, setPurchaseFollowupMessage] = useState('')
  const [isPurchaseLoaderActive, setIsPurchaseLoaderActive] = useState(false)
  const [walletNotice, setWalletNotice] = useState('')
  const [walletFlowMode, setWalletFlowMode] = useState('purchase')
  const [walletHandoffPreparing, setWalletHandoffPreparing] = useState(null)
  const [pendingWalletEntryProviderId, setPendingWalletEntryProviderId] = useState('')

  const saleEnvironment = getSaleEnvironment(saleEnvironmentId)
  const numberFormatter = useMemo(() => new Intl.NumberFormat(localeInfo.intlLocale), [localeInfo.intlLocale])
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(localeInfo.intlLocale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [localeInfo.intlLocale],
  )
  const amountNumber = Number(amount) || 0
  const shouldShowMinimumHint = amount.trim() === ''
  const inputKey = `${saleEnvironmentId}:${networkId}:${tokenSymbol}:${amount}:${promoCode}`
  const availablePurchaseTokens = useMemo(
    () => getRouteTokenOptions({ networkId, evmConfig }),
    [evmConfig, networkId],
  )
  const quote = usePresaleCalculator({
    amount: amountNumber,
    networkId,
    tokenSymbol,
    promoCode,
    availableTokens: availablePurchaseTokens,
  })
  const cardQuote = usePresaleCalculator({
    amount: Number(cardAmount) || 0,
    networkId: cardNetworkId,
    tokenSymbol: cardTokenSymbol,
    promoCode,
  })
  const baseTxState = getBaseTxState({
    wallet,
    networkId,
    canReview: quote.canReview,
    amountNumber,
  })
  const isBusy = txState === 'awaiting_signature' || txState === 'submitted'
  const isLoginFlow = walletFlowMode === 'login'
  const isResolvedWithSameInputs =
    (txState === 'confirmed' || txState === 'failed') && lastResolvedInputKey === inputKey
  const displayTxState = isBusy || isResolvedWithSameInputs ? txState : baseTxState
  const walletConnectReady = hasWalletConnectProjectId()
  const selectedProvider = enrichProviderWithRuntimeState(getWalletProvider(selectedProviderId), walletConnectReady)
  const qrProvider = enrichProviderWithRuntimeState(getWalletProvider(qrProviderId), walletConnectReady)
  const qrProviderRuntimeId = qrProvider?.id ?? ''
  const qrProviderRuntimeName = qrProvider?.name ?? ''
  const qrProviderRuntimeBrand = qrProvider?.brand ?? ''
  const qrProviderRuntimeGroupId = qrProvider?.groupId ?? ''
  const stableQrProvider = useMemo(
    () => (
      qrProviderRuntimeId
        ? {
            id: qrProviderRuntimeId,
            name: qrProviderRuntimeName,
            brand: qrProviderRuntimeBrand,
            groupId: qrProviderRuntimeGroupId,
          }
        : null
    ),
    [qrProviderRuntimeBrand, qrProviderRuntimeGroupId, qrProviderRuntimeId, qrProviderRuntimeName],
  )
  const prefersSolanaMobileWalletRoute = useMemo(() => isMobileClient(), [])
  const prefersEvmMobileWalletRoute = useMemo(() => isMobileClient(), [])
  const selectedNetwork = quote.selectedNetwork
  const selectedToken = quote.selectedToken
  const connectedProviderGroupId =
    wallet?.network === 'solana' ? 'solana' : wallet?.network ? 'evm' : null
  const hasOverlayOpen =
    isWalletModalOpen ||
    isWalletQrOpen ||
    isCardModalOpen ||
    isConfirmOpen ||
    isWalletOverviewOpen ||
    isPurchaseFollowupOpen
  const isSolanaRoute = networkId === 'solana'
  const isSolanaDevnetLive = isSolanaRoute && saleEnvironmentId === 'devnet'
  const isEvmRoute = networkId === 'bsc' || networkId === 'ethereum'
  const evmConfigUrl =
    isEvmRoute
      ? saleEnvironment.evm?.configUrls?.[networkId] ?? saleEnvironment.evm?.configUrl ?? null
      : null
  const evmWalletNetworkConfigUrl =
    isEvmRoute
      ? saleEnvironment.evm?.walletNetworkConfigUrls?.[networkId] ?? null
      : null
  const isEvmTestLive = isEvmRoute && Boolean(evmConfigUrl)
  const solanaContractEnabled = isSolanaRoute && saleEnvironment.solana.contractEnabled
  const evmContractEnabled = isEvmRoute && saleEnvironment.evm?.contractEnabled && isEvmTestLive
  const devnetExplorerCluster = getExplorerClusterForEnvironment(saleEnvironmentId)
  const selectedProviderMissing = selectedProvider?.detected === false
  const normalizedWalletChainId = normalizeEvmChainId(wallet?.chainId)
  const selectedPaymentTokenSymbol =
    isEvmRoute
      ? evmConfig?.paymentTokenSymbol || selectedToken?.symbol || tokenSymbol
      : selectedToken?.symbol || tokenSymbol
  const evmClaimNetworkLabel = useMemo(
    () => getEvmClaimNetworkLabel({ networkId, saleEnvironmentId, evmConfig }),
    [evmConfig, networkId, saleEnvironmentId],
  )
  const promoFeedbackMessage = useMemo(
    () =>
      getPromoCodeMessage({
        locale,
        status: quote.promoCodeStatus,
        promoCode: quote.promoCodeNormalized,
        rule: quote.promoCodeRule,
        validCodes: quote.validPromoCodes,
        numberFormatter,
      }),
    [
      locale,
      numberFormatter,
      quote.promoCodeNormalized,
      quote.promoCodeRule,
      quote.promoCodeStatus,
      quote.validPromoCodes,
    ],
  )
  const blockPromoCodeIssue = useCallback(() => {
    const nextMessage = promoFeedbackMessage || 'Promo code requirements were not met.'
    setTxState('failed')
    setTxMessage(nextMessage)
    setWalletNotice(nextMessage)
    setLastResolvedInputKey(inputKey)
    setIsWalletModalOpen(false)
    setIsWalletQrOpen(false)
    setIsConfirmOpen(false)

    if (typeof window !== 'undefined') {
      window.alert(nextMessage)
    }

    return nextMessage
  }, [inputKey, promoFeedbackMessage])
  const openConnectedWalletPurchaseReview = useCallback(() => {
    setWalletFlowMode('purchase')
    setSelectedProviderId((current) => wallet?.providerId ?? current ?? getDefaultProviderForNetwork(networkId))
    setWalletNotice('')
    setIsWalletModalOpen(false)
    setIsWalletQrOpen(false)
    setIsConfirmOpen(true)
  }, [networkId, wallet?.providerId])
  const finishWalletConnectionFlow = useCallback((providerName, flowMode = walletFlowMode) => {
    setTxState('idle')
    setIsWalletModalOpen(false)
    setIsWalletQrOpen(false)

    if (flowMode === 'purchase') {
      setWalletNotice('')
      setIsConfirmOpen(quote.canReview)
      return
    }

    setIsConfirmOpen(false)
    dispatchWalletLoginSuccess(providerName)
  }, [dispatchWalletLoginSuccess, quote.canReview, walletFlowMode])
  const handleEvmBuyProgress = useCallback((event) => {
    setPurchaseFollowupMessage('')

    switch (event?.stage) {
      case 'approval_required':
        setTxState('awaiting_signature')
        setTxMessage(flowText.interpolate(flowText.presaleFlow.evmApprovalRequired, { token: selectedPaymentTokenSymbol }))
        return
      case 'approval_submitted':
        setTxState('submitted')
        setTxMessage(flowText.interpolate(flowText.presaleFlow.evmApprovalSubmitted, { token: selectedPaymentTokenSymbol }))
        return
      case 'purchase_required':
        setTxState('awaiting_signature')
        setTxMessage(flowText.presaleFlow.evmPurchaseSignatureRequired)
        return
      case 'purchase_submitted':
        setTxState('submitted')
        setTxMessage(flowText.presaleFlow.evmPurchaseSubmitted)
        return
      default:
        return
    }
  }, [flowText, selectedPaymentTokenSymbol])
  const walletSummaryLabel =
    wallet?.network === 'solana'
      ? wallet?.providerName
      : normalizedWalletChainId === 97
        ? `${wallet?.providerName ?? 'Wallet'} on BNB Smart Chain Testnet`
        : normalizedWalletChainId === 56
        ? `${wallet?.providerName ?? 'Wallet'} on BNB Smart Chain`
        : normalizedWalletChainId === 11155111
          ? `${wallet?.providerName ?? 'Wallet'} on Ethereum Sepolia`
          : normalizedWalletChainId === 1
            ? `${wallet?.providerName ?? 'Wallet'} on Ethereum`
            : normalizedWalletChainId === 31337
              ? `${wallet?.providerName ?? 'Wallet'} on Local Ethereum`
            : wallet?.providerName ?? ''
  const visibleHistory = history.filter(isDisplayableWalletActivity)
  const isMobileWalletSession = Boolean(wallet?.isMobileSession)
  const globalLoaderTimeoutRef = useRef(null)
  const claimOriginRef = useRef('page')
  const evmPurchaseBaselineRef = useRef(getEvmSnapshotMarker(null))
  const walletHandoffStartedAtRef = useRef(0)
  const walletHandoffTimeoutRef = useRef(null)
  const qrConnectInFlightRef = useRef(false)
  const loadWalletActivity = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      setHistory([])
      return []
    }

    try {
      const records = await fetchWalletActivity({
        walletAddress,
        limit: 20,
      })
      const nextHistory = records.map(toHistoryRecord)
      setHistory(nextHistory)
      return nextHistory
    } catch (error) {
      console.warn('Unable to load wallet activity history.', error)
      return []
    }
  }, [])
  const loadReferralSummary = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      setReferralSummary(null)
      return null
    }

    try {
      const summary = await fetchReferralSummary({
        walletAddress,
        limit: 20,
      })
      setReferralSummary(summary)
      return summary
    } catch (error) {
      console.warn('Unable to load referral summary.', error)
      return null
    }
  }, [])
  const translatePresale = useCallback(
    (key, values) => formatText(content.presale[key], values),
    [content.presale, formatText],
  )
  const dispatchGlobalLoader = useCallback((detail) => {
    if (typeof window === 'undefined') {
      return
    }

    window.dispatchEvent(
      new CustomEvent('aioracle:global-loader', {
        detail,
      }),
    )
  }, [])
  const showGlobalLoader = useCallback((message, label = 'AIOracle') => {
    if (globalLoaderTimeoutRef.current) {
      window.clearTimeout(globalLoaderTimeoutRef.current)
      globalLoaderTimeoutRef.current = null
    }

    dispatchGlobalLoader({
      active: true,
      label,
      message,
    })
  }, [dispatchGlobalLoader])
  const showTransientGlobalLoader = useCallback((message, durationMs = 5000, label = 'AIOracle') => {
    showGlobalLoader(message, label)

    if (typeof window === 'undefined') {
      return
    }

    globalLoaderTimeoutRef.current = window.setTimeout(() => {
      dispatchGlobalLoader({
        active: false,
      })
      globalLoaderTimeoutRef.current = null
    }, durationMs)
  }, [dispatchGlobalLoader, showGlobalLoader])
  const hideGlobalLoader = useCallback(() => {
    if (globalLoaderTimeoutRef.current) {
      window.clearTimeout(globalLoaderTimeoutRef.current)
      globalLoaderTimeoutRef.current = null
    }

    dispatchGlobalLoader({
      active: false,
    })
  }, [dispatchGlobalLoader])
  const showWalletHandoffPreparing = useCallback((provider, options = {}) => {
    if (walletHandoffTimeoutRef.current) {
      window.clearTimeout(walletHandoffTimeoutRef.current)
      walletHandoffTimeoutRef.current = null
    }

    walletHandoffStartedAtRef.current = Date.now()
    setWalletHandoffPreparing({
      providerName: provider.name,
      providerBrand: provider.brand,
      heading: options.heading,
      title: options.title,
      description: options.description,
      badgeLabel: options.badgeLabel,
    })
  }, [])
  const waitForWalletHandoffPreparing = useCallback((minimumVisibleMs = 1400) => {
    if (typeof window === 'undefined') {
      setWalletHandoffPreparing(null)
      return Promise.resolve()
    }

    const elapsed = Date.now() - walletHandoffStartedAtRef.current
    const remaining = Math.max(minimumVisibleMs - elapsed, 0)

    if (walletHandoffTimeoutRef.current) {
      window.clearTimeout(walletHandoffTimeoutRef.current)
      walletHandoffTimeoutRef.current = null
    }

    return new Promise((resolve) => {
      if (remaining === 0) {
        setWalletHandoffPreparing(null)
        resolve()
        return
      }

      walletHandoffTimeoutRef.current = window.setTimeout(() => {
        setWalletHandoffPreparing(null)
        walletHandoffTimeoutRef.current = null
        resolve()
      }, remaining)
    })
  }, [])
  const clearWalletHandoffPreparing = useCallback(() => {
    if (walletHandoffTimeoutRef.current) {
      window.clearTimeout(walletHandoffTimeoutRef.current)
      walletHandoffTimeoutRef.current = null
    }

    setWalletHandoffPreparing(null)
  }, [])
  const showWalletSelectionPreparing = useCallback((provider) => {
    showWalletHandoffPreparing(provider, {
      heading: flowText.walletConnect.checkingWallet,
      title: flowText.interpolate(flowText.walletConnect.processingSelectionTitle, { provider: provider.name }),
      description: flowText.walletConnect.processingSelectionDescription,
      badgeLabel: flowText.walletConnect.processingSelectionBadge,
    })
  }, [flowText, showWalletHandoffPreparing])
  const runWithGlobalLoader = useCallback(async (message, task) => {
    showGlobalLoader(message)

    try {
      const result = await task()
      hideGlobalLoader()
      return result
    } catch (error) {
      hideGlobalLoader()
      throw error
    }
  }, [hideGlobalLoader, showGlobalLoader])

  const normalizedPresaleProgressPercent = useMemo(
    () => Math.min(Math.max(Number(presaleProgressPercent) || 0, 0), 100),
    [presaleProgressPercent],
  )
  const normalizedPresaleRemainingAio = useMemo(
    () => Math.max(Number(presaleRemainingAio) || 0, 0),
    [presaleRemainingAio],
  )
  const presaleProgressLabel = useMemo(() => {
    const normalizedValue = Math.round(normalizedPresaleProgressPercent * 10) / 10
    return Number.isInteger(normalizedValue) ? String(normalizedValue) : normalizedValue.toFixed(1)
  }, [normalizedPresaleProgressPercent])

  const raiseTargetUsd = useMemo(() => {
    const soldRatio = Math.min(Math.max(normalizedPresaleProgressPercent / 100, 0), 0.99)
    const totalAio = soldRatio > 0 ? normalizedPresaleRemainingAio / (1 - soldRatio) : normalizedPresaleRemainingAio
    return totalAio * getStagePrice(PRESALE_CONFIG.currentStage)
  }, [normalizedPresaleProgressPercent, normalizedPresaleRemainingAio])

  const raisedUsd = raiseTargetUsd * (normalizedPresaleProgressPercent / 100)
  const testTokenHint =
    solanaConfig?.paymentMint && isSolanaDevnetLive
      ? `Devnet payment mint ${shortAddress(solanaConfig.paymentMint, 6, 6)}`
      : null
  const solanaRpcUrl = saleEnvironment.solana.rpcUrl
  const refreshSolanaSnapshot = useCallback(async (buyerAddress = wallet?.address) => {
    if (!buyerAddress || !solanaConfig || !isSolanaDevnetLive) {
      setSolanaBuyerSnapshot(null)
      return
    }

    try {
      const snapshot = await fetchSolanaBuyerSnapshot({
        config: solanaConfig,
        buyerAddress,
      })
      setSolanaBuyerSnapshot(snapshot)
    } catch (error) {
      setTxMessage(error.message)
    }
  }, [isSolanaDevnetLive, solanaConfig, wallet?.address])

  const refreshEvmSnapshot = async (buyerAddress = wallet?.address) => {
    if (!buyerAddress || !evmConfig || !isEvmTestLive || !wallet?.providerInstance) {
      setEvmBuyerSnapshot(null)
      return
    }

    try {
      const snapshot = await fetchEvmBuyerSnapshot({
        config: evmConfig,
        walletProvider: wallet.providerInstance,
        buyerAddress,
      })
      setEvmBuyerSnapshot(snapshot)
    } catch (error) {
      setTxMessage(error.message)
    }
  }
  const requestProviderTestNetwork = useCallback(async (providerId, walletProvider) => {
    if (!walletProvider || !isEvmRoute) {
      return
    }

    if (isEvmTestLive && evmConfig) {
      await ensureEvmChain(walletProvider, evmConfig, { providerId })
      return
    }

    if (
      saleEnvironmentId !== 'devnet' ||
      !shouldPromptEvmTestnetForProvider(providerId) ||
      !evmWalletNetworkConfig
    ) {
      return
    }

    await ensureEvmChain(walletProvider, evmWalletNetworkConfig, { providerId })
  }, [evmConfig, evmWalletNetworkConfig, isEvmRoute, isEvmTestLive, saleEnvironmentId])
  const ensureInjectedEvmWalletReady = useCallback(async () => {
    if (!prefersEvmMobileWalletRoute || !isEvmRoute) {
      return wallet
    }

    const providerId = wallet?.providerId ?? selectedProviderId
    const provider = enrichProviderWithRuntimeState(getWalletProvider(providerId), walletConnectReady)

    if (!provider || provider.groupId !== 'evm' || provider.detected !== true) {
      return wallet
    }

    const injectedProvider = getInjectedEvmProvider(provider.id)
    if (!injectedProvider) {
      return wallet
    }

    if (wallet?.providerInstance === injectedProvider && wallet?.address) {
      return wallet
    }

    setTxMessage(flowText.interpolate(flowText.presaleFlow.connectingWallet, { provider: provider.name }))
    const connection = await connectInjectedEvmWallet(provider.id)
    await requestProviderTestNetwork(provider.id, connection.walletProvider)
    const resolvedChainId = await resolveEvmProviderChainId(connection.walletProvider, connection.chainId)

    const nextWallet = {
      address: connection.address,
      network: getEvmNetworkIdForChainId(resolvedChainId) ?? networkId,
      providerId: provider.id,
      providerName: provider.name,
      brand: provider.brand,
      providerType: 'evm',
      providerInstance: connection.walletProvider,
      chainId: resolvedChainId,
    }

    setWallet(nextWallet)
    setSelectedProviderId(provider.id)
    return nextWallet
  }, [
    flowText,
    isEvmRoute,
    networkId,
    prefersEvmMobileWalletRoute,
    requestProviderTestNetwork,
    selectedProviderId,
    wallet,
    walletConnectReady,
  ])
  const closePurchaseFollowup = useCallback(() => {
    setIsPurchaseFollowupChecking(false)
    setPurchaseFollowupMessage('')
    setIsPurchaseFollowupOpen(false)
  }, [])
  const persistWalletActivityRecord = useCallback(async ({
    walletAddress,
    activity,
    fallbackRecord,
    refreshReferralSummary = false,
    warningMessage = 'Unable to persist wallet activity.',
  }) => {
    if (!walletAddress || !activity) {
      if (fallbackRecord) {
        setHistory((current) => [fallbackRecord, ...current].slice(0, 20))
      }
      return
    }

    try {
      await recordWalletActivity(activity)
      await loadWalletActivity(walletAddress)
      if (refreshReferralSummary) {
        await loadReferralSummary(walletAddress)
      }
    } catch (error) {
      console.warn(warningMessage, error)
      if (fallbackRecord) {
        setHistory((current) => [fallbackRecord, ...current].slice(0, 20))
      }
    }
  }, [loadReferralSummary, loadWalletActivity])
  const recordWalletLoginActivity = useCallback(async (walletInfo) => {
    if (!walletInfo?.address) {
      return
    }

    await persistWalletActivityRecord({
      walletAddress: walletInfo.address,
      activity: {
        walletAddress: walletInfo.address,
        networkId: walletInfo.network === 'bsc' || walletInfo.network === 'ethereum' ? walletInfo.network : 'solana',
        activityType: 'login',
        walletProviderId: walletInfo.providerId,
        walletProviderName: walletInfo.providerName,
        walletProviderBrand: walletInfo.brand,
        walletProviderType: walletInfo.providerType,
        status: 'connected',
        referenceId: `login-${walletInfo.providerId || 'wallet'}-${walletInfo.address}-${Date.now()}`,
        source: walletInfo.isMobileSession ? 'mobile-browser' : 'browser',
      },
      warningMessage: 'Unable to persist wallet login activity.',
    })
  }, [persistWalletActivityRecord])
  const syncPendingEvmPurchase = useCallback(async ({ closeAfterCheck = false } = {}) => {
    if (!wallet?.address || !wallet?.providerInstance || !evmConfig) {
      const nextMessage = flowText.presaleFlow.evmSessionMissing
      setTxMessage(nextMessage)
      setWalletNotice(nextMessage)

      if (closeAfterCheck) {
        closePurchaseFollowup()
      }

      return false
    }

    setIsPurchaseFollowupChecking(true)
    setPurchaseFollowupMessage(flowText.confirmPurchase.handoffChecking)

    try {
      const snapshot = await fetchEvmBuyerSnapshot({
        config: evmConfig,
        walletProvider: wallet.providerInstance,
        buyerAddress: wallet.address,
      })

      const nextMarker = getEvmSnapshotMarker(snapshot)
      const purchaseConfirmed = didEvmPurchaseAdvance(evmPurchaseBaselineRef.current, nextMarker)

      setEvmBuyerSnapshot(snapshot)

      if (purchaseConfirmed) {
        evmPurchaseBaselineRef.current = nextMarker
        setLastResolvedInputKey(inputKey)
        setTxState('confirmed')
        setTxMessage(flowText.interpolate(flowText.presaleFlow.purchaseConfirmedEvm, {
          chainName: evmConfig.chainName,
          contract: shortAddress(evmConfig.presale, 6, 6),
        }))
        setWalletNotice('')
        closePurchaseFollowup()
        await loadWalletActivity(wallet.address)
        await loadReferralSummary(wallet.address)
        return true
      }

      const pendingMessage = flowText.confirmPurchase.handoffPending
      setPurchaseFollowupMessage(pendingMessage)
      setTxMessage(pendingMessage)
      setWalletNotice(pendingMessage)

      if (closeAfterCheck) {
        setTxState('idle')
        closePurchaseFollowup()
      }

      return false
    } catch (error) {
      const nextMessage = normalizeWalletErrorMessage(error)
      setPurchaseFollowupMessage(nextMessage)
      setTxMessage(nextMessage)
      setWalletNotice(nextMessage)

      if (closeAfterCheck) {
        setTxState('idle')
        closePurchaseFollowup()
      }

      return false
    } finally {
      setIsPurchaseFollowupChecking(false)
    }
  }, [
    closePurchaseFollowup,
    evmConfig,
    flowText,
    inputKey,
    loadReferralSummary,
    loadWalletActivity,
    wallet?.address,
    wallet?.providerInstance,
  ])
  const claimableAmount = solanaBuyerSnapshot?.claimableUi ?? 0
  const evmClaimableAmount = evmBuyerSnapshot?.claimableUi ?? 0
  const walletOverviewWarning =
    wallet?.network === 'solana'
      ? walletOverview && walletOverview.hasProjectTokenConfig === false
        ? flowText.interpolate(flowText.presaleFlow.suggestSolanaNetwork, {
            network: getRecommendedWalletNetworkLabel({ networkId: 'solana', saleEnvironmentId }),
          })
        : ''
      : wallet?.network === 'bsc' || wallet?.network === 'ethereum'
        ? walletOverview && walletOverview.hasProjectTokenConfig === false
          ? flowText.interpolate(flowText.presaleFlow.suggestEvmNetwork, {
              network: getRecommendedWalletNetworkLabel({ networkId, saleEnvironmentId }),
            })
          : ''
        : ''

  useEffect(() => {
    window.localStorage.setItem('aioracle-sale-environment', saleEnvironmentId)
  }, [saleEnvironmentId])

  useEffect(() => {
    if (txState === 'confirmed') {
      closePurchaseFollowup()
    }
  }, [closePurchaseFollowup, txState])

  useEffect(() => {
    if (!isPurchaseLoaderActive) {
      return undefined
    }

    if (isPurchaseFollowupOpen) {
      hideGlobalLoader()
      return undefined
    }

    const nextMessage = txMessage || flowText.confirmPurchase.processingPurchase
    showGlobalLoader(nextMessage)

    if (txState === 'confirmed' || txState === 'failed') {
      setIsPurchaseLoaderActive(false)
      hideGlobalLoader()
    }

    return () => {
      if (!isPurchaseLoaderActive || isPurchaseFollowupOpen) {
        return
      }

      hideGlobalLoader()
    }
  }, [
    flowText,
    hideGlobalLoader,
    isPurchaseFollowupOpen,
    isPurchaseLoaderActive,
    showGlobalLoader,
    txMessage,
    txState,
  ])

  useEffect(() => {
    if (!wallet?.address) {
      setHistory([])
      setReferralSummary(null)
      closePurchaseFollowup()
      return
    }

    void loadWalletActivity(wallet.address)
    void loadReferralSummary(wallet.address)
  }, [closePurchaseFollowup, loadReferralSummary, loadWalletActivity, wallet?.address])

  useEffect(() => {
    const callbackResult = consumeSolanaWalletCallback()

    if (!callbackResult) {
      return
    }

    let cancelled = false

    async function restoreMobileWalletFlow() {
      showGlobalLoader(
        callbackResult.action === 'connect'
          ? flowText.presaleFlow.restoringMobileWallet
          : flowText.presaleFlow.syncingMobileTx,
      )

      if (callbackResult.environmentId && callbackResult.environmentId !== saleEnvironmentId) {
        setSaleEnvironmentId(callbackResult.environmentId)
      }

      if (!callbackResult.ok) {
        setIsWalletModalOpen(false)
        setIsWalletQrOpen(false)
        setLastResolvedInputKey(inputKey)
        setTxState('failed')
        setTxMessage(callbackResult.error)
        setWalletNotice(callbackResult.error)
        hideGlobalLoader()
        return
      }

      const provider = getWalletProvider(callbackResult.providerId)
      const mobileAddress = callbackResult.address ?? callbackResult.mobileSession?.address ?? wallet?.address ?? ''
      const nextWallet = {
        address: mobileAddress,
        network: 'solana',
        providerId: callbackResult.providerId,
        providerName: provider?.name ?? callbackResult.providerId,
        brand: provider?.brand ?? callbackResult.providerId,
        providerType: 'solana_mobile',
        mobileSession: callbackResult.mobileSession,
        isMobileSession: true,
      }

      // Mobile deeplink callbacks must restore wallet identity before any snapshot or purchase UI can continue.
      setWallet(nextWallet)
      setSelectedProviderId(callbackResult.providerId)
      setWalletFlowMode(callbackResult.flowMode === 'login' ? 'login' : 'purchase')
      setIsWalletModalOpen(false)
      setIsWalletQrOpen(false)

      if (callbackResult.action === 'connect') {
        setTxState('idle')
        if (callbackResult.flowMode === 'login') {
          await recordWalletLoginActivity(nextWallet)
          setWalletNotice(flowText.interpolate(flowText.presaleFlow.mobileSessionRestoredLogin, { provider: provider?.name ?? 'Solana' }))
          setIsConfirmOpen(false)
          dispatchWalletLoginSuccess(provider?.name ?? 'Solana')
        } else {
          setWalletNotice(
            quote.canReview
              ? ''
              : flowText.interpolate(flowText.presaleFlow.mobileSessionRestoredPurchase, { provider: provider?.name ?? 'Solana' }),
          )
          setIsConfirmOpen(quote.canReview)
        }
        hideGlobalLoader()
        return
      }

      const pendingMobileTx = getPendingMobileTransaction()
      if (!pendingMobileTx || pendingMobileTx.action !== callbackResult.action) {
        throw new Error(flowText.presaleFlow.missingPendingMobileTx)
      }

      const actionEnvironmentId = callbackResult.environmentId || pendingMobileTx.environmentId || saleEnvironmentId
      if (actionEnvironmentId !== 'devnet') {
        throw new Error(flowText.presaleFlow.unsupportedMobileCallback)
      }

      const actionEnvironment = getSaleEnvironment(actionEnvironmentId)
      const config = await loadDevnetSolanaConfig(actionEnvironment.solana.configUrl)

      let finalized
      const mobileResult = callbackResult.mobileResult ?? {}
      const signedTransaction =
        mobileResult.transaction ?? mobileResult.signed_transaction ?? mobileResult.signedTransaction ?? null
      const returnedSignature = mobileResult.signature ?? mobileResult.txid ?? mobileResult.hash ?? null

      setTxState('submitted')

      if (signedTransaction) {
        finalized = await submitSignedSolanaTransaction({
          config,
          signedTransaction,
        })
      } else if (returnedSignature) {
        finalized = await confirmSolanaSignature({
          config,
          signature: returnedSignature,
        })
      } else {
        throw new Error(flowText.presaleFlow.missingMobileSignature)
      }

      if (cancelled) {
        hideGlobalLoader()
        return
      }

      clearPendingMobileTransaction()
      setLastResolvedInputKey(inputKey)
      setTxState('confirmed')
      setWalletNotice('')
      setSolanaConfig(config)
      const explorerUrl = formatSolanaExplorerUrl(finalized.signature, getExplorerClusterForEnvironment(actionEnvironmentId))

      if (callbackResult.action === 'buy') {
        const purchase = {
          id: Date.now(),
          activityType: 'purchase',
          networkLabel: pendingMobileTx.networkLabel,
          token: pendingMobileTx.token,
          paymentToken: pendingMobileTx.token,
          paymentAmount: Number(pendingMobileTx.paymentAmount || 0),
          usdAmount: Number(pendingMobileTx.usdAmount || 0),
          aio: pendingMobileTx.aio,
          baseAmountAio: pendingMobileTx.baseAmountAio,
          bonusAmountAio: pendingMobileTx.bonusAmountAio,
          tgeUnlock: pendingMobileTx.tgeUnlock,
          txHash: finalized.signature,
          explorerUrl,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        }
        await persistWalletActivityRecord({
          walletAddress: mobileAddress,
          activity: {
            walletAddress: mobileAddress,
            networkId: 'solana',
            activityType: 'purchase',
            status: 'confirmed',
            paymentToken: pendingMobileTx.token,
            paymentAmount: Number(pendingMobileTx.paymentAmount || 0),
            purchaseAmountAio: pendingMobileTx.aio,
            baseAmountAio: pendingMobileTx.baseAmountAio,
            bonusAmountAio: pendingMobileTx.bonusAmountAio,
            usdAmount: Number(pendingMobileTx.usdAmount || 0),
            promoCode: pendingMobileTx.promoCode,
            promoId: pendingMobileTx.promoId,
            txHash: finalized.signature,
            explorerUrl,
            chainAction: 'solana_buy',
            contractAddress: config.programId,
            buyerPositionKey: pendingMobileTx.buyerPositionPda,
            source: 'mobile',
          },
          fallbackRecord: purchase,
          refreshReferralSummary: true,
          warningMessage: 'Unable to persist Solana mobile purchase history.',
        })
        setTxMessage(flowText.interpolate(flowText.presaleFlow.mobileBuyConfirmed, {
          pda: shortAddress(pendingMobileTx.buyerPositionPda, 6, 6),
        }))
      } else {
        const claim = {
          id: Date.now(),
          activityType: 'claim',
          networkLabel: pendingMobileTx.networkLabel,
          token: 'AIO Claim',
          paymentToken: 'AIO',
          paymentAmount: 0,
          aio: pendingMobileTx.aio,
          tgeUnlock: pendingMobileTx.tgeUnlock,
          txHash: finalized.signature,
          explorerUrl,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        }
        await persistWalletActivityRecord({
          walletAddress: mobileAddress,
          activity: {
            walletAddress: mobileAddress,
            networkId: 'solana',
            activityType: 'claim',
            status: 'confirmed',
            paymentToken: 'AIO',
            paymentAmount: 0,
            purchaseAmountAio: pendingMobileTx.aio,
            baseAmountAio: pendingMobileTx.aio,
            bonusAmountAio: 0,
            txHash: finalized.signature,
            explorerUrl,
            allocationType: 'claim',
            chainAction: 'claim',
            contractAddress: config.programId,
            buyerPositionKey: pendingMobileTx.buyerPositionPda,
            source: 'mobile',
          },
          fallbackRecord: claim,
          warningMessage: 'Unable to persist Solana mobile claim history.',
        })
        setTxMessage(flowText.interpolate(flowText.presaleFlow.mobileClaimConfirmed, {
          signature: finalized.signature,
        }))
        dispatchSuccessNotice(
          flowText.successNotice.claimSuccessTitle,
          flowText.interpolate(flowText.successNotice.claimSuccessMessage, {
            amount: Math.max(Math.floor(pendingMobileTx.aio || 0), 0),
          }),
        )
      }

      await refreshSolanaSnapshot(mobileAddress)
      hideGlobalLoader()
    }

    restoreMobileWalletFlow().catch((error) => {
      if (cancelled) {
        hideGlobalLoader()
        return
      }

      clearPendingMobileTransaction()
      setIsWalletModalOpen(false)
      setIsWalletQrOpen(false)
      setLastResolvedInputKey(inputKey)
      setTxState('failed')
      const nextMessage = normalizeWalletErrorMessage(error)
      setTxMessage(nextMessage)
      setWalletNotice(nextMessage)
      hideGlobalLoader()
    })

    return () => {
      cancelled = true
      hideGlobalLoader()
    }
  }, [flowText, hideGlobalLoader, inputKey, persistWalletActivityRecord, quote.canReview, refreshSolanaSnapshot, saleEnvironmentId, showGlobalLoader, wallet?.address])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('aioracle:wallet-state', {
        detail: {
          address: wallet?.address ?? '',
          network: wallet?.network ?? '',
          providerId: wallet?.providerId ?? '',
          providerName: wallet?.providerName ?? '',
          brand: wallet?.brand ?? '',
        },
      }),
    )
  }, [wallet])

  useEffect(() => {
    consumeReferralCandidateFromUrl()
  }, [])

  useEffect(() => {
    if (!wallet?.address) {
      return
    }

    const candidate = getStoredReferralCandidate() || consumeReferralCandidateFromUrl()
    const candidateWallet = String(candidate?.referrerWalletAddress || '').trim()
    if (!candidateWallet && !candidate?.referralCode) {
      return
    }

    if (candidateWallet && candidateWallet.toLowerCase() === wallet.address.toLowerCase()) {
      clearStoredReferralCandidate()
      return
    }

    let cancelled = false

    async function syncReferralBinding() {
      try {
        await bindWalletReferral({
          walletAddress: wallet.address,
          referrerWalletAddress: candidate?.referrerWalletAddress,
          referralCode: candidate?.referralCode,
          bindSource: candidate?.bindSource || 'share_link',
        })
        clearStoredReferralCandidate()
        if (!cancelled) {
          await loadReferralSummary(wallet.address)
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to bind referral relationship.', error)
          setWalletNotice(error instanceof Error ? error.message : 'Unable to bind referral relationship.')
        }
      }
    }

    void syncReferralBinding()

    return () => {
      cancelled = true
    }
  }, [loadReferralSummary, wallet?.address])

  const providerGroupsWithDetection = WALLET_PROVIDER_GROUPS.map((group) => ({
    ...group,
    providers: group.providers.map((provider) =>
      enrichProviderWithRuntimeState(
        {
          ...provider,
          groupId: group.id,
        },
        walletConnectReady,
      ),
    ),
  })).filter((group) => group.providers.length > 0)

  useEffect(() => {
    if (!hasOverlayOpen) {
      return undefined
    }

    const releaseScrollLock = lockBodyScroll()

    return () => {
      releaseScrollLock()
    }
  }, [hasOverlayOpen])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') {
        return
      }

      if (!isBusy) {
        setIsConfirmOpen(false)
      }

      setIsWalletModalOpen(false)
      setIsWalletOverviewOpen(false)
      setIsWalletQrOpen(false)
      setIsCardModalOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isBusy])

  useEffect(() => {
    let cancelled = false

    async function loadConfig() {
      if (saleEnvironmentId !== 'devnet') {
        setSolanaConfig(null)
        return
      }

      try {
        const config = await loadDevnetSolanaConfig(saleEnvironment.solana.configUrl)
        if (!cancelled) {
          setSolanaConfig(config)
        }
      } catch (error) {
        if (!cancelled) {
          setSolanaConfig(null)
          setTxMessage(error.message)
        }
      }
    }

    loadConfig()

    return () => {
      cancelled = true
    }
  }, [saleEnvironment, saleEnvironmentId])

  useEffect(() => {
    let cancelled = false

    async function loadConfig() {
      if (!evmConfigUrl) {
        setEvmConfig(null)
        return
      }

      try {
        const config = await loadEvmConfig(evmConfigUrl)
        if (!cancelled) {
          setEvmConfig(config)
        }
      } catch (error) {
        if (!cancelled) {
          setEvmConfig(null)
          setTxMessage(error.message)
        }
      }
    }

    loadConfig()

    return () => {
      cancelled = true
    }
  }, [evmConfigUrl])

  useEffect(() => {
    let cancelled = false

    async function loadWalletNetworkConfig() {
      if (!evmWalletNetworkConfigUrl) {
        setEvmWalletNetworkConfig(null)
        return
      }

      try {
        const config = await loadEvmConfig(evmWalletNetworkConfigUrl)
        if (!cancelled) {
          setEvmWalletNetworkConfig(config)
        }
      } catch (error) {
        if (!cancelled) {
          setEvmWalletNetworkConfig(null)
          setTxMessage(error.message)
        }
      }
    }

    loadWalletNetworkConfig()

    return () => {
      cancelled = true
    }
  }, [evmWalletNetworkConfigUrl])

  useEffect(() => {
    if (!wallet || !isSolanaDevnetLive || wallet.network !== 'solana') {
      setSolanaBuyerSnapshot(null)
      return
    }

    let cancelled = false

    async function syncSnapshot() {
      if (!wallet.address || !solanaConfig || !isSolanaDevnetLive) {
        return
      }

      try {
        const snapshot = await fetchSolanaBuyerSnapshot({
          config: solanaConfig,
          buyerAddress: wallet.address,
        })
        if (!cancelled) {
          setSolanaBuyerSnapshot(snapshot)
        }
      } catch (error) {
        if (!cancelled) {
          setTxMessage(error.message)
        }
      }
    }

    syncSnapshot()

    return () => {
      cancelled = true
    }
  }, [wallet, isSolanaDevnetLive, solanaConfig])

  useEffect(() => {
    if (!wallet || !isEvmTestLive || !wallet.providerInstance || !isEvmRoute) {
      setEvmBuyerSnapshot(null)
      return
    }

    let cancelled = false

    async function syncSnapshot() {
      if (!wallet.address || !evmConfig || !wallet.providerInstance) {
        return
      }

      try {
        const snapshot = await fetchEvmBuyerSnapshot({
          config: evmConfig,
          walletProvider: wallet.providerInstance,
          buyerAddress: wallet.address,
        })
        if (!cancelled) {
          setEvmBuyerSnapshot(snapshot)
        }
      } catch (error) {
        if (!cancelled) {
          setTxMessage(error.message)
        }
      }
    }

    syncSnapshot()

    return () => {
      cancelled = true
    }
  }, [wallet, isEvmTestLive, isEvmRoute, evmConfig])

  const handleNetworkChange = useCallback((nextNetworkId) => {
    const nextTokens = getTokenOptionsForNetwork(nextNetworkId)
    const defaultToken = getDefaultTokenForNetwork(nextNetworkId)
    const nextToken =
      nextTokens.find((token) => token.symbol === defaultToken)?.symbol ??
      nextTokens.find((token) => token.symbol === tokenSymbol)?.symbol ??
      nextTokens[0]?.symbol ??
      tokenSymbol
    const fallbackProvider = getDefaultProviderForNetwork(nextNetworkId)
    const currentProvider = getWalletProvider(selectedProviderId)

    setNetworkId(nextNetworkId)
    setTokenSymbol(nextToken)
    setTxMessage('')
    setWalletNotice('')

    if (
      !currentProvider ||
      (nextNetworkId === 'solana' && currentProvider.groupId !== 'solana') ||
      (nextNetworkId !== 'solana' && currentProvider.groupId !== 'evm')
    ) {
      setSelectedProviderId(fallbackProvider)
    }
  }, [selectedProviderId, tokenSymbol])

  useEffect(() => {
    const walletEntry = consumeWalletEntryParams()

    if (!walletEntry || wallet?.address) {
      return
    }

    const provider = getWalletProvider(walletEntry.providerId)
    if (!provider) {
      return
    }

    if (walletEntry.environmentId && walletEntry.environmentId !== saleEnvironmentId) {
      setSaleEnvironmentId(walletEntry.environmentId)
    }

    if (provider.groupId === 'evm' && isEvmNetworkId(walletEntry.networkId) && walletEntry.networkId !== networkId) {
      handleNetworkChange(walletEntry.networkId)
    }

    setSelectedProviderId(provider.id)
    setWalletFlowMode('login')
    setPendingWalletEntryProviderId(provider.groupId === 'evm' ? provider.id : '')
    setWalletNotice(
      provider.groupId === 'solana'
        ? getInjectedSolanaProvider(provider.id)
          ? flowText.interpolate(flowText.presaleFlow.enteredInAppBrowserReady, { provider: provider.name })
          : flowText.interpolate(flowText.presaleFlow.enteredInAppBrowserWait, { provider: provider.name })
        : getInjectedEvmProvider(provider.id)
          ? flowText.interpolate(flowText.presaleFlow.enteredInAppBrowserReady, { provider: provider.name })
          : flowText.interpolate(flowText.presaleFlow.enteredWalletEnvironment, { provider: provider.name }),
    )
    setIsWalletModalOpen(true)
  }, [flowText, handleNetworkChange, networkId, saleEnvironmentId, wallet?.address])

  useEffect(() => {
    if (!wallet?.address) {
      return
    }

    if (wallet.network === 'solana') {
      if (networkId !== 'solana') {
        handleNetworkChange('solana')
        setWalletNotice(flowText.presaleFlow.switchedToSolana)
      }
      if (selectedProviderId !== wallet.providerId) {
        setSelectedProviderId(wallet.providerId)
      }
      return
    }

    if (isEvmNetworkId(wallet.network)) {
      if (networkId === 'solana') {
        handleNetworkChange(wallet.network)
        setWalletNotice(flowText.interpolate(flowText.presaleFlow.switchedToEvm, {
          provider: wallet.providerName ?? 'EVM',
          network: wallet.network === 'bsc' ? 'BSC' : 'Ethereum',
        }))
      }
      if (selectedProviderId !== wallet.providerId) {
        setSelectedProviderId(wallet.providerId)
      }
    }
  }, [flowText, handleNetworkChange, networkId, selectedProviderId, wallet])

  useEffect(() => {
    const fallbackToken = availablePurchaseTokens[0]?.symbol
    if (!fallbackToken) {
      return
    }

    if (!availablePurchaseTokens.some((token) => token.symbol === tokenSymbol)) {
      setTokenSymbol(fallbackToken)
    }
  }, [availablePurchaseTokens, tokenSymbol])

  const handleTokenChange = (nextTokenSymbol) => {
    const tokenExists = availablePurchaseTokens.some((token) => token.symbol === nextTokenSymbol)

    if (tokenExists) {
      setTokenSymbol(nextTokenSymbol)
      return
    }

    const fallbackToken = availablePurchaseTokens[0]?.symbol ?? tokenSymbol
    setTokenSymbol(fallbackToken)
  }

  const finalizeEvmWalletConnection = useCallback(async (provider, connection) => {
    await requestProviderTestNetwork(provider.id, connection.walletProvider)
    const resolvedChainId = await resolveEvmProviderChainId(connection.walletProvider, connection.chainId)
    const nextWallet = {
      address: connection.address,
      network: getEvmNetworkIdForChainId(resolvedChainId) ?? networkId,
      providerId: provider.id,
      providerName: provider.name,
      brand: provider.brand,
      providerType: 'evm',
      providerInstance: connection.walletProvider,
      chainId: resolvedChainId,
    }

    setWallet(nextWallet)
    setSelectedProviderId(provider.id)
    await recordWalletLoginActivity(nextWallet)
    finishWalletConnectionFlow(provider.name)
  }, [finishWalletConnectionFlow, networkId, recordWalletLoginActivity, requestProviderTestNetwork])

  const connectWallet = useCallback(async (provider) => {
    setTxMessage('')
    setWalletNotice('')

    if (provider.groupId === 'solana' && saleEnvironmentId === 'devnet') {
      const detectedProvider = getInjectedSolanaProvider(provider.id)
      if (!detectedProvider) {
        const installUrl = getSolanaProviderInstallUrl(provider.id)
        throw new Error(flowText.interpolate(flowText.presaleFlow.walletNotDetectedInstall, {
          provider: provider.name,
          installUrl,
        }))
      }

      const connection = await connectInjectedSolanaWallet(provider.id)
      const nextWallet = {
        address: connection.address,
        network: 'solana',
        providerId: provider.id,
        providerName: provider.name,
        brand: provider.brand,
        providerType: 'solana',
        providerInstance: connection.walletProvider,
      }

      setWallet(nextWallet)
      setSelectedProviderId(provider.id)
      await recordWalletLoginActivity(nextWallet)
      finishWalletConnectionFlow(provider.name)
      return
    }

    const shouldUseWalletConnectResume =
      provider.groupId === 'evm' &&
      readPendingEvmMobileProvider() === provider.id &&
      prefersEvmMobileWalletRoute

    if (
      provider.groupId === 'evm' &&
      !shouldUseWalletConnectResume &&
      (provider.connectMode === 'direct' || provider.detected === true)
    ) {
      const connection = await connectInjectedEvmWallet(provider.id)
      await finalizeEvmWalletConnection(provider, connection)
      return
    }

    if (provider.groupId === 'evm' && (provider.connectMode === 'qr' || shouldUseWalletConnectResume)) {
      const connection = await completeEvmWalletConnectSession()
      await finalizeEvmWalletConnection(provider, connection)
      return
    }

    const nextWallet = {
      address: createMockAddress(networkId),
      network: networkId,
      providerId: provider.id,
      providerName: provider.name,
      brand: provider.brand,
      providerType: provider.groupId,
    }

    setWallet(nextWallet)
    setSelectedProviderId(provider.id)
    await recordWalletLoginActivity(nextWallet)
    finishWalletConnectionFlow(provider.name)
  }, [
    evmConfig,
    finalizeEvmWalletConnection,
    finishWalletConnectionFlow,
    flowText,
    getInjectedSolanaProvider,
    isEvmTestLive,
    networkId,
    prefersEvmMobileWalletRoute,
    recordWalletLoginActivity,
    saleEnvironmentId,
  ])

  useEffect(() => {
    if (typeof window === 'undefined' || !prefersEvmMobileWalletRoute || !walletConnectReady) {
      return undefined
    }

    let cancelled = false
    let isResuming = false
    let resumeStartedAt = 0
    let resumeProviderId = ''
    let retryTimeoutId = null

    const clearRetryTimeout = () => {
      if (retryTimeoutId) {
        window.clearTimeout(retryTimeoutId)
        retryTimeoutId = null
      }
    }

    const resetResumeTracking = () => {
      clearRetryTimeout()
      resumeStartedAt = 0
      resumeProviderId = ''
    }

    const scheduleResumeRetry = () => {
      clearRetryTimeout()
      retryTimeoutId = window.setTimeout(() => {
        if (cancelled || document.visibilityState !== 'visible') {
          return
        }

        void resumePendingWalletConnect()
      }, EVM_MOBILE_RESUME_RETRY_INTERVAL_MS)
    }

    const resumePendingWalletConnect = async () => {
      if (cancelled || isResuming) {
        return
      }

      const pendingProviderId = readPendingEvmMobileProvider()
      if (!pendingProviderId) {
        resetResumeTracking()
        return
      }

      if (resumeProviderId !== pendingProviderId) {
        resumeProviderId = pendingProviderId
        resumeStartedAt = Date.now()
      }

      const pendingProvider = enrichProviderWithRuntimeState(getWalletProvider(pendingProviderId), walletConnectReady)
      const shouldResumeWalletConnect =
        pendingProvider?.groupId === 'evm' &&
        !supportsEvmInAppBrowserRoute(pendingProvider.id) &&
        (pendingProvider.connectMode === 'qr' || pendingProvider.id === 'metamask')

      if (!pendingProvider || !shouldResumeWalletConnect) {
        clearPendingEvmMobileProvider()
        resetResumeTracking()
        return
      }

      isResuming = true
      clearRetryTimeout()
      setPendingQrProviderId(pendingProvider.id)
      setWalletNotice(flowText.interpolate(flowText.presaleFlow.walletReturnSyncing, { provider: pendingProvider.name }))
      showGlobalLoader(flowText.interpolate(flowText.presaleFlow.waitingWalletConfirm, { provider: pendingProvider.name }))

      try {
        if (pendingProvider.detected === true) {
          const directConnection = await withAsyncTimeout(
            () => connectInjectedEvmWallet(pendingProvider.id),
            EVM_MOBILE_RESUME_ATTEMPT_TIMEOUT_MS,
            flowText.interpolate(flowText.presaleFlow.walletReturnSyncFallback, { provider: pendingProvider.name }),
          )
          await finalizeEvmWalletConnection(pendingProvider, directConnection)
          clearPendingEvmMobileProvider()
          resetResumeTracking()
          hideGlobalLoader()
          return
        }

        const connection = await withAsyncTimeout(
          () => completeEvmWalletConnectSession(),
          EVM_MOBILE_RESUME_ATTEMPT_TIMEOUT_MS,
          flowText.interpolate(flowText.presaleFlow.walletReturnSyncFallback, { provider: pendingProvider.name }),
        )
        await finalizeEvmWalletConnection(pendingProvider, connection)
        clearPendingEvmMobileProvider()
        resetResumeTracking()
        hideGlobalLoader()
      } catch (error) {
        const nextMessage = normalizeWalletErrorMessage(error)
        const resumeIssue = classifyPendingEvmWalletResumeMessage(nextMessage)
        const shouldKeepWaiting = resumeIssue === 'waiting'

        const elapsed = Date.now() - resumeStartedAt
        const canRetryAutomatically =
          shouldKeepWaiting &&
          !cancelled &&
          document.visibilityState === 'visible' &&
          elapsed < EVM_MOBILE_RESUME_MAX_WAIT_MS

        if (canRetryAutomatically) {
          setWalletNotice(flowText.interpolate(flowText.presaleFlow.waitingWalletConfirm, { provider: pendingProvider.name }))
          scheduleResumeRetry()
        } else if (!cancelled && resumeIssue === 'canceled') {
          hideGlobalLoader()
          clearPendingEvmMobileProvider()
          resetResumeTracking()
          setTxState('idle')
          setTxMessage('')
          setWalletNotice(flowText.interpolate(flowText.presaleFlow.walletReturnCanceled, { provider: pendingProvider.name }))
          setIsWalletModalOpen(true)
        } else if (!cancelled && (shouldKeepWaiting || resumeIssue === 'missing_result')) {
          hideGlobalLoader()
          clearPendingEvmMobileProvider()
          resetResumeTracking()
          setTxState('idle')
          setTxMessage('')
          setWalletNotice(flowText.interpolate(flowText.presaleFlow.walletReturnNoResult, { provider: pendingProvider.name }))
          setIsWalletModalOpen(true)
        } else if (!cancelled) {
          hideGlobalLoader()
          clearPendingEvmMobileProvider()
          resetResumeTracking()
          setTxState('failed')
          setTxMessage(nextMessage)
          setWalletNotice(nextMessage)
          setLastResolvedInputKey(inputKey)
        }
      } finally {
        if (!cancelled) {
          setPendingQrProviderId(null)
        }
        isResuming = false
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void resumePendingWalletConnect()
      }
    }

    const handlePageShow = () => {
      void resumePendingWalletConnect()
    }

    void resumePendingWalletConnect()
    window.addEventListener('focus', resumePendingWalletConnect)
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearRetryTimeout()
      window.removeEventListener('focus', resumePendingWalletConnect)
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [
    completeEvmWalletConnectSession,
    finalizeEvmWalletConnection,
    flowText,
    hideGlobalLoader,
    inputKey,
    prefersEvmMobileWalletRoute,
    showGlobalLoader,
    walletConnectReady,
  ])

  useEffect(() => {
    if (!prefersEvmMobileWalletRoute || !walletConnectReady || !isEvmRoute || wallet?.address) {
      return undefined
    }

    let cancelled = false

    void prefetchEvmWalletConnectRoute('Wallet').catch(() => {
      if (cancelled) {
        return
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    isEvmRoute,
    prefersEvmMobileWalletRoute,
    wallet?.address,
    walletConnectReady,
  ])

  useEffect(() => {
    if (!isWalletModalOpen || !prefersEvmMobileWalletRoute || !walletConnectReady || !isEvmRoute) {
      return undefined
    }

    let cancelled = false

    void prefetchEvmWalletConnectRoute('Wallet').catch(() => {
      if (cancelled) {
        return
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    isWalletModalOpen,
    isEvmRoute,
    prefersEvmMobileWalletRoute,
    walletConnectReady,
  ])

  useEffect(() => {
    if (
      !isWalletModalOpen ||
      !prefersEvmMobileWalletRoute ||
      !walletConnectReady ||
      !selectedProvider ||
      selectedProvider.groupId !== 'evm' ||
      selectedProvider.detected === true ||
      supportsEvmInAppBrowserRoute(selectedProvider.id)
    ) {
      return undefined
    }

    let cancelled = false

    void prefetchEvmWalletConnectRoute(selectedProvider.name).catch(() => {
      if (cancelled) {
        return
      }
    })

    return () => {
      cancelled = true
    }
  }, [
    isWalletModalOpen,
    prefersEvmMobileWalletRoute,
    selectedProvider,
    walletConnectReady,
  ])

  const triggerLoginForProvider = async (provider) => {
    if (!provider || isBusy) {
      return
    }

    const shouldUseMetaMaskMobileConnect =
      provider.groupId === 'evm' &&
      provider.id === 'metamask' &&
      prefersEvmMobileWalletRoute

    if (provider.groupId === 'evm' && prefersEvmMobileWalletRoute && provider.detected !== true && !shouldUseMetaMaskMobileConnect) {
      openQrModalForProvider(
        provider,
        flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name }),
      )
      return
    }

    if (provider.groupId === 'evm' && provider.connectMode === 'qr' && provider.detected !== true) {
      if (!walletConnectReady) {
        setWalletNotice(flowText.presaleFlow.missingWalletConnectProjectId)
        return
      }

      openQrModalForProvider(provider)
      return
    }

    if (provider.groupId === 'evm' && provider.detected !== true && !shouldUseMetaMaskMobileConnect) {
      setWalletNotice(flowText.interpolate(flowText.presaleFlow.walletNotDetectedMobile, { provider: provider.name }))
      return
    }

    if (provider.groupId === 'solana' && provider.detected !== true) {
      if (prefersSolanaMobileWalletRoute) {
        openQrModalForProvider(
          provider,
          flowText.interpolate(flowText.presaleFlow.openingWalletReturn, { provider: provider.name }),
        )
        return
      }

      setWalletNotice(flowText.interpolate(flowText.presaleFlow.walletNotDetectedSolana, { provider: provider.name }))
      return
    }

    try {
      await runWithGlobalLoader(flowText.interpolate(flowText.presaleFlow.connectingWallet, { provider: provider.name }), () => connectWallet(provider))
    } catch (error) {
      setTxState('failed')
      const nextMessage = normalizeWalletErrorMessage(error)
      setTxMessage(nextMessage)
      setWalletNotice(nextMessage)
      setLastResolvedInputKey(inputKey)
    }
  }

  useEffect(() => {
    if (!pendingWalletEntryProviderId || wallet?.address || isBusy || typeof window === 'undefined') {
      return undefined
    }

    let cancelled = false
    let started = false

    const autoConnect = async () => {
      if (cancelled || started) {
        return
      }

      const provider = enrichProviderWithRuntimeState(getWalletProvider(pendingWalletEntryProviderId), walletConnectReady)
      if (!provider || provider.groupId !== 'evm') {
        setPendingWalletEntryProviderId('')
        return
      }

      if (provider.detected !== true) {
        return
      }

      started = true
      setPendingWalletEntryProviderId('')
      setIsWalletModalOpen(false)

      try {
        await triggerLoginForProvider(provider)
      } catch {
        // Login errors are handled inside triggerLoginForProvider.
      }
    }

    void autoConnect()
    const intervalId = window.setInterval(() => {
      void autoConnect()
    }, 450)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [isBusy, pendingWalletEntryProviderId, triggerLoginForProvider, wallet?.address, walletConnectReady])

  const handleProviderSelect = async (providerId) => {
    const provider = enrichProviderWithRuntimeState(getWalletProvider(providerId), walletConnectReady)

    if (!provider) {
      return
    }

    const shouldPreserveSolanaLoginGesture =
      isLoginFlow &&
      provider.groupId === 'solana' &&
      prefersSolanaMobileWalletRoute &&
      provider.detected !== true

    const shouldOpenEvmMobileWalletImmediately =
      provider.groupId === 'evm' &&
      prefersEvmMobileWalletRoute &&
      provider.detected !== true

    if (provider.groupId === 'solana' && networkId !== 'solana') {
      handleNetworkChange('solana')
    }

    if (provider.groupId === 'evm' && networkId === 'solana') {
      handleNetworkChange('bsc')
    }

    if (shouldPreserveSolanaLoginGesture) {
      flushSync(() => {
        setSelectedProviderId(provider.id)
        setWalletNotice('')
        setIsWalletModalOpen(true)
      })

      await triggerLoginForProvider(provider)
      return
    }

    if (shouldOpenEvmMobileWalletImmediately) {
      flushSync(() => {
        setSelectedProviderId(provider.id)
        setWalletNotice('')
        setIsWalletModalOpen(true)
      })

      await openQrModalForProvider(
        provider,
        flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name }),
      )
      return
    }

    flushSync(() => {
      showWalletSelectionPreparing(provider)
      setSelectedProviderId(provider.id)
      setWalletNotice('')
      setIsWalletModalOpen(true)
    })
    await waitForWalletHandoffPreparing(1500)

    setSelectedProviderId(provider.id)
    setWalletNotice('')

    if (isLoginFlow) {
      await triggerLoginForProvider(provider)
      return
    }

    if (
      provider.groupId === 'evm' &&
      prefersEvmMobileWalletRoute &&
      provider.detected !== true &&
      provider.id !== 'metamask'
    ) {
      openQrModalForProvider(
        provider,
        flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name }),
      )
      return
    }

    if (
      provider.groupId === 'evm' &&
      provider.connectMode === 'qr' &&
      provider.detected !== true &&
      !prefersEvmMobileWalletRoute &&
      !hasWalletConnectProjectId()
    ) {
      setWalletNotice(flowText.presaleFlow.missingWalletConnectProjectId)
      return
    }

    if (provider.groupId === 'evm' && provider.connectMode === 'qr' && provider.detected === true) {
      setWalletNotice(flowText.interpolate(flowText.presaleFlow.extensionDetectedHint, { provider: provider.name }))
      return
    }

    if (provider.connectMode === 'qr' && provider.detected !== true) {
      openQrModalForProvider(provider)
    }
  }

  const handleInstallSelectedWallet = () => {
    if (!selectedProvider) {
      return
    }

    const installUrl = getInstallUrlForProvider(selectedProvider)
    window.open(installUrl, '_blank', 'noopener,noreferrer')
  }

  const handleOpenMissingWalletRoute = async () => {
    if (!selectedProvider) {
      return
    }

    if (
      selectedProvider.groupId === 'evm' &&
      selectedProvider.connectMode === 'qr' &&
      !prefersEvmMobileWalletRoute &&
      !hasWalletConnectProjectId()
    ) {
      setWalletNotice(flowText.presaleFlow.mobileRouteMissingProjectId)
      return
    }

    openQrModalForProvider(
      selectedProvider,
      flowText.presaleFlow.browserExtensionMissingContinue,
    )
  }

  const handleWalletContinue = async () => {
    if (!selectedProvider || isBusy) {
      return
    }

    if (!isLoginFlow && quote.hasPromoCodeIssue) {
      blockPromoCodeIssue()
      return
    }

    const hasMatchingConnectedWallet =
      !isLoginFlow &&
      Boolean(wallet?.address) &&
      wallet?.providerId === selectedProvider.id &&
      (
        (selectedProvider.groupId === 'solana' && wallet?.network === 'solana') ||
        (selectedProvider.groupId === 'evm' && wallet?.network === networkId)
      )

    if (hasMatchingConnectedWallet) {
      openConnectedWalletPurchaseReview()
      return
    }

    if (
      selectedProvider.groupId === 'evm' &&
      prefersEvmMobileWalletRoute &&
      selectedProvider.detected !== true &&
      selectedProvider.id !== 'metamask'
    ) {
      openQrModalForProvider(
        selectedProvider,
        flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: selectedProvider.name }),
      )
      return
    }

    const canUseDirectProvider = selectedProvider.connectMode === 'direct' || selectedProvider.detected === true
    if (!canUseDirectProvider) {
      return
    }

    // Let users connect first during login flows. Purchase validation only belongs to purchase mode.
    if (!isLoginFlow && !quote.canReview) {
      return
    }

    try {
      if (selectedProvider.groupId === 'solana') {
        if (selectedProvider.detected === true) {
          await runWithGlobalLoader(flowText.interpolate(flowText.presaleFlow.connectingWallet, { provider: selectedProvider.name }), () => connectWallet(selectedProvider))
          return
        }

        if (prefersSolanaMobileWalletRoute && selectedProvider.detected !== true) {
          openQrModalForProvider(
            selectedProvider,
            flowText.interpolate(flowText.presaleFlow.openingWalletReturn, { provider: selectedProvider.name }),
          )
          return
        }

        setIsWalletModalOpen(false)
        setQrProviderId(selectedProvider.id)
        setWalletNotice(flowText.presaleFlow.qrDefaultRoute)
        setIsWalletQrOpen(true)
        return
      }

      await runWithGlobalLoader(flowText.interpolate(flowText.presaleFlow.connectingWallet, { provider: selectedProvider.name }), () => connectWallet(selectedProvider))
    } catch (error) {
      setTxState('failed')
      const nextMessage = normalizeWalletErrorMessage(error)
      setTxMessage(nextMessage)
      setWalletNotice(nextMessage)
      setLastResolvedInputKey(inputKey)
    }
  }

  const handleQrContinue = async () => {
    if (!qrProvider || isBusy || qrConnectInFlightRef.current || isDesktopQrAwaitingWallet) {
      return
    }

    if (!isLoginFlow && quote.hasPromoCodeIssue) {
      blockPromoCodeIssue()
      return
    }

    if (!isLoginFlow && !quote.canReview) {
      return
    }

    try {
      qrConnectInFlightRef.current = true
      await runWithGlobalLoader(flowText.interpolate(flowText.presaleFlow.connectingWallet, { provider: qrProvider.name }), () => connectWallet(qrProvider))
    } catch (error) {
      setTxState('failed')
      const nextMessage = normalizeWalletErrorMessage(error)
      setTxMessage(nextMessage)
      setWalletNotice(nextMessage)
      setLastResolvedInputKey(inputKey)
    } finally {
      qrConnectInFlightRef.current = false
    }
  }

  useEffect(() => {
    if (
      !isWalletQrOpen ||
      prefersEvmMobileWalletRoute ||
      !stableQrProvider ||
      stableQrProvider.groupId !== 'evm' ||
      qrRoute?.source !== 'walletconnect' ||
      wallet?.address
    ) {
      setIsDesktopQrAwaitingWallet(false)
      return undefined
    }

    let cancelled = false
    let polling = false

    const syncDesktopQrSession = async () => {
      if (cancelled || polling || qrConnectInFlightRef.current) {
        return
      }

      polling = true

      try {
        const connection = await getActiveEvmWalletConnectSession()

        if (!connection || cancelled) {
          return
        }

        qrConnectInFlightRef.current = true
        setPendingQrProviderId(stableQrProvider.id)
        setIsDesktopQrAwaitingWallet(false)

        await runWithGlobalLoader(
          flowText.interpolate(flowText.presaleFlow.connectingWallet, { provider: stableQrProvider.name }),
          async () => {
            if (cancelled) {
              return
            }

            setIsWalletQrOpen(false)
            setQrRoute(null)
            await finalizeEvmWalletConnection(stableQrProvider, connection)
            setPendingQrProviderId(null)
          },
        )
      } catch (error) {
        if (!cancelled) {
          const nextMessage = normalizeWalletErrorMessage(error)
          setIsDesktopQrAwaitingWallet(false)
          setPendingQrProviderId(null)
          setTxState('failed')
          setTxMessage(nextMessage)
          setWalletNotice(nextMessage)
          setLastResolvedInputKey(inputKey)
        }
      } finally {
        polling = false

        if (!cancelled) {
          qrConnectInFlightRef.current = false
        }
      }
    }

    setIsDesktopQrAwaitingWallet(true)
    setWalletNotice(flowText.interpolate(flowText.presaleFlow.waitingWalletConfirm, { provider: stableQrProvider.name }))

    void syncDesktopQrSession()

    const intervalId = window.setInterval(() => {
      void syncDesktopQrSession()
    }, 1200)

    const handleFocus = () => {
      void syncDesktopQrSession()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      qrConnectInFlightRef.current = false
      setIsDesktopQrAwaitingWallet(false)
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [
    finalizeEvmWalletConnection,
    flowText,
    inputKey,
    isWalletQrOpen,
    prefersEvmMobileWalletRoute,
    qrRoute?.source,
    runWithGlobalLoader,
    stableQrProvider,
    wallet?.address,
  ])

  const handleConfirmPurchase = async () => {
    try {
      if (quote.hasPromoCodeIssue) {
        throw new Error(promoFeedbackMessage || 'Promo code requirements were not met.')
      }

      setTxMessage(flowText.confirmPurchase.processingPurchase)
      setTxState('awaiting_signature')
      setIsPurchaseLoaderActive(true)

      if (isSolanaDevnetLive) {
        if (!solanaConfig || !wallet?.address) {
          throw new Error(flowText.presaleFlow.solanaSessionMissing)
        }

        if (wallet?.isMobileSession) {
          const builtTransaction = await buildSolanaBuyTransaction({
            config: solanaConfig,
            buyerAddress: wallet.address,
            paymentAmountUi: Number(amount),
            promoId: quote.promoId,
            directReferrerAddress: referralSummary?.binding?.directReferrerWalletAddress,
            indirectReferrerAddress: referralSummary?.binding?.indirectReferrerWalletAddress,
          })

          storePendingMobileTransaction({
            action: 'buy',
            environmentId: saleEnvironmentId,
            providerId: wallet.providerId,
            networkLabel: `${selectedNetwork.label} ${saleEnvironment.label}`,
            token: selectedToken.symbol,
            paymentAmount: Number(amount),
            usdAmount: quote.usdEquivalent,
            aio: quote.estimatedAio,
            baseAmountAio: quote.estimatedAioBase,
            bonusAmountAio: quote.promoBonusAio,
            promoCode,
            promoId: quote.promoId,
            tgeUnlock: quote.tgeUnlock,
            buyerPositionPda: builtTransaction.buyerPositionPda,
          })

          const route = buildSolanaMobileTransactionRoute({
            providerId: wallet.providerId,
            environmentId: saleEnvironmentId,
            flowMode: walletFlowMode,
            action: 'buy',
            session: wallet.mobileSession?.session,
            sharedSecret: wallet.mobileSession?.sharedSecret,
            transaction: builtTransaction.transaction,
            sendOptions:
              wallet.providerId === 'solflare'
                ? {
                    preflightCommitment: 'confirmed',
                    skipPreflight: false,
                  }
                : undefined,
          })

          setTxState('submitted')
          setTxMessage(flowText.presaleFlow.signMobilePurchase)
          setIsConfirmOpen(false)
          window.location.href = route
          return
        }

        if (!wallet?.providerInstance) {
          throw new Error(flowText.presaleFlow.missingSolanaProvider)
        }

        setTxState('submitted')
        const result = await submitSolanaBuy({
          config: solanaConfig,
          walletProvider: wallet.providerInstance,
          paymentAmountUi: Number(amount),
          promoId: quote.promoId,
          directReferrerAddress: referralSummary?.binding?.directReferrerWalletAddress,
          indirectReferrerAddress: referralSummary?.binding?.indirectReferrerWalletAddress,
        })

        const purchase = {
          id: Date.now(),
          activityType: 'purchase',
          networkLabel: `${selectedNetwork.label} ${saleEnvironment.label}`,
          token: selectedPaymentTokenSymbol,
          paymentToken: selectedPaymentTokenSymbol,
          paymentAmount: Number(amount),
          usdAmount: quote.usdEquivalent,
          aio: quote.estimatedAio,
          tgeUnlock: quote.tgeUnlock,
          txHash: result.signature,
          explorerUrl: formatSolanaExplorerUrl(result.signature, devnetExplorerCluster),
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        }

        await persistWalletActivityRecord({
          walletAddress: wallet.address,
          activity: {
            walletAddress: wallet.address,
            networkId,
            activityType: 'purchase',
            status: 'confirmed',
            paymentToken: selectedPaymentTokenSymbol,
            paymentAmount: Number(amount),
            purchaseAmountAio: quote.estimatedAio,
            baseAmountAio: quote.estimatedAioBase,
            bonusAmountAio: quote.promoBonusAio,
            usdAmount: quote.usdEquivalent,
            promoCode,
            promoId: quote.promoId,
            txHash: result.signature,
            explorerUrl: purchase.explorerUrl,
            chainAction: 'solana_buy',
            contractAddress: solanaConfig.programId,
            buyerPositionKey: result.buyerPositionPda,
            source: 'browser',
          },
          fallbackRecord: purchase,
          refreshReferralSummary: true,
          warningMessage: 'Unable to persist Solana purchase history.',
        })

        setLastResolvedInputKey(inputKey)
        setTxState('confirmed')
        setTxMessage(flowText.interpolate(flowText.presaleFlow.purchaseConfirmedSolana, {
          pda: shortAddress(result.buyerPositionPda, 6, 6),
        }))
        setIsConfirmOpen(false)
        await refreshSolanaSnapshot(wallet.address)
        return
      }

      if (isEvmTestLive) {
        const activeWallet = await ensureInjectedEvmWalletReady()

        if (!activeWallet?.providerInstance || !evmConfig) {
          throw new Error(flowText.presaleFlow.evmSessionMissing)
        }

        const shouldUsePurchaseFollowup =
          prefersEvmMobileWalletRoute &&
          !getInjectedEvmProvider(activeWallet.providerId)
        evmPurchaseBaselineRef.current = getEvmSnapshotMarker(evmBuyerSnapshot)

        if (shouldUsePurchaseFollowup) {
          flushSync(() => {
            setPurchaseFollowupMessage(flowText.presaleFlow.signMobilePurchase)
            setIsPurchaseFollowupChecking(false)
            setIsPurchaseFollowupOpen(true)
            setIsConfirmOpen(false)
          })
          setIsPurchaseLoaderActive(false)
        }

        setTxMessage(flowText.presaleFlow.evmPreparingPurchase)
        await withAsyncTimeout(
          () => {
            setTxMessage(flowText.presaleFlow.evmSwitchNetworkPrompt)
            return ensureEvmChain(activeWallet.providerInstance, evmConfig, { providerId: activeWallet.providerId })
          },
          45_000,
          flowText.presaleFlow.evmSwitchNetworkTimeout,
        )
        const result = await submitEvmBuy({
          config: evmConfig,
          walletProvider: activeWallet.providerInstance,
          paymentAmountUi: Number(amount),
          promoId: quote.promoId,
          directReferrerAddress: referralSummary?.binding?.directReferrerWalletAddress,
          indirectReferrerAddress: referralSummary?.binding?.indirectReferrerWalletAddress,
          onProgress: handleEvmBuyProgress,
          approvalTimeoutMessage: flowText.presaleFlow.evmApprovalRequestTimeout,
          purchaseTimeoutMessage: flowText.presaleFlow.evmPurchaseRequestTimeout,
        })

        const purchase = {
          id: Date.now(),
          activityType: 'purchase',
          networkLabel: `${selectedNetwork.label} ${saleEnvironment.label}`,
          token: selectedToken.symbol,
          paymentToken: selectedToken.symbol,
          paymentAmount: Number(amount),
          usdAmount: quote.usdEquivalent,
          aio: quote.estimatedAio,
          tgeUnlock: quote.tgeUnlock,
          txHash: result.hash,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        }

        await persistWalletActivityRecord({
          walletAddress: wallet.address,
          activity: {
            walletAddress: wallet.address,
            networkId,
            activityType: 'purchase',
            status: 'confirmed',
            paymentToken: selectedToken.symbol,
            paymentAmount: Number(amount),
            purchaseAmountAio: quote.estimatedAio,
            baseAmountAio: quote.estimatedAioBase,
            bonusAmountAio: quote.promoBonusAio,
            usdAmount: quote.usdEquivalent,
            promoCode,
            promoId: quote.promoId,
            txHash: result.hash,
            chainAction: 'buyWithPayment',
            contractAddress: evmConfig.presale,
            source: 'browser',
          },
          fallbackRecord: purchase,
          refreshReferralSummary: true,
          warningMessage: 'Unable to persist EVM purchase history.',
        })

        setLastResolvedInputKey(inputKey)
        setTxState('confirmed')
        setTxMessage(flowText.interpolate(flowText.presaleFlow.purchaseConfirmedEvm, {
          chainName: evmConfig.chainName,
          contract: shortAddress(evmConfig.presale, 6, 6),
        }))
        setIsPurchaseLoaderActive(false)
        closePurchaseFollowup()
        setIsConfirmOpen(false)
        await refreshEvmSnapshot(activeWallet.address)
        return
      }

      throw new Error(
        isSolanaRoute && !solanaContractEnabled
          ? flowText.interpolate(flowText.presaleFlow.solanaPurchaseDisabled, {
              address: saleEnvironment.solana.officialTreasury,
            })
          : isEvmRoute && !evmContractEnabled
            ? flowText.interpolate(flowText.presaleFlow.evmPurchaseDisabled, {
                address: saleEnvironment.evm?.officialTreasuryByNetwork?.[networkId] || 'Not configured',
              })
            : flowText.presaleFlow.routeNotLive,
      )
    } catch (error) {
      console.error('EVM/Solana purchase flow failed.', error)
      setLastResolvedInputKey(inputKey)
      setTxState('failed')
      setTxMessage(normalizeWalletErrorMessage(error))
      setIsPurchaseLoaderActive(false)
    }
  }

  const handleClaimTokens = async () => {
    if ((!wallet?.providerInstance && !wallet?.isMobileSession) || isBusy) {
      return
    }

    const claimOrigin = claimOriginRef.current
    const closeOverviewAfterClaim = claimOrigin === 'overview'

    try {
      setTxMessage('')
      setTxState('awaiting_signature')

      if (isEvmTestLive) {
        if (!evmConfig) {
          throw new Error(flowText.presaleFlow.evmConfigMissing)
        }

        const claimAmountUi = Math.max(Math.floor(evmClaimableAmount), 0)
        await ensureEvmChain(wallet.providerInstance, evmConfig, { providerId: wallet.providerId })
        const result = await submitEvmClaim({
          config: evmConfig,
          walletProvider: wallet.providerInstance,
        })

        setTxState('confirmed')
        setLastResolvedInputKey(inputKey)
        setTxMessage(flowText.interpolate(flowText.presaleFlow.claimConfirmedEvm, {
          chainName: evmConfig.chainName,
          txHash: result.hash,
        }))
        dispatchSuccessNotice(
          flowText.successNotice.claimSuccessTitle,
          flowText.interpolate(flowText.successNotice.claimSuccessMessage, {
            amount: Math.max(Math.floor(evmClaimableAmount), 0),
          }),
        )
        if (closeOverviewAfterClaim) {
          setIsWalletOverviewOpen(false)
        }
        await persistWalletActivityRecord({
          walletAddress: wallet.address,
          activity: {
            walletAddress: wallet.address,
            networkId,
            activityType: 'claim',
            status: 'confirmed',
            paymentToken: 'AIO',
            paymentAmount: 0,
            purchaseAmountAio: claimAmountUi,
            baseAmountAio: claimAmountUi,
            bonusAmountAio: 0,
            txHash: result.hash,
            allocationType: 'claim',
            chainAction: 'claim',
            contractAddress: evmConfig.presale,
            source: 'browser',
          },
          fallbackRecord: {
            id: Date.now(),
            activityType: 'claim',
            networkLabel: `${selectedNetwork.label} ${saleEnvironment.label}`,
            token: 'AIO Claim',
            paymentToken: 'AIO',
            paymentAmount: 0,
            aio: claimAmountUi,
            tgeUnlock: claimAmountUi,
            txHash: result.hash,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
          },
          warningMessage: 'Unable to persist EVM claim history.',
        })
        await refreshEvmSnapshot(wallet.address)
        return
      }

      if (!solanaConfig) {
        throw new Error(flowText.presaleFlow.solanaConfigMissing)
      }

      if (wallet?.isMobileSession) {
        const builtTransaction = await buildSolanaClaimTransaction({
          config: solanaConfig,
          buyerAddress: wallet.address,
        })

        storePendingMobileTransaction({
          action: 'claim',
          environmentId: saleEnvironmentId,
          providerId: wallet.providerId,
          networkLabel: `${selectedNetwork.label} ${saleEnvironment.label}`,
          aio: Math.max(Math.floor(claimableAmount), 0),
          baseAmountAio: Math.max(Math.floor(claimableAmount), 0),
          bonusAmountAio: 0,
          tgeUnlock: Math.max(Math.floor(claimableAmount), 0),
          buyerPositionPda: builtTransaction.buyerPositionPda,
        })

        const route = buildSolanaMobileTransactionRoute({
          providerId: wallet.providerId,
          environmentId: saleEnvironmentId,
          flowMode: walletFlowMode,
          action: 'claim',
          session: wallet.mobileSession?.session,
          sharedSecret: wallet.mobileSession?.sharedSecret,
          transaction: builtTransaction.transaction,
          sendOptions:
            wallet.providerId === 'solflare'
              ? {
                  preflightCommitment: 'confirmed',
                  skipPreflight: false,
                }
              : undefined,
        })

        setTxState('submitted')
        setTxMessage(flowText.presaleFlow.signMobileClaim)
        if (closeOverviewAfterClaim) {
          setIsWalletOverviewOpen(false)
        }
        window.location.href = route
        return
      }

      const result = await submitSolanaClaim({
        config: solanaConfig,
        walletProvider: wallet.providerInstance,
      })
      const claimAmountUi = Math.max(Math.floor(claimableAmount), 0)
      const explorerUrl = formatSolanaExplorerUrl(result.signature, devnetExplorerCluster)

      setTxState('confirmed')
      setLastResolvedInputKey(inputKey)
      setTxMessage(flowText.interpolate(flowText.presaleFlow.claimConfirmedSolana, { signature: result.signature }))
      dispatchSuccessNotice(
        flowText.successNotice.claimSuccessTitle,
        flowText.interpolate(flowText.successNotice.claimSuccessMessage, {
          amount: Math.max(Math.floor(claimableAmount), 0),
        }),
      )
      if (closeOverviewAfterClaim) {
        setIsWalletOverviewOpen(false)
      }
      await persistWalletActivityRecord({
        walletAddress: wallet.address,
        activity: {
          walletAddress: wallet.address,
          networkId,
          activityType: 'claim',
          status: 'confirmed',
          paymentToken: 'AIO',
          paymentAmount: 0,
          purchaseAmountAio: claimAmountUi,
          baseAmountAio: claimAmountUi,
          bonusAmountAio: 0,
          txHash: result.signature,
          explorerUrl,
          allocationType: 'claim',
          chainAction: 'claim',
          contractAddress: solanaConfig.programId,
          buyerPositionKey: result.buyerPositionPda,
          source: 'browser',
        },
        fallbackRecord: {
          id: Date.now(),
          activityType: 'claim',
          networkLabel: `${selectedNetwork.label} ${saleEnvironment.label}`,
          token: 'AIO Claim',
          paymentToken: 'AIO',
          paymentAmount: 0,
          aio: claimAmountUi,
          tgeUnlock: claimAmountUi,
          txHash: result.signature,
          explorerUrl,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
        warningMessage: 'Unable to persist Solana claim history.',
      })
      await refreshSolanaSnapshot(wallet.address)
    } catch (error) {
      setTxState('failed')
      setLastResolvedInputKey(inputKey)
      setTxMessage(normalizeWalletErrorMessage(error))
    } finally {
      claimOriginRef.current = 'page'
    }
  }

  const openCryptoModal = () => {
    setIsConfirmOpen(false)

    if (!amount || Number(amount) <= 0) {
      setAmount(String(PRESALE_CONFIG.minPurchaseUsd))
    }

    if (quote.hasPromoCodeIssue) {
      blockPromoCodeIssue()
      return
    }

    if (!wallet?.address) {
      setWalletFlowMode('login')
      setSelectedProviderId((current) => current ?? getDefaultProviderForNetwork(networkId))
      setIsWalletModalOpen(true)
      return
    }

    if (wallet?.address) {
      if (wallet.network === 'solana' && networkId !== 'solana') {
        handleNetworkChange('solana')
        setWalletNotice(flowText.presaleFlow.switchedToSolana)
        return
      }

      if (isEvmNetworkId(wallet.network) && networkId === 'solana') {
        handleNetworkChange(wallet.network)
        setWalletNotice(flowText.interpolate(flowText.presaleFlow.switchedToEvm, {
          provider: wallet.providerName ?? 'EVM',
          network: wallet.network === 'bsc' ? 'BSC' : 'Ethereum',
        }))
        return
      }

      if (selectedProviderId !== wallet.providerId) {
        setSelectedProviderId(wallet.providerId)
      }

      openConnectedWalletPurchaseReview()
      return
    }

    setWalletFlowMode('purchase')
    setSelectedProviderId((current) => wallet?.providerId ?? current ?? getDefaultProviderForNetwork(networkId))
    setIsWalletModalOpen(true)
  }

  const openQrModalForProvider = async (provider, notice = '') => {
    const nextNotice = notice || flowText.interpolate(flowText.presaleFlow.scanWalletPhone, { provider: provider.name })
    const launchWalletHandoffLink = (link) => {
      if (!link) {
        return
      }

      window.location.assign(link)
    }

    const shouldShowWalletConnectQrInsteadOfAutoLaunch = (route) => {
      return provider.groupId === 'evm' && String(route?.link || '').trim().toLowerCase().startsWith('wc:')
    }

    const showWalletConnectQrRoute = (route) => {
      clearPendingEvmMobileProvider()
      clearWalletHandoffPreparing()
      hideGlobalLoader()
      setQrProviderId(provider.id)
      setQrRoute(route)
      setWalletNotice(nextNotice)
      setIsWalletModalOpen(false)
      setIsWalletQrOpen(true)
      setPendingQrProviderId(null)
    }

    const scheduleWalletOpenFallback = (provider) => {
      if (typeof window === 'undefined') {
        return
      }

      window.setTimeout(() => {
        const isStillPending = readPendingEvmMobileProvider() === provider.id
        const pageStillVisible = document.visibilityState === 'visible'

        if (!isStillPending || !pageStillVisible) {
          return
        }

        hideGlobalLoader()
        clearWalletHandoffPreparing()
        setPendingQrProviderId(null)
        setWalletNotice(flowText.interpolate(flowText.presaleFlow.walletOpenFallback, { provider: provider.name }))
        setIsWalletModalOpen(true)
      }, 3500)
    }

    if (provider.groupId === 'evm' && prefersEvmMobileWalletRoute) {
      const inAppBrowserRoute = buildEvmInAppBrowserRoute({
        providerId: provider.id,
        providerName: provider.name,
        environmentId: saleEnvironmentId,
        networkId,
      })
      const canReuseCachedWalletConnectRoute =
        !inAppBrowserRoute?.link && provider.id !== 'safepal'
      const cachedMobileRoute = inAppBrowserRoute?.link
        ? null
        : !canReuseCachedWalletConnectRoute
          ? null
        : getCachedEvmWalletConnectRoute({
            providerId: provider.id,
            providerName: provider.name,
          })
      const immediateRoute = inAppBrowserRoute?.link ? inAppBrowserRoute : cachedMobileRoute

      flushSync(() => {
        showWalletHandoffPreparing(provider)
        setPendingQrProviderId(provider.id)
        setIsWalletModalOpen(true)
        setIsWalletQrOpen(false)
      })

      if (immediateRoute?.link) {
        if (shouldShowWalletConnectQrInsteadOfAutoLaunch(immediateRoute)) {
          showWalletConnectQrRoute(immediateRoute)
          return
        }

        const openingMessage =
          immediateRoute.source === 'browse'
            ? flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name })
            : flowText.interpolate(flowText.presaleFlow.openingWalletConfirm, { provider: provider.name })

        setWalletNotice(openingMessage)
        showGlobalLoader(openingMessage)
        persistPendingEvmMobileProvider(provider.id)
        setIsWalletModalOpen(false)
        clearWalletHandoffPreparing()
        launchWalletHandoffLink(immediateRoute.link)
        scheduleWalletOpenFallback(provider)
        setPendingQrProviderId(null)
        return
      }

      if (!walletConnectReady) {
        clearPendingEvmMobileProvider()
        clearWalletHandoffPreparing()
        hideGlobalLoader()
        setWalletNotice(flowText.interpolate(flowText.presaleFlow.mobileWalletLinkUnavailable, { provider: provider.name }))
        setPendingQrProviderId(null)
        return
      }

      void (async () => {
        try {
          const nextRoute = await buildWalletRoute({
            provider,
            mode: 'mobile',
            flowMode: walletFlowMode,
            environmentId: saleEnvironmentId,
            networkId,
          })

          const handoffLink = nextRoute?.link
          if (!handoffLink) {
            throw new Error(flowText.interpolate(flowText.presaleFlow.mobileWalletLinkUnavailable, { provider: provider.name }))
          }

          if (shouldShowWalletConnectQrInsteadOfAutoLaunch(nextRoute)) {
            showWalletConnectQrRoute(nextRoute)
            return
          }

          const openingMessage =
            nextRoute.source === 'browse'
              ? flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name })
              : flowText.interpolate(flowText.presaleFlow.openingWalletConfirm, { provider: provider.name })

          setWalletNotice(openingMessage)
          showGlobalLoader(openingMessage)
          persistPendingEvmMobileProvider(provider.id)
          setIsWalletModalOpen(false)
          clearWalletHandoffPreparing()
          launchWalletHandoffLink(handoffLink)
          scheduleWalletOpenFallback(provider)
        } catch (error) {
          const nextMessage = normalizeWalletErrorMessage(error)
          setTxState('failed')
          setTxMessage(nextMessage)
          setWalletNotice(nextMessage)
          setLastResolvedInputKey(inputKey)
          clearPendingEvmMobileProvider()
          clearWalletHandoffPreparing()
          hideGlobalLoader()
        } finally {
          setPendingQrProviderId(null)
        }
      })()

      return
    }

    if (provider.groupId === 'solana' && prefersSolanaMobileWalletRoute && provider.detected !== true) {
      try {
        const nextRoute = await buildWalletRoute({
          provider,
          mode: 'webapp',
          flowMode: walletFlowMode,
          environmentId: saleEnvironmentId,
        })

        if (!nextRoute?.link) {
          throw new Error(flowText.interpolate(flowText.presaleFlow.mobileWalletLinkUnavailable, { provider: provider.name }))
        }

        flushSync(() => {
          setPendingQrProviderId(provider.id)
          setWalletNotice(flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name }))
          setIsWalletModalOpen(false)
          setIsWalletQrOpen(false)
        })
        showTransientGlobalLoader(flowText.interpolate(flowText.presaleFlow.openingInAppBrowser, { provider: provider.name }))
        window.location.assign(nextRoute.link)
      } catch (error) {
        const nextMessage = normalizeWalletErrorMessage(error)
        setTxState('failed')
        setTxMessage(nextMessage)
        setWalletNotice(nextMessage)
        setLastResolvedInputKey(inputKey)
        hideGlobalLoader()
      } finally {
        setPendingQrProviderId(null)
      }

      return
    }

    setQrProviderId(provider.id)
    setIsWalletModalOpen(false)
    setWalletNotice(nextNotice)
    setIsWalletQrOpen(true)
    setPendingQrProviderId(provider.id)
    setQrRoute(null)

    if (provider.groupId === 'evm' && provider.connectMode === 'qr') {
      showGlobalLoader(flowText.interpolate(flowText.presaleFlow.preparingWalletConnect, { provider: provider.name }))

      void buildWalletRoute({
        provider,
        mode: 'mobile',
        flowMode: walletFlowMode,
        environmentId: saleEnvironmentId,
        networkId,
      })
        .then((nextRoute) => {
          setQrRoute(nextRoute)
        })
        .catch((error) => {
          const nextMessage = normalizeWalletErrorMessage(error)
          setTxState('failed')
          setTxMessage(nextMessage)
          setWalletNotice(nextMessage)
          setLastResolvedInputKey(inputKey)
        })
        .finally(() => {
          hideGlobalLoader()
          setPendingQrProviderId(null)
        })
      return
    }

    setPendingQrProviderId(null)
  }

  const handleDisconnectWallet = useCallback(async () => {
    try {
      if (typeof wallet?.providerInstance?.disconnect === 'function') {
        await wallet.providerInstance.disconnect()
      }
    } catch {
      // Injected browser wallets usually do not expose a real disconnect API.
    }

    if (wallet?.isMobileSession) {
      clearStoredMobileSession(wallet.providerId)
      clearPendingMobileTransaction()
    }

    setWallet(null)
    setWalletOverview(null)
    setSolanaBuyerSnapshot(null)
    setEvmBuyerSnapshot(null)
    setWalletNotice('')
    setTxMessage('')
    setTxState('idle')
    setIsWalletOverviewOpen(false)
  }, [wallet])

  useEffect(() => {
    if (!wallet?.providerInstance || !isEvmNetworkId(wallet.network) || typeof wallet.providerInstance.on !== 'function') {
      return undefined
    }

    let cancelled = false
    const provider = wallet.providerInstance

    const syncConnectedWallet = async ({ nextAccounts, nextChainId } = {}) => {
      const nextAddress = Array.isArray(nextAccounts)
        ? String(nextAccounts[0] || '').trim()
        : String(wallet.address || '').trim()

      if (!nextAddress) {
        if (!cancelled) {
          await handleDisconnectWallet()
        }
        return
      }

      const resolvedChainId = await resolveEvmProviderChainId(provider, nextChainId ?? wallet.chainId)
      const resolvedNetworkId = getEvmNetworkIdForChainId(resolvedChainId) ?? wallet.network

      if (cancelled) {
        return
      }

      setWallet((current) => {
        if (!current || current.providerInstance !== provider) {
          return current
        }

        return {
          ...current,
          address: nextAddress,
          network: resolvedNetworkId,
          chainId: resolvedChainId,
        }
      })
    }

    const handleAccountsChanged = (accounts) => {
      void syncConnectedWallet({ nextAccounts: accounts })
    }

    const handleChainChanged = (chainId) => {
      void syncConnectedWallet({ nextChainId: chainId })
    }

    provider.on('accountsChanged', handleAccountsChanged)
    provider.on('chainChanged', handleChainChanged)

    return () => {
      cancelled = true

      if (typeof provider.off === 'function') {
        provider.off('accountsChanged', handleAccountsChanged)
        provider.off('chainChanged', handleChainChanged)
        return
      }

      if (typeof provider.removeListener === 'function') {
        provider.removeListener('accountsChanged', handleAccountsChanged)
        provider.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [handleDisconnectWallet, wallet])

  useEffect(() => {
    const handleOpenWalletOverview = () => {
      if (wallet?.address) {
        setIsWalletOverviewOpen(true)
      }
    }

    const handleDisconnectRequest = () => {
      if (wallet?.address) {
        void handleDisconnectWallet()
      }
    }

    window.addEventListener('aioracle:open-wallet-overview', handleOpenWalletOverview)
    window.addEventListener('aioracle:disconnect-wallet', handleDisconnectRequest)

    return () => {
      window.removeEventListener('aioracle:open-wallet-overview', handleOpenWalletOverview)
      window.removeEventListener('aioracle:disconnect-wallet', handleDisconnectRequest)
    }
  }, [handleDisconnectWallet, wallet])

  const refreshWalletOverview = useCallback(async () => {
    if (!isWalletOverviewOpen || !wallet?.address) {
      return
    }

    setIsWalletOverviewLoading(true)

    try {
      if (wallet.network === 'solana') {
        const nextOverview = await fetchSolanaWalletOverview({
          config: solanaConfig,
          rpcUrl: solanaRpcUrl,
          buyerAddress: wallet.address,
        })
        setWalletOverview(nextOverview)
        return
      }

      if ((wallet.network === 'bsc' || wallet.network === 'ethereum') && wallet.providerInstance) {
        const nextOverview = await fetchEvmWalletOverview({
          config: evmConfig,
          walletProvider: wallet.providerInstance,
          buyerAddress: wallet.address,
        })
        setWalletOverview(nextOverview)
        return
      }

      setWalletOverview(null)
    } catch (error) {
      setWalletOverview(null)
      setTxMessage(error.message)
    } finally {
      setIsWalletOverviewLoading(false)
    }
  }, [evmConfig, isWalletOverviewOpen, solanaConfig, solanaRpcUrl, wallet])

  useEffect(() => {
    let cancelled = false

    async function loadWalletOverview() {
      if (!isWalletOverviewOpen || !wallet?.address) {
        return
      }
      await refreshWalletOverview()
      if (cancelled) {
        return
      }
    }

    void loadWalletOverview()

    return () => {
      cancelled = true
    }
  }, [isWalletOverviewOpen, refreshWalletOverview, wallet?.address])

  useEffect(() => {
    const handleOpenWalletModal = (event) => {
      const nextMode = event.detail?.mode === 'login' ? 'login' : 'purchase'

      setIsConfirmOpen(false)

      if (nextMode === 'purchase' && (!amount || Number(amount) <= 0)) {
        setAmount(String(PRESALE_CONFIG.minPurchaseUsd))
      }

      setWalletFlowMode(nextMode)
      setSelectedProviderId((current) => current ?? getDefaultProviderForNetwork(networkId))

      if (nextMode === 'purchase' && wallet?.address) {
        openConnectedWalletPurchaseReview()
        return
      }

      setIsWalletModalOpen(true)
    }

    window.addEventListener('aioracle:open-wallet-modal', handleOpenWalletModal)

    return () => {
      window.removeEventListener('aioracle:open-wallet-modal', handleOpenWalletModal)
    }
  }, [amount, networkId, openConnectedWalletPurchaseReview, wallet?.address])

  const openCardModal = (preferredMethodId = preferredCardMethodId) => {
    const stableAmount = quote.usdEquivalent > 0 ? String(quote.usdEquivalent) : String(PRESALE_CONFIG.minPurchaseUsd)
    const stableNetwork = networkId === 'solana' ? 'solana' : networkId
    const stableToken = getCardTokenForNetwork(stableNetwork)

    setPreferredCardMethodId(preferredMethodId)
    setCardNetworkId(stableNetwork)
    setCardTokenSymbol(stableToken)
    setCardAmount(stableAmount)
    setIsCardModalOpen(true)
  }

  const handleQuickMethodClick = (method) => {
    if (method.type === 'card') {
      openCardModal(method.id)
      return
    }

    handleNetworkChange(method.networkId)
    setTokenSymbol(method.tokenSymbol)
    setAmount(getSuggestedAmountForToken(method.tokenSymbol))
    setSelectedProviderId(method.providerId)

    const provider = getWalletProvider(method.providerId)

    if (provider?.connectMode === 'qr') {
      setQrProviderId(provider.id)
      setIsWalletQrOpen(true)
      return
    }

    setIsWalletModalOpen(true)
  }

  return (
    <>
      <div
        id="presale"
        className="relative rounded-[1.55rem] border border-cyan-400/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),transparent_38%),linear-gradient(180deg,#141d32_0%,#0a1226_42%,#08111f_100%)] p-3 shadow-[0_24px_90px_rgba(0,0,0,0.4)] sm:rounded-[2.4rem] sm:p-5 lg:rounded-[3rem] lg:p-7"
      >
        <div className="grid grid-cols-4 gap-1 sm:gap-3">
          <div className="min-w-0 rounded-[0.95rem] px-1 py-2 text-center sm:rounded-[1.65rem] sm:px-4 sm:py-4">
            <p className="text-[0.43rem] font-black uppercase tracking-[0.08em] text-slate-500 sm:text-[0.58rem] sm:tracking-[0.22em]">{translatePresale('stage')}</p>
            <p className="mt-1 whitespace-nowrap text-[0.72rem] font-black leading-none tracking-tight text-cyan-400 sm:mt-3 sm:text-[1.3rem]">
              {PRESALE_CONFIG.currentStage} / {PRESALE_CONFIG.stages}
            </p>
          </div>
          <div className="min-w-0 rounded-[0.95rem] px-1 py-2 text-center sm:rounded-[1.65rem] sm:px-4 sm:py-4">
            <p className="text-[0.43rem] font-black uppercase tracking-[0.08em] text-slate-500 sm:text-[0.58rem] sm:tracking-[0.22em]">{translatePresale('price')}</p>
            <p className="mt-1 whitespace-nowrap text-[0.72rem] font-black leading-none tracking-tight text-white sm:mt-3 sm:text-[1.3rem]">{formatStagePrice(quote.price, currencyFormatter)}</p>
          </div>
          <div className="min-w-0 rounded-[0.95rem] px-1 py-2 text-center sm:rounded-[1.65rem] sm:px-4 sm:py-4">
            <p className="text-[0.43rem] font-black uppercase tracking-[0.08em] text-slate-500 sm:text-[0.58rem] sm:tracking-[0.22em]">{translatePresale('next')}</p>
            <p className="mt-1 whitespace-nowrap text-[0.72rem] font-black leading-none tracking-tight text-slate-300 sm:mt-3 sm:text-[1.3rem]">{formatStagePrice(quote.nextPrice, currencyFormatter)}</p>
          </div>
          <div className="min-w-0 rounded-[0.95rem] px-1 py-2 text-center sm:rounded-[1.65rem] sm:px-4 sm:py-4">
            <p className="text-[0.43rem] font-black uppercase tracking-[0.08em] text-slate-500 sm:text-[0.58rem] sm:tracking-[0.22em]">{translatePresale('network')}</p>
            <p className="mt-1 whitespace-nowrap text-[0.68rem] font-black leading-none tracking-tight text-cyan-400 sm:mt-3 sm:text-[1.3rem]">{getDisplayNetworkLabel(networkId)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <h3 className="min-w-0 whitespace-nowrap text-[0.9rem] font-black uppercase italic leading-none tracking-tight text-white sm:text-[1.7rem] md:text-[2rem]">
              {translatePresale('active')}
            </h3>
            <span className="shrink-0 whitespace-nowrap font-mono text-[0.9rem] font-black leading-none tracking-[0.03em] text-red-400 sm:text-xl sm:tracking-[0.12em] md:text-[1.85rem]">
              {countdownText}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4 text-[0.63rem] font-black uppercase tracking-[0.16em] sm:text-xs sm:tracking-[0.26em]">
              <span className="text-slate-500">{translatePresale('allocation', { stage: PRESALE_CONFIG.currentStage })}</span>
              <span className="text-cyan-400">{translatePresale('sold', { value: presaleProgressLabel })}</span>
            </div>
            <div className="h-5 overflow-hidden rounded-full border border-white/10 bg-white/5 p-1">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#38bdf8_0%,#4cc3ff_45%,#4f9dfd_100%)] shadow-[0_0_20px_rgba(56,189,248,0.25)]"
                style={{ width: `${normalizedPresaleProgressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:flex-row sm:flex-wrap sm:gap-3 sm:text-[0.72rem] sm:tracking-[0.24em]">
              <span className="min-w-0 whitespace-nowrap">{translatePresale('remaining', { value: numberFormatter.format(normalizedPresaleRemainingAio) })}</span>
              <button
                type="button"
                onClick={onOpenPriceTable}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-cyan-400 transition-colors hover:text-white sm:gap-2"
              >
                {translatePresale('viewSchedule')}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={translatePresale('placeholder', { token: selectedToken?.symbol ?? tokenSymbol })}
              className="w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3.5 pr-24 text-[0.92rem] font-bold text-white outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/40 sm:rounded-[1.9rem] sm:px-6 sm:py-4 sm:pr-28 sm:text-[1.36rem]"
            />
            <button
              type="button"
              onClick={() => setAmount(getMaxAmountForToken(selectedToken?.symbol ?? tokenSymbol))}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[0.9rem] bg-cyan-400/10 px-2.5 py-2 text-[0.7rem] font-black uppercase tracking-[0.12em] text-cyan-300 transition-colors hover:bg-cyan-400 hover:text-slate-950 sm:right-4 sm:rounded-xl sm:px-3 sm:text-sm sm:tracking-[0.2em]"
            >
              {translatePresale('max')}
            </button>
          </div>
          {shouldShowMinimumHint ? (
            <p className="text-right text-[0.82rem] font-semibold italic text-slate-500 sm:text-sm">
              {translatePresale('minimum', { value: PRESALE_CONFIG.minPurchaseUsd })}
            </p>
          ) : null}
          {testTokenHint ? (
            <p className="text-right text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-amber-300 sm:text-xs sm:tracking-[0.18em]">
              {testTokenHint}
            </p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-4">
          <div className="rounded-[1.15rem] px-3 py-2.5 sm:rounded-[2rem] sm:px-5 sm:py-4">
            <p className="whitespace-nowrap text-[0.54rem] font-black uppercase tracking-[0.1em] text-slate-500 sm:text-xs sm:tracking-[0.28em]">{translatePresale('youPay')}</p>
            <p className="mt-1.5 whitespace-nowrap text-[0.82rem] font-bold tracking-tight text-white sm:mt-4 sm:text-[1.36rem]">
              {amountNumber > 0 ? numberFormatter.format(amountNumber) : '0'} {selectedToken?.symbol ?? tokenSymbol}
            </p>
            <p className="mt-1 whitespace-nowrap text-[0.64rem] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-5">{translatePresale('equivalent', { value: formatUsd(quote.usdEquivalent, currencyFormatter) })}</p>
          </div>
          <div className="rounded-[1.15rem] px-3 py-2.5 text-right sm:rounded-[2rem] sm:px-5 sm:py-4">
            <p className="whitespace-nowrap text-[0.54rem] font-black uppercase tracking-[0.1em] text-slate-500 sm:text-xs sm:tracking-[0.28em]">{translatePresale('youReceive')}</p>
            <p className="mt-1.5 whitespace-nowrap text-[0.82rem] font-bold tracking-tight text-cyan-400 sm:mt-4 sm:text-[1.36rem]">
              {numberFormatter.format(quote.estimatedAio)} AIO
            </p>
            <p className="mt-1 whitespace-nowrap text-[0.64rem] leading-4 text-slate-500 sm:mt-2 sm:text-sm sm:leading-5">{translatePresale('atTge', { value: numberFormatter.format(quote.tgeUnlock) })}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-1 sm:gap-4">
          <button
            type="button"
            onClick={openCryptoModal}
            disabled={isBusy}
            className="flex min-h-[3.15rem] w-full items-center justify-center gap-2 rounded-[1.15rem] bg-white px-3 py-3 text-[0.68rem] font-black uppercase tracking-[0.02em] text-slate-950 transition-all hover:scale-[1.01] hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-0 sm:rounded-[2rem] sm:gap-3 sm:px-5 sm:py-5 sm:text-xl sm:tracking-[0.12em]"
          >
            {isBusy ? <LoaderCircle className="h-4 w-4 animate-spin sm:h-6 sm:w-6" /> : <Wallet className="h-4 w-4 sm:h-6 sm:w-6" />}
            <span className="whitespace-nowrap">{wallet ? translatePresale('reviewPurchase') : translatePresale('connectWallet')}</span>
          </button>

          {isSolanaDevnetLive || isEvmTestLive ? (
            <button
              type="button"
              onClick={handleClaimTokens}
              disabled={
                (!wallet?.providerInstance && !wallet?.isMobileSession) ||
                isBusy ||
                (isSolanaDevnetLive ? claimableAmount <= 0 : evmClaimableAmount <= 0)
              }
              className="flex min-h-[3.15rem] w-full items-center justify-center gap-1.5 rounded-[1.15rem] border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-3 text-[0.6rem] font-black uppercase tracking-[0.02em] text-cyan-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-0 sm:rounded-[2rem] sm:gap-3 sm:px-5 sm:py-4 sm:text-base sm:tracking-[0.18em]"
            >
              {isBusy ? <LoaderCircle className="h-3.5 w-3.5 shrink-0 animate-spin sm:h-5 sm:w-5" /> : <RefreshCw className="h-3.5 w-3.5 shrink-0 sm:h-5 sm:w-5" />}
              <span className="min-w-0 truncate">
                {isSolanaDevnetLive
                  ? translatePresale('claimDevnet')
                  : translatePresale('claimEvm', { network: evmClaimNetworkLabel })}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openCardModal()}
              className="flex min-h-[3.15rem] w-full items-center justify-center gap-1.5 rounded-[1.15rem] border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-3 text-[0.62rem] font-black uppercase tracking-[0.02em] text-cyan-300 transition-colors hover:border-cyan-400/40 hover:bg-cyan-400/20 hover:text-white sm:min-h-0 sm:rounded-[2rem] sm:gap-3 sm:px-5 sm:py-4 sm:text-base sm:tracking-[0.18em]"
            >
              <CreditCard className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              <span className="whitespace-nowrap">{translatePresale('buyWithCard')}</span>
            </button>
          )}
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setShowPromoInput((current) => !current)}
            className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-slate-500 underline underline-offset-4 decoration-white/10 transition-colors hover:text-cyan-300 sm:text-xs sm:tracking-[0.28em]"
          >
            {translatePresale('promoToggle')}
          </button>
          {showPromoInput ? (
            <div className="mt-4">
              <input
                type="text"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                placeholder={translatePresale('promoPlaceholder')}
                className="w-full rounded-[1rem] border border-white/10 bg-black/25 px-4 py-3 text-center text-[0.9rem] font-bold uppercase tracking-[0.14em] text-cyan-300 outline-none placeholder:text-slate-500 focus:border-cyan-400/40 sm:rounded-[1.2rem] sm:text-sm sm:tracking-[0.22em]"
              />
              {promoCode ? (
                <p
                  className={`mt-3 text-center text-xs font-semibold ${
                    quote.promoCodeStatus === 'applied'
                      ? 'text-emerald-300'
                      : quote.hasPromoCodeIssue
                        ? 'text-amber-300'
                        : 'text-slate-400'
                  }`}
                >
                  {promoFeedbackMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-[1.35rem] px-3 py-2.5 text-center text-[0.56rem] font-semibold uppercase leading-4 tracking-[0.03em] text-red-300 sm:rounded-[1.75rem] sm:px-4 sm:py-3 sm:text-[0.68rem] sm:leading-5 sm:tracking-[0.06em]">
          <ShieldAlert className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px sm:mr-2 sm:h-4 sm:w-4" />
          {translatePresale('safety')}
          <span className="ml-2 border-b border-white/20 text-white">{translatePresale('riskDisclosure')}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-4">
          <div className="rounded-[1.15rem] border border-white/10 bg-white/5 px-3 py-3 sm:rounded-[2rem] sm:px-5 sm:py-3.5">
            <p className="whitespace-nowrap text-[0.58rem] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-[0.72rem] sm:tracking-[0.22em]">{translatePresale('unlock')}</p>
            <p className="mt-2 whitespace-nowrap text-[0.92rem] font-extrabold italic tracking-tight text-white sm:mt-3 sm:text-[1.35rem]">
              {PRESALE_CONFIG.unlock.tgePercent}% at TGE
            </p>
            <p className="mt-1 whitespace-nowrap text-[0.72rem] italic text-slate-400 sm:mt-1.5 sm:text-[0.92rem]">{translatePresale('linearMonths', { value: PRESALE_CONFIG.unlock.linearMonths })}</p>
          </div>
          <div className="rounded-[1.15rem] border border-white/10 bg-white/5 px-3 py-3 sm:rounded-[2rem] sm:px-5 sm:py-3.5">
            <p className="whitespace-nowrap text-[0.58rem] font-black uppercase tracking-[0.12em] text-slate-500 sm:text-[0.72rem] sm:tracking-[0.22em]">{translatePresale('globalStatus')}</p>
            <div className="mt-2 space-y-1 text-[0.66rem] font-semibold uppercase tracking-[0.03em] sm:mt-3 sm:space-y-2 sm:text-[0.82rem] sm:tracking-[0.12em]">
              {/*
                Temporarily replace the dynamic wallet / tx / on-chain status block
                with the simplified marketing status copy shown in the design reference.
                Keep the original status rows here for quick restoration later.
              */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{translatePresale('audit')}</span>
                <span className="text-cyan-300">{translatePresale('running')}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{translatePresale('multisig')}</span>
                <span className="text-emerald-400">{translatePresale('enabled')}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">{translatePresale('mvpDemo')}</span>
                <span className="text-slate-500">{translatePresale('pending')}</span>
              </div>
            </div>
          </div>
        </div>

        {txMessage ? (
          <div className={`mt-5 overflow-hidden break-all rounded-[1.25rem] border p-4 text-[0.9rem] leading-6 sm:rounded-[1.55rem] sm:text-sm ${
            displayTxState === 'failed'
              ? 'border-red-400/20 bg-red-500/10 text-red-200'
              : 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
          }`}>
            {txMessage}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:mt-5 sm:gap-2">
          {QUICK_ACCESS_METHODS.map((method) => (
            <QuickAccessButton key={method.id} method={method} onClick={handleQuickMethodClick} />
          ))}
        </div>

        {visibleHistory.length ? (
          <div className="mt-5 space-y-3 rounded-[1.45rem] border border-white/10 bg-black/20 p-4 sm:rounded-[1.8rem]">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.22em]">{translatePresale('recentActivity')}</p>
            {visibleHistory.map((purchase) => (
              <div key={purchase.id} className="flex flex-col items-start gap-2.5 border-b border-white/5 pb-3 text-sm last:border-b-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{purchase.networkLabel}</p>
                  <p className="break-all text-[0.9rem] leading-6 text-slate-400 sm:text-sm">
                    {numberFormatter.format(purchase.aio)} AIO via {purchase.token}
                  </p>
                </div>
                {purchase.explorerUrl ? (
                  <a
                    href={purchase.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 text-cyan-300 transition-colors hover:text-white"
                  >
                    {translatePresale('viewTx')}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="font-mono text-xs text-slate-400">{shortAddress(purchase.txHash, 6, 6)}</span>
                )}
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col items-start gap-2 text-[0.78rem] leading-5 text-slate-500 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:text-xs">
          <span className="block">
            {translatePresale('route')}: {selectedNetwork.label} | {translatePresale('token')}: {selectedToken?.symbol ?? tokenSymbol}
          </span>
          <span className="block">
            {translatePresale('raised', {
              raised: formatUsd(raisedUsd, currencyFormatter),
              target: formatUsd(raiseTargetUsd, currencyFormatter),
            })}
          </span>
        </div>
      </div>

      <WalletConnectModal
        open={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        mode={walletFlowMode}
        providerGroups={providerGroupsWithDetection}
        visibleProviderGroupId={walletFlowMode === 'purchase' && wallet?.address ? connectedProviderGroupId : null}
        selectedProvider={selectedProvider}
        selectedProviderId={selectedProviderId}
        onProviderSelect={handleProviderSelect}
        networkId={networkId}
        tokenSymbol={selectedPaymentTokenSymbol}
        amount={amount}
        promoCode={promoCode}
        quote={quote}
        isBusy={isBusy}
        onNetworkChange={handleNetworkChange}
        onTokenChange={handleTokenChange}
        onAmountChange={setAmount}
        onPromoCodeChange={setPromoCode}
        onContinue={handleWalletContinue}
        walletNotice={walletNotice}
        selectedProviderMissing={selectedProviderMissing}
        onOpenMissingWalletRoute={handleOpenMissingWalletRoute}
        onInstallSelectedWallet={handleInstallSelectedWallet}
        pendingProviderId={pendingQrProviderId}
        prefersSolanaMobileWalletRoute={prefersSolanaMobileWalletRoute}
        preparingProvider={walletHandoffPreparing}
      />

      <WalletProviderQrModal
        key={`${isWalletQrOpen ? 'open' : 'closed'}:${qrProviderId ?? 'none'}:${walletFlowMode}`}
        open={isWalletQrOpen}
        onClose={() => {
          qrConnectInFlightRef.current = false
          setIsDesktopQrAwaitingWallet(false)
          clearEvmWalletConnectRoute()
          setPendingQrProviderId(null)
          setQrRoute(null)
          setIsWalletQrOpen(false)
        }}
        provider={qrProvider}
        prefetchedRoute={qrRoute}
        waitForPrefetchedRoute={pendingQrProviderId === qrProviderId && !qrRoute}
        awaitingWalletConfirmation={isDesktopQrAwaitingWallet}
        onContinue={handleQrContinue}
        saleEnvironmentId={saleEnvironmentId}
        networkId={networkId}
        flowMode={walletFlowMode}
      />

      <CardCheckoutModal
        open={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        amount={cardAmount}
        quote={cardQuote}
        networkId={cardNetworkId}
        tokenSymbol={cardTokenSymbol}
        promoCode={promoCode}
        preferredMethodId={preferredCardMethodId}
        methods={CARD_METHODS}
        beneficiaryAddress={cardNetworkId === 'solana' && wallet?.network === 'solana' ? wallet.address : ''}
        directReferrerAddress={referralSummary?.binding?.directReferrerWalletAddress ?? ''}
        indirectReferrerAddress={referralSummary?.binding?.indirectReferrerWalletAddress ?? ''}
        walletAddress={wallet?.address ?? ''}
        onActivityRecorded={async () => {
          await loadWalletActivity(wallet?.address)
          await loadReferralSummary(wallet?.address)
        }}
        onAmountChange={setCardAmount}
        onMethodSelect={setPreferredCardMethodId}
      />

      <ConfirmPurchaseModal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        quote={quote}
        saleEnvironmentLabel={saleEnvironment.label}
        saleEnvironmentBadge={saleEnvironment.badge}
        paymentAmount={amount}
        paymentToken={selectedPaymentTokenSymbol}
        walletAddress={wallet?.address ?? flowText.presaleFlow.notConnected}
        approvalAmount={isEvmTestLive ? amount : ''}
        approvalToken={isEvmTestLive ? selectedPaymentTokenSymbol : ''}
        approvalSpender={isEvmTestLive ? evmConfig?.presale ?? '' : ''}
        promoCode={promoCode}
        txState={displayTxState}
        statusMessage={txMessage}
        onConfirm={handleConfirmPurchase}
        confirmHint={
          !isSolanaDevnetLive && !isEvmTestLive
            ? flowText.presaleFlow.confirmHintRouteNotLive
            : isMobileWalletSession
              ? flowText.presaleFlow.confirmHintMobile
              : ''
        }
        confirmDisabled={!isSolanaDevnetLive && !isEvmTestLive}
      />

      <PurchaseFollowupModal
        open={isPurchaseFollowupOpen}
        onClose={() => {
          void syncPendingEvmPurchase({ closeAfterCheck: true })
        }}
        onConfirm={() => {
          void syncPendingEvmPurchase()
        }}
        checking={isPurchaseFollowupChecking}
        statusMessage={purchaseFollowupMessage || txMessage}
      />

      <WalletOverviewModal
        open={isWalletOverviewOpen}
        onClose={() => {
          setIsWalletOverviewOpen(false)
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('aioracle:close-mobile-menu'))
          }
        }}
        wallet={wallet}
        balances={walletOverview}
        purchasedAmount={
          wallet?.network === 'solana'
            ? solanaBuyerSnapshot?.buyerPosition?.purchasedTokens
              ? Number(solanaBuyerSnapshot.buyerPosition.purchasedTokens) / 10 ** 6
              : 0
            : evmBuyerSnapshot?.buyerPosition?.purchasedTokens
              ? Number(evmBuyerSnapshot.buyerPosition.purchasedTokens) / 10 ** Number(evmBuyerSnapshot.saleDecimals ?? 18)
              : 0
        }
        claimableAmount={wallet?.network === 'solana' ? claimableAmount : evmClaimableAmount}
        isLoading={isWalletOverviewLoading}
        onDisconnect={handleDisconnectWallet}
        walletSummaryLabel={walletSummaryLabel}
        warningMessage={walletOverviewWarning}
        history={history}
        promoCode={promoCode}
        referralSummary={referralSummary}
        showClaimAction={isSolanaDevnetLive || isEvmTestLive}
        onClaim={() => {
          claimOriginRef.current = 'overview'
          void handleClaimTokens()
        }}
        claimLabel={
          isSolanaDevnetLive
            ? translatePresale('claimDevnet')
            : translatePresale('claimEvm', { network: evmClaimNetworkLabel })
        }
        claimDisabled={
          (!wallet?.providerInstance && !wallet?.isMobileSession) ||
          isBusy ||
          (isSolanaDevnetLive ? claimableAmount <= 0 : evmClaimableAmount <= 0)
        }
        isClaimBusy={isBusy}
      />
    </>
  )
}
