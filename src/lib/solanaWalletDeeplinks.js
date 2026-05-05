import bs58 from 'bs58'
import nacl from 'tweetnacl'
import QRCode from 'qrcode'
import { buildEvmInAppBrowserRoute, buildEvmWalletConnectRoute, supportsEvmInAppBrowserRoute } from './evmWallet'
import { attachStoredReferralCandidateToUrl } from './referrals'

const MOBILE_SESSION_KEY_PREFIX = 'aioracle-solana-mobile-session-'
const MOBILE_PENDING_TX_KEY = 'aioracle-solana-mobile-pending-tx'

function getCurrentLocation() {
  if (typeof window === 'undefined') {
    return {
      origin: 'http://localhost:4174',
      href: 'http://localhost:4174/',
      pathname: '/',
    }
  }

  return window.location
}

function isMobileBrowserClient() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || navigator.vendor || '')
}

function isAndroidBrowserClient() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /Android/i.test(navigator.userAgent || navigator.vendor || '')
}

function shouldUseEvmWalletConnectHandoff(provider, mode) {
  if (provider?.groupId !== 'evm') {
    return false
  }

  if (provider?.id === 'metamask' && provider?.connectMode === 'direct') {
    return false
  }

  if (mode !== 'mobile' || !isMobileBrowserClient()) {
    return false
  }

  return !supportsEvmInAppBrowserRoute(provider?.id)
}

function applyAndroidDeepLinkFallback(providerId, url) {
  if (!url || providerId !== 'phantom' || !isAndroidBrowserClient()) {
    return url
  }

  return url.replace(/^https:\/\/phantom\.app\/ul\//, 'phantom://')
}

function getClusterFromEnvironment(environmentId) {
  return environmentId === 'devnet' ? 'devnet' : 'mainnet-beta'
}

function getSessionStorageKey(providerId) {
  return `aioracle-solana-deeplink-${providerId}`
}

function getMobileSessionStorageKey(providerId) {
  return `${MOBILE_SESSION_KEY_PREFIX}${providerId}`
}

function getProviderEncryptionParam(providerId) {
  return providerId === 'solflare' ? 'solflare_encryption_public_key' : 'phantom_encryption_public_key'
}

function getProviderTransactionBaseUrl(providerId) {
  return providerId === 'solflare'
    ? 'https://solflare.com/ul/v1/signAndSendTransaction'
    : 'https://phantom.app/ul/v1/signTransaction'
}

function getOrCreateEncryptionKeypair(providerId) {
  const key = getSessionStorageKey(providerId)
  const stored = typeof window !== 'undefined' ? window.sessionStorage.getItem(key) : null

  if (stored) {
    const parsed = JSON.parse(stored)
    return {
      publicKey: Uint8Array.from(parsed.publicKey),
      secretKey: Uint8Array.from(parsed.secretKey),
    }
  }

  const keypair = nacl.box.keyPair()
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        publicKey: Array.from(keypair.publicKey),
        secretKey: Array.from(keypair.secretKey),
      }),
    )
  }

  return keypair
}

function decodeEncryptedPayload({ providerId, nonce, data, walletEncryptionPublicKey }) {
  const keypair = getOrCreateEncryptionKeypair(providerId)
  const sharedSecret = nacl.box.before(bs58.decode(walletEncryptionPublicKey), keypair.secretKey)
  const decryptedBytes = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret)

  if (!decryptedBytes) {
    throw new Error(`Unable to decrypt ${providerId} mobile wallet payload.`)
  }

  const decoded = JSON.parse(new TextDecoder().decode(decryptedBytes))

  return {
    decoded,
    sharedSecret: bs58.encode(sharedSecret),
  }
}

function decodePayloadWithSharedSecret({ sharedSecret, nonce, data }) {
  const decryptedBytes = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), bs58.decode(sharedSecret))

  if (!decryptedBytes) {
    throw new Error('Unable to decrypt mobile wallet callback payload.')
  }

  return JSON.parse(new TextDecoder().decode(decryptedBytes))
}

