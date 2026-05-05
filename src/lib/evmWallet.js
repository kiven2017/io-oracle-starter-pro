import { attachStoredReferralCandidateToUrl } from './referrals'

const EVM_OPTIONAL_CHAINS = [1, 56, 97, 11155111, 31337]
const DEFAULT_WALLETCONNECT_PROJECT_ID = 'fd67bb14968102f0fe95dd954f984454'

let walletConnectProviderPromise = null
let walletConnectConnectPromise = null
let walletConnectDisplayUriPromise = null
let walletConnectDisplayUri = ''
let walletConnectDisplayUriCreatedAt = 0
let metaMaskConnectClientPromise = null
const eip6963Providers = new Map()
let eip6963Initialized = false
const WALLETCONNECT_URI_MAX_AGE_MS = 12_000
const WALLETCONNECT_SESSION_SYNC_TIMEOUT_MS = 12_000
const WALLETCONNECT_SESSION_SYNC_POLL_MS = 400
const EVM_MOBILE_DEEPLINKS = {
  metamask: {
    walletConnect: {
      native: 'metamask://wc?uri=',
      universal: 'https://metamask.app.link/wc?uri=',
    },
    browse: {
      native: 'metamask://dapp/',
      universal: 'https://metamask.app.link/dapp/',
    },
  },
  trustwallet: {
    walletConnect: {
      native: 'trust://wc?uri=',
      universal: 'https://link.trustwallet.com/wc?uri=',
    },
    browse: {
      native: 'trust://open_url?coin_id=60&url=',
      universal: 'https://link.trustwallet.com/open_url?coin_id=60&url=',
    },
  },
  coinbase: {
    browse: {
      universal: 'https://go.cb-w.com/dapp?cb_url=',
    },
  },
  safepal: {
    walletConnect: {
      native: 'safepalwallet://wc?uri=',
      universal: 'https://link.safepal.io/wc?uri=',
    },
  },
}

const TRUST_WALLET_COIN_IDS = {
  ethereum: '60',
  bsc: '20000714',
}

function isWalletConnectMissingTopicError(error) {
  const message = String(error?.message || error || '').toLowerCase()
  return message.includes('no matching key') && message.includes('session topic')
}

function isWalletConnectMissingProviderError(error) {
  const message = String(error?.message || error || '').toLowerCase()
  return (
    (message.includes('undefined is not an object') && message.includes('getprovider') && message.includes('request')) ||
    (message.includes("cannot read properties of undefined") && message.includes('request')) ||
    (message.includes('cannot read property') && message.includes('request'))
  )
}

function normalizeWalletConnectError(error) {
  if (isWalletConnectMissingTopicError(error) || isWalletConnectMissingProviderError(error)) {
    return new Error('WalletConnect session expired while returning from your wallet. Please reconnect and try again.')
  }

  return error instanceof Error ? error : new Error(String(error || 'WalletConnect connection failed.'))
}

function normalizeWalletConnectSessionAddress(value) {
  const normalizedValue = String(value || '').trim()
  if (!normalizedValue) {
    return ''
  }

  const segments = normalizedValue.split(':')
  return segments[segments.length - 1] || normalizedValue
}

function getWalletConnectSessionAddress(provider) {
  const directAddress = normalizeWalletConnectSessionAddress(provider?.accounts?.[0])
  if (directAddress) {
    return directAddress
  }

  const namespaceAccounts = provider?.session?.namespaces?.eip155?.accounts
  if (Array.isArray(namespaceAccounts)) {
    const sessionAddress = normalizeWalletConnectSessionAddress(namespaceAccounts[0])
    if (sessionAddress) {
      return sessionAddress
    }
  }

  return ''
}

function getWalletConnectSessionChainId(provider) {
  const normalizedChainId = Number(provider?.chainId)
  if (Number.isFinite(normalizedChainId) && normalizedChainId > 0) {
    return normalizedChainId
  }

  const namespaceAccounts = provider?.session?.namespaces?.eip155?.accounts
  if (!Array.isArray(namespaceAccounts) || !namespaceAccounts[0]) {
    return null
  }

  const chainIdSegment = String(namespaceAccounts[0]).split(':')[1]
  const parsedChainId = Number(chainIdSegment)
  return Number.isFinite(parsedChainId) && parsedChainId > 0 ? parsedChainId : null
}

