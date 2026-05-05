import { BrowserProvider, Contract, Interface, formatUnits, getAddress, isAddress, parseUnits } from 'ethers'

const WALLET_SIGNATURE_TIMEOUT_MS = 45_000
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const PRESALE_ABI = [
  'function paymentToken() view returns (address)',
  'function saleToken() view returns (address)',
  'function treasury() view returns (address)',
  'function paused() view returns (bool)',
  'function claimStartTs() view returns (uint64)',
  'function minPurchaseAmount() view returns (uint256)',
  'function buyerPositions(address) view returns (uint256 purchasedTokens, uint256 paidAmount, uint256 claimedTokens, uint256 purchaseCount, uint64 lastPurchaseTs)',
  'function claimableAmount(address buyer) view returns (uint256)',
  'function buyWithPayment(uint256 paymentAmount, uint8 promoId, address directReferrer, address indirectReferrer)',
  'function claimTokens()',
]

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
]

const EVM_ERROR_ABI = [
  'error PresalePaused()',
  'error PurchaseBelowMinimum()',
  'error ZeroAddress()',
  'error InvalidStage()',
  'error InvalidReleaseSchedule()',
  'error NothingToClaim()',
  'error ClaimNotStarted()',
  'error InvalidReferrer()',
  'error InvalidPromoCode()',
  'error PromoCodeBelowMinimum()',
  'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
  'error ERC20InvalidSender(address sender)',
  'error ERC20InvalidReceiver(address receiver)',
  'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
  'error ERC20InvalidApprover(address approver)',
  'error ERC20InvalidSpender(address spender)',
  'error Error(string)',
  'error Panic(uint256)',
]

const EVM_ERROR_INTERFACE = new Interface(EVM_ERROR_ABI)

function trimTrailingZeros(value) {
  if (typeof value !== 'string' || !value.includes('.')) {
    return value
  }

  return value.replace(/(\.\d*?[1-9])0+$/u, '$1').replace(/\.0+$/u, '').replace(/\.$/u, '')
}

function formatTokenAmount(value, decimals = 18, symbol = 'tokens') {
  try {
    return `${trimTrailingZeros(formatUnits(value, decimals))} ${symbol}`.trim()
  } catch {
    return `${String(value)} ${symbol}`.trim()
  }
}