function encryptPayloadWithSharedSecret({ sharedSecret, payload }) {
  const nonce = nacl.randomBytes(24)
  const messageBytes = new TextEncoder().encode(JSON.stringify(payload))
  const encryptedBytes = nacl.box.after(messageBytes, nonce, bs58.decode(sharedSecret))

  return {
    nonce: bs58.encode(nonce),
    payload: bs58.encode(encryptedBytes),
  }
}

function persistMobileSession(providerId, sessionPayload) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(
    getMobileSessionStorageKey(providerId),
    JSON.stringify({
      ...sessionPayload,
      updatedAt: Date.now(),
    }),
  )
}

function clearWalletCallbackParams(url) {
  const paramsToDelete = [
    'wallet_callback',
    'wallet_mode',
    'wallet_flow',
    'wallet_action',
    'wallet_entry',
    'wallet_cluster',
    'sale_env',
    'phantom_encryption_public_key',
    'solflare_encryption_public_key',
    'nonce',
    'data',
    'errorCode',
    'errorMessage',
  ]

  paramsToDelete.forEach((param) => {
    url.searchParams.delete(param)
  })

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', nextUrl)
}

function buildRedirectLink({ providerId, mode, flowMode, environmentId, action = 'connect' }) {
  const location = getCurrentLocation()
  const url = new URL(location.href)
  url.searchParams.set('wallet_callback', providerId)
  url.searchParams.set('wallet_mode', mode)
  url.searchParams.set('wallet_flow', flowMode)
  url.searchParams.set('wallet_action', action)
  url.searchParams.set('sale_env', environmentId)
  return url.toString()
}

function buildConnectUrl({ providerId, environmentId, flowMode }) {
  const location = getCurrentLocation()
  const appUrl = location.origin
  const redirectLink = buildRedirectLink({
    providerId,
    mode: 'mobile',
    flowMode,
    environmentId,
    action: 'connect',
  })
  const keypair = getOrCreateEncryptionKeypair(providerId)
  const publicKey = bs58.encode(keypair.publicKey)
  const cluster = getClusterFromEnvironment(environmentId)
  const baseUrl = providerId === 'solflare' ? 'https://solflare.com/ul/v1/connect' : 'https://phantom.app/ul/v1/connect'
  const url = new URL(baseUrl)
  url.searchParams.set('app_url', appUrl)
  url.searchParams.set('dapp_encryption_public_key', publicKey)
  url.searchParams.set('redirect_link', redirectLink)
  url.searchParams.set('cluster', cluster)
  return applyAndroidDeepLinkFallback(providerId, url.toString())
}

export function buildImmediateSolanaMobileConnectRoute({
  providerId,
  providerName,
  environmentId,
  flowMode = 'purchase',
}) {
  return {
    link: buildConnectUrl({
      providerId,
      environmentId,
      flowMode,
    }),
    qrLink: '',
    label: `${providerName} Mobile Connect`,
    source: 'connect',
  }
}

function buildTransactionUrl({
  providerId,
  environmentId,
  flowMode,
  action,
  session,
  sharedSecret,
  transaction,
  sendOptions,
}) {
  const keypair = getOrCreateEncryptionKeypair(providerId)
  const redirectLink = buildRedirectLink({
    providerId,
    mode: 'mobile-sign',
    flowMode,
    environmentId,
    action,
  })
  const payload = {
    transaction,
    session,
  }

  if (providerId === 'solflare' && sendOptions) {
    payload.sendOptions = sendOptions
  }

  const encryptedPayload = encryptPayloadWithSharedSecret({
    sharedSecret,
    payload,
  })
  const url = new URL(getProviderTransactionBaseUrl(providerId))
  url.searchParams.set('dapp_encryption_public_key', bs58.encode(keypair.publicKey))
  url.searchParams.set('nonce', encryptedPayload.nonce)
  url.searchParams.set('redirect_link', redirectLink)
  url.searchParams.set('payload', encryptedPayload.payload)
  return applyAndroidDeepLinkFallback(providerId, url.toString())
}