async function waitForWalletConnectSession(provider, timeoutMs = WALLETCONNECT_SESSION_SYNC_TIMEOUT_MS) {
  const startedAt = Date.now()

  while (Date.now() - startedAt <= timeoutMs) {
    const nextAddress = getWalletConnectSessionAddress(provider)
    const nextChainId = getWalletConnectSessionChainId(provider)

    if (nextAddress) {
      return {
        address: nextAddress,
        chainId: nextChainId,
      }
    }

    if (typeof provider?.request === 'function') {
      try {
        const accounts = await provider.request({ method: 'eth_accounts' })
        if (Array.isArray(accounts) && accounts[0]) {
          return {
            address: normalizeWalletConnectSessionAddress(accounts[0]),
            chainId: getWalletConnectSessionChainId(provider),
          }
        }
      } catch {
        // Ignore transient account sync failures while the wallet session hydrates.
      }
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, WALLETCONNECT_SESSION_SYNC_POLL_MS)
    })
  }

  throw new Error('WalletConnect pairing finished, but the wallet account is still syncing. Please wait a moment and try again.')
}

function getCurrentLocation() {
  if (typeof window === 'undefined') {
    return {
      href: 'http://localhost:4174/',
    }
  }

  return window.location
}

function isMobileClient() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || navigator.vendor || '')
}

function getPreferredWalletLink(linkSet, { preferUniversalOnMobile = false } = {}) {
  if (!linkSet) {
    return ''
  }

  if (isMobileClient()) {
    if (preferUniversalOnMobile) {
      return linkSet.universal || linkSet.native || ''
    }

    return linkSet.native || linkSet.universal || ''
  }

  return linkSet.universal || linkSet.native || ''
}

function getTokenPocketChainLabel(networkId) {
  if (networkId === 'bsc') {
    return 'BSC'
  }

  return 'ETH'
}

function getTokenPocketDappRoute(targetUrl, networkId) {
  const params = {
    url: targetUrl,
    chain: getTokenPocketChainLabel(networkId),
    source: 'AIOracle Presale',
  }

  return `tpdapp://open?params=${encodeURIComponent(JSON.stringify(params))}`
}

export function supportsEvmInAppBrowserRoute(providerId) {
  return providerId === 'bitget' || providerId === 'tokenpocket' || Boolean(EVM_MOBILE_DEEPLINKS[providerId]?.browse)
}

function getMetaMaskDappMetadata() {
  const location = getCurrentLocation()
  const origin = location.origin || 'http://localhost:4174'

  return {
    name: 'AIOracle Presale',
    url: origin,
    iconUrl: `${origin}/logo.png?v=brand-logo`,
  }
}

function getMetaMaskSupportedNetworks() {
  return {
    '0x1': 'https://ethereum-rpc.publicnode.com',
    '0x38': 'https://bsc-rpc.publicnode.com',
    '0x61': 'https://bsc-testnet-rpc.publicnode.com',
    '0xaa36a7': 'https://ethereum-sepolia-rpc.publicnode.com',
    '0x7a69': 'http://127.0.0.1:8546',
  }
}

function getMetaMaskPreferredChainIds() {
  return ['0xaa36a7', '0x61', '0x7a69']
}

async function getMetaMaskConnectClient() {
  if (!metaMaskConnectClientPromise) {
    metaMaskConnectClientPromise = import('@metamask/connect-evm').then(async ({ createEVMClient }) => {
      return createEVMClient({
        dapp: getMetaMaskDappMetadata(),
        api: {
          supportedNetworks: getMetaMaskSupportedNetworks(),
        },
        ui: {
          headless: true,
          preferExtension: false,
          showInstallModal: false,
        },
        mobile: {
          useDeeplink: true,
          preferredOpenLink: (deeplink) => {
            if (typeof window !== 'undefined' && deeplink) {
              window.location.assign(deeplink)
            }
          },
        },
      })
    })
  }

  return metaMaskConnectClientPromise
}

function buildEvmWalletEntryUrl({ providerId, environmentId, networkId }) {
  const location = getCurrentLocation()
  const baseHref = location.origin ? `${location.origin}/` : location.href
  const targetUrl = new URL(baseHref)
  attachStoredReferralCandidateToUrl(targetUrl)
  targetUrl.searchParams.set('sale_env', environmentId)
  targetUrl.searchParams.set('wallet_entry', providerId)

  if (networkId) {
    targetUrl.searchParams.set('wallet_network', networkId)
  }

  return targetUrl.toString()
}