function shortenAddress(address) {
  if (typeof address !== 'string' || address.length < 12) {
    return address || ''
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function normalizeOptionalEvmAddress(address) {
  const value = String(address || '').trim()

  if (!value || !isAddress(value)) {
    return ZERO_ADDRESS
  }

  try {
    return getAddress(value)
  } catch {
    return ZERO_ADDRESS
  }
}

function isHexData(value) {
  return typeof value === 'string' && /^0x[0-9a-f]*$/iu.test(value)
}

function collectRevertData(error, seen = new WeakSet()) {
  if (!error || typeof error !== 'object') {
    return []
  }

  if (seen.has(error)) {
    return []
  }

  seen.add(error)

  const candidates = []
  const directKeys = ['data', 'result']
  const nestedKeys = ['error', 'info', 'cause', 'revert', 'originalError']

  for (const key of directKeys) {
    const candidate = error[key]
    if (isHexData(candidate)) {
      candidates.push(candidate)
    }
  }

  for (const key of nestedKeys) {
    const nestedValue = error[key]
    if (nestedValue && typeof nestedValue === 'object') {
      candidates.push(...collectRevertData(nestedValue, seen))
    }
  }

  if (Array.isArray(error.errors)) {
    for (const nestedError of error.errors) {
      candidates.push(...collectRevertData(nestedError, seen))
    }
  }

  return [...new Set(candidates)]
}

function decodeEvmError(error) {
  const revertName = error?.revert?.name
  if (revertName) {
    return {
      name: revertName,
      args: Array.from(error?.revert?.args || []),
      signature: error?.revert?.signature,
      data: collectRevertData(error).find((candidate) => candidate && candidate !== '0x') || '',
    }
  }

  const revertData = collectRevertData(error).find((candidate) => candidate && candidate !== '0x')
  if (!revertData) {
    return null
  }

  try {
    const decoded = EVM_ERROR_INTERFACE.parseError(revertData)
    return {
      name: decoded?.name || '',
      args: Array.from(decoded?.args || []),
      signature: decoded?.signature || '',
      data: revertData,
    }
  } catch {
    return {
      name: '',
      args: [],
      signature: '',
      data: revertData,
    }
  }
}

function formatRawRevertData(data) {
  if (!data) {
    return ''
  }

  return data.length <= 146 ? data : `${data.slice(0, 74)}...${data.slice(-16)}`
}

function buildEvmRevertMessage(decodedError, context = {}) {
  if (!decodedError) {
    return ''
  }

  const {
    name,
    args = [],
    data = '',
  } = decodedError
  const {
    chainName,
    paymentSymbol = 'token',
    paymentDecimals = 18,
    rawAmount,
    minPurchaseAmount,
    directReferrerAddress,
    indirectReferrerAddress,
    claimStartTs,
  } = context

  if (name === 'PresalePaused') {
    return `Purchase rejected by contract: presale is paused on ${chainName || 'the selected network'}.`
  }

  if (name === 'PurchaseBelowMinimum') {
    const submittedAmount = rawAmount != null ? formatTokenAmount(rawAmount, paymentDecimals, paymentSymbol) : 'the submitted amount'
    const minimumAmount = minPurchaseAmount != null
      ? formatTokenAmount(minPurchaseAmount, paymentDecimals, paymentSymbol)
      : 'the contract minimum'
    return `Purchase rejected by contract: ${submittedAmount} is below the minimum ${minimumAmount}.`
  }

  if (name === 'InvalidReferrer') {
    const referrerDetails = [
      directReferrerAddress && directReferrerAddress !== ZERO_ADDRESS
        ? `direct=${shortenAddress(directReferrerAddress)}`
        : '',
      indirectReferrerAddress && indirectReferrerAddress !== ZERO_ADDRESS
        ? `indirect=${shortenAddress(indirectReferrerAddress)}`
        : '',
    ].filter(Boolean)

    return `Purchase rejected by contract: referral binding is invalid${referrerDetails.length ? ` (${referrerDetails.join(', ')})` : ''}.`
  }

  if (name === 'InvalidPromoCode') {
    return 'Purchase rejected by contract: the selected promo code is not supported on-chain.'
  }

  if (name === 'PromoCodeBelowMinimum') {
    return 'Purchase rejected by contract: the selected promo code does not meet its minimum purchase requirement.'
  }

  if (name === 'NothingToClaim') {
    return 'Claim rejected by contract: this wallet has no claimable AIO right now.'
  }

  if (name === 'ClaimNotStarted') {
    const claimStartMessage = claimStartTs
      ? ` Claim start timestamp: ${claimStartTs}.`
      : ''
    return `Claim rejected by contract: claim is not live yet.${claimStartMessage}`
  }

  if (name === 'ERC20InsufficientAllowance') {
    const [, allowance, needed] = args
    return `Payment token allowance is insufficient. Approved ${formatTokenAmount(allowance, paymentDecimals, paymentSymbol)}, required ${formatTokenAmount(needed, paymentDecimals, paymentSymbol)}.`
  }

  if (name === 'ERC20InsufficientBalance') {
    const [, balance, needed] = args
    return `Payment token balance is insufficient. Wallet balance ${formatTokenAmount(balance, paymentDecimals, paymentSymbol)}, required ${formatTokenAmount(needed, paymentDecimals, paymentSymbol)}.`
  }

  if (name === 'ERC20InvalidSpender') {
    const [spender] = args
    return `Payment token rejected the spender address: ${shortenAddress(spender)}.`
  }

  if (name === 'ERC20InvalidReceiver') {
    const [receiver] = args
    return `Payment token rejected the receiver address: ${shortenAddress(receiver)}.`
  }

  if (name === 'ERC20InvalidSender') {
    const [sender] = args
    return `Payment token rejected the sender address: ${shortenAddress(sender)}.`
  }

  if (name === 'Error' && typeof args[0] === 'string' && args[0].trim()) {
    return args[0].trim()
  }

  if (name === 'Panic') {
    return `Contract panicked with code ${String(args[0])}.`
  }

  const rawData = formatRawRevertData(data)
  if (name) {
    return `Contract reverted with ${name}.${rawData ? ` Revert data: ${rawData}` : ''}`
  }

  if (rawData) {
    return `Contract reverted with an unknown custom error. Revert data: ${rawData}`
  }

  return ''
}

async function normalizeEvmWriteError(error, context = {}) {
  if (!error) {
    return new Error('EVM transaction failed.')
  }

  if (
    error instanceof Error &&
    (
      error.code === 4001 ||
      error.code === 'ACTION_REJECTED' ||
      /wallet provider is not ready|wallet network mismatch|no token approval request reached your wallet|no purchase request reached your wallet/i.test(error.message)
    )
  ) {
    return error
  }

  const decodedError = decodeEvmError(error)
  const decodedMessage = buildEvmRevertMessage(decodedError, context)

  if (decodedMessage) {
    return new Error(decodedMessage)
  }

  const message = String(
    error?.shortMessage ||
    error?.reason ||
    error?.error?.message ||
    error?.data?.message ||
    error?.message ||
    '',
  ).trim()

  return new Error(message || 'EVM transaction failed.')
}

function normalizeConfig(rawConfig) {
  if (!rawConfig) {
    return null
  }

  return {
    environment: rawConfig.environment,
    warning: rawConfig.warning,
    chainId: rawConfig.chain_id ?? rawConfig.chainId,
    rpcUrl: rawConfig.rpc_url ?? rawConfig.rpcUrl,
    chainName: rawConfig.chain_name ?? rawConfig.chainName,
    nativeCurrency: rawConfig.native_currency ?? rawConfig.nativeCurrency,
    presale: rawConfig.presale,
    paymentToken: rawConfig.payment_token ?? rawConfig.paymentToken,
    paymentTokenSymbol: rawConfig.payment_token_symbol ?? rawConfig.paymentTokenSymbol,
    saleToken: rawConfig.sale_token ?? rawConfig.saleToken,
    treasury: rawConfig.treasury,
    admin: rawConfig.admin,
    buyer: rawConfig.buyer,
    buyerPaymentBalance: rawConfig.buyer_payment_balance ?? rawConfig.buyerPaymentBalance,
  }
}

function hasReadyEvmProvider(walletProvider) {
  return Boolean(walletProvider && typeof walletProvider.request === 'function')
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timeoutId

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId)
  })
}