function buildBrowseUrl({ providerId, environmentId }) {
  const location = getCurrentLocation()
  const cluster = getClusterFromEnvironment(environmentId)
  const targetUrl = new URL(location.href)
  attachStoredReferralCandidateToUrl(targetUrl)
  targetUrl.searchParams.set('sale_env', environmentId)
  targetUrl.searchParams.set('wallet_entry', providerId)
  targetUrl.searchParams.set('wallet_cluster', cluster)

  if (providerId === 'solflare') {
    return `https://solflare.com/ul/v1/browse/${encodeURIComponent(targetUrl.toString())}?ref=${encodeURIComponent(location.origin)}`
  }

  return applyAndroidDeepLinkFallback(
    providerId,
    `https://phantom.app/ul/browse/${encodeURIComponent(targetUrl.toString())}?ref=${encodeURIComponent(location.origin)}`,
  )
}

export function buildSolanaInAppBrowserRoute({
  providerId,
  providerName,
  environmentId,
}) {
  return {
    link: buildBrowseUrl({
      providerId,
      environmentId,
    }),
    qrLink: '',
    label: `${providerName} In-App Browser`,
    source: 'browse',
  }
}

export async function buildWalletRoute({
  provider,
  mode,
  flowMode = 'purchase',
  environmentId,
  networkId,
}) {
  if (!provider) {
    return {
      link: '',
      qrLink: '',
      label: '',
      source: 'none',
    }
  }

  const isSolanaProvider = provider.groupId === 'solana'
  if (mode === 'browser') {
    return {
      link: isMobileBrowserClient() ? provider.mobileInstallUrl ?? provider.installUrl ?? '' : provider.installUrl ?? '',
      qrLink: '',
      label: 'Browser Extension',
      source: 'install',
    }
  }

  if (isSolanaProvider) {
    if (mode === 'webapp') {
      return buildSolanaInAppBrowserRoute({
        providerId: provider.id,
        providerName: provider.name,
        environmentId,
      })
    }

    return {
      ...buildImmediateSolanaMobileConnectRoute({
        providerId: provider.id,
        providerName: provider.name,
        environmentId,
        flowMode,
      }),
    }
  }

  if (provider.groupId === 'evm') {
    const useWalletConnectHandoff = shouldUseEvmWalletConnectHandoff(provider, mode)
    const inAppBrowserRoute =
      mode === 'webapp' || (mode === 'mobile' && supportsEvmInAppBrowserRoute(provider.id))
        ? buildEvmInAppBrowserRoute({
            providerId: provider.id,
            providerName: provider.name,
            environmentId,
            networkId,
          })
        : null

    if (mode === 'webapp') {
      return inAppBrowserRoute?.link
        ? inAppBrowserRoute
        : {
            link: '',
            qrLink: '',
            label: '',
            source: 'none',
          }
    }

    if (!useWalletConnectHandoff && inAppBrowserRoute?.link) {
      return inAppBrowserRoute
    }

    if (provider.connectMode === 'qr' || useWalletConnectHandoff) {
      return buildEvmWalletConnectRoute({
        providerId: provider.id,
        providerName: provider.name,
        forceFresh: mode === 'mobile',
      })
    }
  }

  return {
    link: `https://connect.aioracle.link/${provider.id}?tab=${mode}`,
    qrLink: '',
    label: `${provider.name} ${mode}`,
    source: 'placeholder',
  }
}

export function storePendingMobileTransaction(pendingTx) {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(
    MOBILE_PENDING_TX_KEY,
    JSON.stringify({
      ...pendingTx,
      updatedAt: Date.now(),
    }),
  )
}

export function getPendingMobileTransaction() {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.sessionStorage.getItem(MOBILE_PENDING_TX_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearPendingMobileTransaction() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(MOBILE_PENDING_TX_KEY)
}

export async function generateWalletQrDataUrl(link) {
  if (!link) {
    return ''
  }

  return QRCode.toDataURL(link, {
    width: 720,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#1f1f1f',
      light: '#ffffff',
    },
  })
}