function initializeEip6963ProviderRegistry() {
  if (typeof window === 'undefined' || eip6963Initialized) {
    return
  }

  const handleAnnounceProvider = (event) => {
    const info = event?.detail?.info
    const provider = event?.detail?.provider

    if (!info?.uuid || !provider) {
      return
    }

    eip6963Providers.set(info.uuid, {
      info,
      provider,
    })
  }

  window.addEventListener('eip6963:announceProvider', handleAnnounceProvider)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
  eip6963Initialized = true
}

function getEip6963ProviderByRdns(rdns) {
  initializeEip6963ProviderRegistry()

  for (const entry of eip6963Providers.values()) {
    if (entry.info?.rdns === rdns) {
      return entry.provider
    }
  }

  return null
}

export function wrapEvmWalletConnectUriForProvider(providerId, uri) {
  if (!uri) {
    return ''
  }

  const encodedUri = encodeURIComponent(uri)
  const baseLink = getPreferredWalletLink(EVM_MOBILE_DEEPLINKS[providerId]?.walletConnect)

  return baseLink ? `${baseLink}${encodedUri}` : uri
}

export function buildEvmInAppBrowserRoute({
  providerId,
  providerName,
  environmentId,
  networkId,
}) {
  const targetUrl = buildEvmWalletEntryUrl({
    providerId,
    environmentId,
    networkId,
  })

  const browseLink = getPreferredWalletLink(EVM_MOBILE_DEEPLINKS[providerId]?.browse)

  if (providerId === 'coinbase' && browseLink) {
    return {
      link: `${browseLink}${encodeURIComponent(targetUrl)}`,
      label: `${providerName} In-App Browser`,
      source: 'browse',
    }
  }

  if (providerId === 'bitget') {
    return {
      link: `https://bkcode.vip?action=dapp&url=${encodeURIComponent(targetUrl)}`,
      label: `${providerName} In-App Browser`,
      source: 'browse',
    }
  }

  if (providerId === 'tokenpocket') {
    return {
      link: getTokenPocketDappRoute(targetUrl, networkId),
      label: `${providerName} In-App Browser`,
      source: 'browse',
    }
  }

  if (providerId === 'metamask' && browseLink) {
    const deeplinkTarget = targetUrl.replace(/^https?:\/\//, '')

    return {
      link: `${browseLink}${deeplinkTarget}`,
      label: `${providerName} In-App Browser`,
      source: 'browse',
    }
  }

  if (providerId === 'trustwallet' && browseLink) {
    const coinId = TRUST_WALLET_COIN_IDS[networkId] ?? TRUST_WALLET_COIN_IDS.ethereum

    return {
      link: `${browseLink.replace('coin_id=60', `coin_id=${coinId}`)}${encodeURIComponent(targetUrl)}`,
      label: `${providerName} In-App Browser`,
      source: 'browse',
    }
  }

  return {
    link: '',
    label: '',
    source: 'none',
  }
}

function getWalletConnectProjectId() {
  return (
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ||
    import.meta.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    DEFAULT_WALLETCONNECT_PROJECT_ID
  )
}

export function hasWalletConnectProjectId() {
  return Boolean(getWalletConnectProjectId())
}

function getWalletConnectMetadata() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4174'

  return {
    name: 'AIOracle Presale',
    description: 'AIOracle presale wallet connection',
    url: origin,
    icons: [`${origin}/logo.png?v=brand-logo`],
  }
}

async function getWalletConnectProvider() {
  if (!walletConnectProviderPromise) {
    walletConnectProviderPromise = import('@walletconnect/ethereum-provider').then(async ({ EthereumProvider }) => {
      const projectId = getWalletConnectProjectId()
      if (!projectId) {
        throw new Error('Missing WalletConnect Project ID. Add VITE_WALLETCONNECT_PROJECT_ID to enable real EVM QR sessions.')
      }

      return EthereumProvider.init({
        projectId,
        optionalChains: EVM_OPTIONAL_CHAINS,
        showQrModal: false,
        methods: [
          'eth_sendTransaction',
          'eth_signTransaction',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
          'eth_signTypedData_v4',
        ],
        events: ['chainChanged', 'accountsChanged'],
        metadata: getWalletConnectMetadata(),
      })
    })
  }

  return walletConnectProviderPromise
}

async function resetWalletConnectSession(provider) {
  if (!provider?.session) {
    return
  }

  try {
    await provider.disconnect()
  } catch {
    // Ignore disconnect cleanup issues and continue with a fresh pairing attempt.
  }
}