export async function loadEvmConfig(configUrl) {
  const response = await fetch(configUrl, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Unable to load EVM config: ${response.status}`)
  }

  return normalizeConfig(await response.json())
}

export const loadLocalEvmConfig = loadEvmConfig

export function toUiAmount(rawAmount, decimals = 18) {
  return Number(formatUnits(rawAmount, decimals))
}

function buildManualNetworkSetupMessage(config, providerId = '') {
  const chainName = config?.chainName || 'the required network'
  const providerName = providerId === 'trustwallet' ? 'Trust Wallet' : 'your wallet'
  const baseMessage = `Open ${chainName} in ${providerName}, then try again.`

  if (providerId !== 'trustwallet' || !config?.rpcUrl || !config?.chainId) {
    return baseMessage
  }

  const currencySymbol = config?.nativeCurrency?.symbol || 'ETH'
  return `${baseMessage} If Trust Wallet asks you to add it manually, use RPC ${config.rpcUrl}, Chain ID ${config.chainId}, Symbol ${currencySymbol}.`
}

export async function ensureEvmChain(walletProvider, config, options = {}) {
  const providerId = String(options?.providerId || '').trim().toLowerCase()
  if (!hasReadyEvmProvider(walletProvider) || !config?.chainId) {
    return
  }

  const targetChainHex = `0x${Number(config.chainId).toString(16)}`
  let activeChainHex = ''

  try {
    activeChainHex = await walletProvider.request({
      method: 'eth_chainId',
    })
  } catch {
    activeChainHex = ''
  }

  if (typeof activeChainHex === 'string' && activeChainHex.toLowerCase() === targetChainHex.toLowerCase()) {
    return
  }

  try {
    await walletProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainHex }],
    })
  } catch (error) {
    const code = error?.code ?? error?.error?.code
    const message = String(
      error?.shortMessage ||
      error?.reason ||
      error?.error?.message ||
      error?.message ||
      '',
    ).toLowerCase()

    if (
      code === 4001 ||
      code === 'ACTION_REJECTED' ||
      message.includes('user rejected') ||
      message.includes('request rejected') ||
      message.includes('user denied')
    ) {
      throw error
    }

    if (error?.code !== 4902) {
      if (
        code === 4200 ||
        code === -32601 ||
        message.includes('unsupported') ||
        message.includes('not support') ||
        message.includes('not supported') ||
        message.includes('unimplemented')
      ) {
        throw new Error(`Your wallet could not switch networks automatically. ${buildManualNetworkSetupMessage(config, providerId)}`)
      }

      throw error
    }

    try {
      await walletProvider.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: targetChainHex,
            chainName: config.chainName,
            rpcUrls: [config.rpcUrl],
            nativeCurrency: config.nativeCurrency,
          },
        ],
      })
    } catch (addChainError) {
      const addChainCode = addChainError?.code ?? addChainError?.error?.code
      const addChainMessage = String(
        addChainError?.shortMessage ||
        addChainError?.reason ||
        addChainError?.error?.message ||
        addChainError?.message ||
        '',
      ).toLowerCase()

      if (
        addChainCode === 4001 ||
        addChainCode === 'ACTION_REJECTED' ||
        addChainMessage.includes('user rejected') ||
        addChainMessage.includes('request rejected') ||
        addChainMessage.includes('user denied')
      ) {
        throw addChainError
      }

      throw new Error(`Your wallet could not add ${config.chainName || 'the required network'} automatically. ${buildManualNetworkSetupMessage(config, providerId)}`)
    }
  }
}

function getBrowserProvider(walletProvider) {
  if (!hasReadyEvmProvider(walletProvider)) {
    throw new Error('EVM wallet provider is not ready yet. Please return to the page and try again.')
  }

  return new BrowserProvider(walletProvider)
}

async function assertEvmConfigChain(browserProvider, config) {
  if (!browserProvider || !config?.chainId) {
    return
  }

  const network = await browserProvider.getNetwork()
  const activeChainId = Number(network?.chainId)
  const expectedChainId = Number(config.chainId)

  if (Number.isFinite(activeChainId) && Number.isFinite(expectedChainId) && activeChainId !== expectedChainId) {
    throw new Error(`Wallet network mismatch. Switch to ${config.chainName || `chain ${expectedChainId}`} and try again.`)
  }
}

function normalizeEvmContractReadError(error, config) {
  const message = String(error?.message || error || '')

  if (error?.code === 'BAD_DATA' || message.includes('could not decode result data')) {
    return new Error(`EVM token contract read failed on ${config?.chainName || 'the selected network'}. Check the token contract addresses and wallet network.`)
  }

  return error instanceof Error ? error : new Error(message || 'EVM contract read failed.')
}

export async function fetchEvmBuyerSnapshot({ config, walletProvider, buyerAddress }) {
  const normalizedConfig = normalizeConfig(config)
  if (!normalizedConfig || !hasReadyEvmProvider(walletProvider) || !buyerAddress) {
    return null
  }

  const browserProvider = getBrowserProvider(walletProvider)
  await assertEvmConfigChain(browserProvider, normalizedConfig)
  const presale = new Contract(normalizedConfig.presale, PRESALE_ABI, browserProvider)
  const paymentToken = new Contract(normalizedConfig.paymentToken, ERC20_ABI, browserProvider)
  const saleToken = new Contract(normalizedConfig.saleToken, ERC20_ABI, browserProvider)

  let buyerPosition
  let claimableRaw
  let paymentDecimals
  let saleDecimals
  let paymentBalance

  try {
    [buyerPosition, claimableRaw, paymentDecimals, saleDecimals, paymentBalance] = await Promise.all([
      presale.buyerPositions(buyerAddress),
      presale.claimableAmount(buyerAddress),
      paymentToken.decimals(),
      saleToken.decimals(),
      paymentToken.balanceOf(buyerAddress),
    ])
  } catch (error) {
    throw normalizeEvmContractReadError(error, normalizedConfig)
  }

  return {
    buyerPosition,
    claimableRaw,
    claimableUi: toUiAmount(claimableRaw, saleDecimals),
    paymentBalanceRaw: paymentBalance,
    paymentBalanceUi: toUiAmount(paymentBalance, paymentDecimals),
    paymentDecimals,
    saleDecimals,
  }
}

export async function fetchEvmWalletOverview({ config, walletProvider, buyerAddress }) {
  const normalizedConfig = normalizeConfig(config)
  if (!hasReadyEvmProvider(walletProvider) || !buyerAddress) {
    return null
  }

  const browserProvider = getBrowserProvider(walletProvider)
  await assertEvmConfigChain(browserProvider, normalizedConfig)
  const network = await browserProvider.getNetwork()
  const nativeBalance = await browserProvider.getBalance(buyerAddress)

  let paymentSymbol = normalizedConfig?.paymentTokenSymbol || '--'
  let paymentBalanceUi = null
  if (normalizedConfig?.paymentToken) {
    const paymentToken = new Contract(normalizedConfig.paymentToken, ERC20_ABI, browserProvider)
    let paymentBalance
    let paymentDecimals
    let resolvedPaymentSymbol

    try {
      [paymentBalance, paymentDecimals, resolvedPaymentSymbol] = await Promise.all([
        paymentToken.balanceOf(buyerAddress),
        paymentToken.decimals(),
        paymentToken.symbol().catch(() => normalizedConfig?.paymentTokenSymbol || 'Payment'),
      ])
    } catch (error) {
      throw normalizeEvmContractReadError(error, normalizedConfig)
    }

    paymentSymbol = resolvedPaymentSymbol
    paymentBalanceUi = toUiAmount(paymentBalance, paymentDecimals)
  }

  let saleSymbol = '--'
  let saleBalanceUi = null
  if (normalizedConfig?.saleToken) {
    const saleToken = new Contract(normalizedConfig.saleToken, ERC20_ABI, browserProvider)
    let saleBalance
    let saleDecimals
    let resolvedSaleSymbol

    try {
      [saleBalance, saleDecimals, resolvedSaleSymbol] = await Promise.all([
        saleToken.balanceOf(buyerAddress),
        saleToken.decimals(),
        saleToken.symbol().catch(() => 'AIO'),
      ])
    } catch (error) {
      throw normalizeEvmContractReadError(error, normalizedConfig)
    }

    saleSymbol = resolvedSaleSymbol
    saleBalanceUi = toUiAmount(saleBalance, saleDecimals)
  }

  return {
    nativeSymbol: normalizedConfig?.nativeCurrency?.symbol ?? network?.name?.toUpperCase() ?? 'ETH',
    nativeBalanceUi: toUiAmount(nativeBalance, normalizedConfig?.nativeCurrency?.decimals ?? 18),
    paymentSymbol,
    paymentBalanceUi,
    saleSymbol,
    saleBalanceUi,
    hasProjectTokenConfig: Boolean(normalizedConfig?.paymentToken && normalizedConfig?.saleToken),
  }
}

export async function submitEvmBuy({
  config,
  walletProvider,
  paymentAmountUi,
  promoId = 0,
  directReferrerAddress,
  indirectReferrerAddress,
  onProgress,
  approvalTimeoutMessage,
  purchaseTimeoutMessage,
}) {
  const normalizedConfig = normalizeConfig(config)
  if (!hasReadyEvmProvider(walletProvider)) {
    throw new Error('EVM wallet provider is not ready yet. Please reconnect the wallet and try again.')
  }

  const browserProvider = getBrowserProvider(walletProvider)
  await assertEvmConfigChain(browserProvider, normalizedConfig)
  const signer = await browserProvider.getSigner()
  const signerAddress = await signer.getAddress()
  const paymentToken = new Contract(normalizedConfig.paymentToken, ERC20_ABI, signer)
  const presale = new Contract(normalizedConfig.presale, PRESALE_ABI, signer)
  let paymentDecimals
  let paymentSymbol = 'token'
  let minPurchaseAmount = null
  let nativeBalance = 0n

  try {
    ;[paymentDecimals, paymentSymbol, minPurchaseAmount, nativeBalance] = await Promise.all([
      paymentToken.decimals(),
      paymentToken.symbol().catch(() => normalizedConfig?.paymentTokenSymbol || 'token'),
      presale.minPurchaseAmount().catch(() => null),
      browserProvider.getBalance(signerAddress).catch(() => 0n),
    ])
  } catch (error) {
    throw normalizeEvmContractReadError(error, normalizedConfig)
  }

  const rawAmount = parseUnits(String(paymentAmountUi), paymentDecimals)
  const normalizedDirectReferrerAddress = normalizeOptionalEvmAddress(directReferrerAddress)
  const normalizedIndirectReferrerAddress = normalizeOptionalEvmAddress(indirectReferrerAddress)
  const writeErrorContext = {
    chainName: normalizedConfig.chainName,
    paymentSymbol,
    paymentDecimals,
    rawAmount,
    minPurchaseAmount,
    directReferrerAddress: normalizedDirectReferrerAddress,
    indirectReferrerAddress: normalizedIndirectReferrerAddress,
  }

  try {
    const paymentBalance = await paymentToken.balanceOf(signerAddress)

    if (paymentBalance < rawAmount) {
      throw new Error(
        `Payment token balance is insufficient. Wallet balance ${formatTokenAmount(paymentBalance, paymentDecimals, paymentSymbol)}, required ${formatTokenAmount(rawAmount, paymentDecimals, paymentSymbol)}.`,
      )
    }

    if (nativeBalance <= 0n) {
      throw new Error(
        `Native gas balance is too low. Add some ${normalizedConfig.nativeCurrency?.symbol || 'ETH'} on ${normalizedConfig.chainName || 'the selected network'} and try again.`,
      )
    }

    const allowance = await paymentToken.allowance(signerAddress, normalizedConfig.presale)

    if (allowance < rawAmount) {
      onProgress?.({ stage: 'approval_required' })
      const approvalTx = await withTimeout(
        paymentToken.approve(normalizedConfig.presale, rawAmount),
        WALLET_SIGNATURE_TIMEOUT_MS,
        approvalTimeoutMessage || 'No token approval request reached your wallet. Please reopen the wallet app and try again.',
      )
      onProgress?.({ stage: 'approval_submitted', hash: approvalTx.hash })
      await approvalTx.wait()
    }

    onProgress?.({ stage: 'purchase_required' })
    const buyTx = await withTimeout(
      presale.buyWithPayment(
        rawAmount,
        Number.isFinite(Number(promoId)) ? Number(promoId) : 0,
        normalizedDirectReferrerAddress,
        normalizedIndirectReferrerAddress,
      ),
      WALLET_SIGNATURE_TIMEOUT_MS,
      purchaseTimeoutMessage || 'No purchase request reached your wallet. Please reopen the wallet app and try again.',
    )
    onProgress?.({ stage: 'purchase_submitted', hash: buyTx.hash })
    const receipt = await buyTx.wait()

    return {
      hash: receipt.hash,
      buyerAddress: signerAddress,
    }
  } catch (error) {
    throw await normalizeEvmWriteError(error, writeErrorContext)
  }
}
export async function submitEvmClaim({ config, walletProvider }) {
  const normalizedConfig = normalizeConfig(config)
  if (!hasReadyEvmProvider(walletProvider)) {
    throw new Error('EVM wallet provider is not ready yet. Please reconnect the wallet and try again.')
  }

  const browserProvider = getBrowserProvider(walletProvider)
  await assertEvmConfigChain(browserProvider, normalizedConfig)
  const signer = await browserProvider.getSigner()
  const presale = new Contract(normalizedConfig.presale, PRESALE_ABI, signer)
  let claimStartTs = null

  try {
    claimStartTs = await presale.claimStartTs().catch(() => null)
    const claimTx = await presale.claimTokens()
    const receipt = await claimTx.wait()

    return {
      hash: receipt.hash,
    }
  } catch (error) {
    throw await normalizeEvmWriteError(error, {
      chainName: normalizedConfig.chainName,
      claimStartTs,
    })
  }
}