export function getStoredMobileSession(providerId) {
  if (typeof window === 'undefined' || !providerId) {
    return null
  }

  const stored = window.sessionStorage.getItem(getMobileSessionStorageKey(providerId))
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearStoredMobileSession(providerId) {
  if (typeof window === 'undefined' || !providerId) {
    return
  }

  window.sessionStorage.removeItem(getMobileSessionStorageKey(providerId))
}

export function consumeSolanaWalletCallback() {
  if (typeof window === 'undefined') {
    return null
  }

  const url = new URL(window.location.href)
  const providerId = url.searchParams.get('wallet_callback')

  if (!providerId) {
    return null
  }

  const environmentId = url.searchParams.get('sale_env') || 'devnet'
  const flowMode = url.searchParams.get('wallet_flow') || 'purchase'
  const callbackMode = url.searchParams.get('wallet_mode') || 'mobile'
  const action = url.searchParams.get('wallet_action') || 'connect'
  const errorCode = url.searchParams.get('errorCode')
  const errorMessage = url.searchParams.get('errorMessage')

  try {
    if (errorCode || errorMessage) {
      return {
        ok: false,
        providerId,
        environmentId,
        flowMode,
        callbackMode,
        action,
        error: errorMessage || `Wallet callback failed with error code ${errorCode}.`,
      }
    }

    const nonce = url.searchParams.get('nonce')
    const data = url.searchParams.get('data')
    const walletEncryptionPublicKey = url.searchParams.get(getProviderEncryptionParam(providerId))

    if (!nonce || !data) {
      return {
        ok: false,
        providerId,
        environmentId,
        flowMode,
        callbackMode,
        action,
        error: 'Wallet callback is missing encrypted response data.',
      }
    }

    if (action === 'connect') {
      if (!walletEncryptionPublicKey) {
        return {
          ok: false,
          providerId,
          environmentId,
          flowMode,
          callbackMode,
          action,
          error: 'Wallet connect callback is missing the wallet encryption public key.',
        }
      }

      // Connect responses derive a fresh shared secret from the wallet public key returned in the callback.
      let decodedPayload
      try {
        decodedPayload = decodeEncryptedPayload({
          providerId,
          nonce,
          data,
          walletEncryptionPublicKey,
        })
      } catch (error) {
        return {
          ok: false,
          providerId,
          environmentId,
          flowMode,
          callbackMode,
          action,
          error: error?.message || 'Unable to restore the Phantom mobile wallet session.',
        }
      }

      const { decoded, sharedSecret } = decodedPayload

      const nextSession = {
        address: decoded.public_key,
        session: decoded.session,
        walletEncryptionPublicKey,
        sharedSecret,
        environmentId,
        providerId,
      }

      persistMobileSession(providerId, nextSession)

      return {
        ok: true,
        providerId,
        environmentId,
        flowMode,
        callbackMode,
        action,
        address: decoded.public_key,
        session: decoded.session,
        mobileSession: nextSession,
      }
    }

    const storedSession = getStoredMobileSession(providerId)

    if (!storedSession?.sharedSecret) {
      return {
        ok: false,
        providerId,
        environmentId,
        flowMode,
        callbackMode,
        action,
        error: 'Mobile wallet session was not found locally. Reconnect the wallet and retry.',
      }
    }

    try {
      return {
        ok: true,
        providerId,
        environmentId,
        flowMode,
        callbackMode,
        action,
        mobileSession: storedSession,
        mobileResult: decodePayloadWithSharedSecret({
          sharedSecret: storedSession.sharedSecret,
          nonce,
          data,
        }),
      }
    } catch (error) {
      return {
        ok: false,
        providerId,
        environmentId,
        flowMode,
        callbackMode,
        action,
        error: error?.message || 'Unable to decode the mobile wallet response.',
      }
    }
  } finally {
    // Remove one-time wallet response params so refreshes don't re-run the callback handler.
    clearWalletCallbackParams(url)
  }
}

export function buildSolanaMobileTransactionRoute({
  providerId,
  environmentId,
  flowMode = 'purchase',
  action,
  session,
  sharedSecret,
  transaction,
  sendOptions,
}) {
  if (!providerId || !session || !sharedSecret || !transaction) {
    throw new Error('Solana mobile transaction route is missing session or transaction data.')
  }

  return buildTransactionUrl({
    providerId,
    environmentId,
    flowMode,
    action,
    session,
    sharedSecret,
    transaction,
    sendOptions,
  })
}