async function getWalletConnectDisplayUri(providerName = 'Wallet', { forceFresh = false } = {}) {
  const hasFreshCachedUri =
    walletConnectDisplayUri &&
    !forceFresh &&
    Date.now() - walletConnectDisplayUriCreatedAt < WALLETCONNECT_URI_MAX_AGE_MS

  if (hasFreshCachedUri) {
    return walletConnectDisplayUri
  }

  if (!forceFresh && walletConnectDisplayUriPromise) {
    return walletConnectDisplayUriPromise
  }

  const provider = await getWalletConnectProvider()
  walletConnectDisplayUriPromise = (async () => {
    walletConnectConnectPromise = null
    walletConnectDisplayUri = ''
    walletConnectDisplayUriCreatedAt = 0
    await resetWalletConnectSession(provider)

    const uri = await new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        cleanup()
        reject(new Error(`Timed out while creating a WalletConnect session for ${providerName}.`))
      }, 20000)

      const handleUri = (nextUri) => {
        cleanup()
        resolve(nextUri)
      }

      const cleanup = () => {
        window.clearTimeout(timeoutId)
        if (typeof provider.off === 'function') {
          provider.off('display_uri', handleUri)
        }
      }

      provider.on('display_uri', handleUri)
      walletConnectConnectPromise = provider.connect({
        optionalChains: EVM_OPTIONAL_CHAINS,
      }).catch((error) => {
        cleanup()
        throw normalizeWalletConnectError(error)
      })
    })

    walletConnectDisplayUri = uri
    walletConnectDisplayUriCreatedAt = Date.now()
    return uri
  })().catch((error) => {
    walletConnectConnectPromise = null
    walletConnectDisplayUriPromise = null
    walletConnectDisplayUri = ''
    walletConnectDisplayUriCreatedAt = 0
    throw normalizeWalletConnectError(error)
  })

  return walletConnectDisplayUriPromise
}

export function getCachedEvmWalletConnectRoute({ providerId, providerName }) {
  if (!walletConnectDisplayUri) {
    return null
  }

  return {
    label: `${providerName} WalletConnect`,
    link: wrapEvmWalletConnectUriForProvider(providerId, walletConnectDisplayUri),
    qrLink: walletConnectDisplayUri,
    source: 'walletconnect',
  }
}

export function prefetchEvmWalletConnectRoute(providerName = 'Wallet') {
  return getWalletConnectDisplayUri(providerName)
}

export async function buildEvmWalletConnectRoute({ providerId, providerName, forceFresh = false }) {
  const uri = await getWalletConnectDisplayUri(providerName, { forceFresh })

  return {
    label: `${providerName} WalletConnect`,
    link: wrapEvmWalletConnectUriForProvider(providerId, uri),
    qrLink: uri,
    source: 'walletconnect',
  }
}

export async function completeEvmWalletConnectSession() {
  const provider = await getWalletConnectProvider()
  const activeAddress = getWalletConnectSessionAddress(provider)

  if (!walletConnectConnectPromise && provider.session?.topic && activeAddress) {
    return {
      walletProvider: provider,
      address: activeAddress,
      chainId: getWalletConnectSessionChainId(provider),
    }
  }

  if (!walletConnectConnectPromise && provider.session?.topic) {
    const resumedSession = await waitForWalletConnectSession(provider)
    return {
      walletProvider: provider,
      address: resumedSession.address,
      chainId: resumedSession.chainId,
    }
  }

  if (!walletConnectConnectPromise) {
    throw new Error('No WalletConnect pairing is active. Open the QR route first and approve it in your wallet.')
  }

  try {
    await walletConnectConnectPromise
  } catch (error) {
    walletConnectConnectPromise = null
    walletConnectDisplayUriPromise = null
    walletConnectDisplayUri = ''
    walletConnectDisplayUriCreatedAt = 0
    throw normalizeWalletConnectError(error)
  }

  walletConnectConnectPromise = null
  walletConnectDisplayUriPromise = null
  walletConnectDisplayUri = ''
  walletConnectDisplayUriCreatedAt = 0

  const session = await waitForWalletConnectSession(provider)

  return {
    walletProvider: provider,
    address: session.address,
    chainId: session.chainId,
  }
}

export async function getActiveEvmWalletConnectSession() {
  const provider = await getWalletConnectProvider()

  if (!provider?.session?.topic) {
    return null
  }

  const activeAddress = getWalletConnectSessionAddress(provider)
  if (activeAddress) {
    return {
      walletProvider: provider,
      address: activeAddress,
      chainId: getWalletConnectSessionChainId(provider),
    }
  }

  if (typeof provider.request !== 'function') {
    return null
  }

  try {
    const accounts = await provider.request({ method: 'eth_accounts' })
    const address = normalizeWalletConnectSessionAddress(accounts?.[0])

    if (!address) {
      return null
    }

    return {
      walletProvider: provider,
      address,
      chainId: getWalletConnectSessionChainId(provider),
    }
  } catch {
    return null
  }
}

export function clearEvmWalletConnectRoute() {
  walletConnectConnectPromise = null
  walletConnectDisplayUriPromise = null
  walletConnectDisplayUri = ''
  walletConnectDisplayUriCreatedAt = 0
}

export function getInjectedEvmProvider(providerId) {
  if (typeof window === 'undefined') {
    return null
  }

  if (providerId === 'coinbase') {
    const coinbaseProvider =
      getEip6963ProviderByRdns('com.coinbase.wallet') ??
      window.coinbaseWalletExtension ??
      null

    if (coinbaseProvider) {
      return coinbaseProvider
    }
  }

  if (providerId === 'tokenpocket') {
    const tokenPocketProvider = window.tokenpocket?.ethereum ?? null
    if (tokenPocketProvider) {
      return tokenPocketProvider
    }
  }

  if (providerId === 'bitget') {
    const bitgetProvider = window.bitkeep?.ethereum ?? null
    if (bitgetProvider) {
      return bitgetProvider
    }
  }

  if (providerId === 'trustwallet') {
    const trustProvider =
      getEip6963ProviderByRdns('com.trustwallet.app') ??
      window.trustwallet?.ethereum ??
      null

    if (trustProvider) {
      return trustProvider
    }
  }

  if (providerId === 'safepal') {
    const safePalProvider = window.safepalProvider ?? null
    if (safePalProvider) {
      return safePalProvider
    }
  }

  if (providerId === 'binance' && window.BinanceChain) {
    return window.BinanceChain
  }

  const allProviders = Array.isArray(window.ethereum?.providers)
    ? window.ethereum.providers
    : window.ethereum
      ? [window.ethereum]
      : []

  const matchers = {
    metamask: (provider) => provider?.isMetaMask,
    binance: (provider) => provider?.isBinance || provider?.isBinanceChain,
    trustwallet: (provider) => provider?.isTrust || provider?.isTrustWallet,
    safepal: (provider) => provider?.isSafePal,
    coinbase: (provider) => provider?.isCoinbaseWallet,
    tokenpocket: (provider) => provider?.isTokenPocket,
    bitget: (provider) => provider?.isBitKeep,
  }

  const matcher = matchers[providerId]
  if (matcher) {
    return allProviders.find((provider) => matcher(provider)) ?? null
  }

  if (!providerId && allProviders.length > 0) {
    return allProviders[0]
  }

  return null
}

export async function connectInjectedEvmWallet(providerId) {
  if (providerId === 'metamask' && isMobileClient()) {
    const injectedProvider = getInjectedEvmProvider(providerId)

    if (injectedProvider) {
      const accounts = await injectedProvider.request({
        method: 'eth_requestAccounts',
      })

      const address = accounts?.[0]
      if (!address) {
        throw new Error('The wallet connected but did not return an account address.')
      }

      const chainId = await injectedProvider.request({
        method: 'eth_chainId',
      })

      return {
        walletProvider: injectedProvider,
        address,
        chainId,
      }
    }

    const client = await getMetaMaskConnectClient()
    const { accounts, chainId } = await client.connect({
      chainIds: getMetaMaskPreferredChainIds(),
    })
    const provider = client.getProvider()
    const address = accounts?.[0]

    if (!provider || !address) {
      throw new Error('The wallet connected, but no account address was returned.')
    }

    return {
      walletProvider: provider,
      address,
      chainId,
    }
  }

  const provider = getInjectedEvmProvider(providerId)

  if (!provider) {
    throw new Error('Selected EVM wallet extension was not detected in this browser.')
  }

  const accounts = await provider.request({
    method: 'eth_requestAccounts',
  })

  const address = accounts?.[0]
  if (!address) {
    throw new Error('The wallet connected but did not return an account address.')
  }

  const chainId = await provider.request({
    method: 'eth_chainId',
  })

  return {
    walletProvider: provider,
    address,
    chainId,
  }
}
