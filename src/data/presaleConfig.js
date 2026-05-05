export const PRESALE_CONFIG = {
  stages: 15,
  currentStage: 1,
  startPrice: 0.0035,
  stageIncrease: 0.1,
  minPurchaseUsd: 100,
  soldPercent: 45.2,
  remainingAio: 54_800_000,
  defaultNetworkId: 'ethereum',
  defaultToken: 'USDC',
  unlock: {
    tgePercent: 15,
    linearMonths: 12,
  },
}

export const NETWORKS = [
  {
    id: 'bsc',
    label: 'BSC',
    description: 'BNB Smart Chain settlement route',
    walletFormat: 'evm',
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    description: 'Ethereum mainnet settlement route',
    walletFormat: 'evm',
  },
  {
    id: 'solana',
    label: 'Solana',
    description: 'Solana wallet settlement route',
    walletFormat: 'solana',
  },
]

export const TOKENS = [
  {
    symbol: 'USDT',
    label: 'Tether USD',
    networks: ['bsc', 'ethereum', 'solana'],
    usdRate: 1,
  },
  {
    symbol: 'USDC',
    label: 'USD Coin',
    networks: ['bsc', 'ethereum', 'solana'],
    usdRate: 1,
  },
  {
    symbol: 'ETH',
    label: 'Ether',
    networks: ['bsc', 'ethereum'],
    usdRate: 3250,
  },
  {
    symbol: 'SOL',
    label: 'Solana',
    networks: ['solana'],
    usdRate: 145,
  },
]

export const TX_STATE_META = {
  idle: {
    label: 'Ready',
    tone: 'text-cyan-400',
    description: 'Wallet and route are ready for presale review.',
  },
  wallet_not_connected: {
    label: 'Wallet Required',
    tone: 'text-amber-300',
    description: 'Connect a wallet before reviewing the purchase.',
  },
  wrong_network: {
    label: 'Switch Network',
    tone: 'text-yellow-300',
    description: 'Selected payment route does not match the connected wallet network.',
  },
  input_invalid: {
    label: 'Amount Too Low',
    tone: 'text-red-300',
    description: 'Minimum purchase is 100 USDT equivalent.',
  },
  awaiting_signature: {
    label: 'Awaiting Signature',
    tone: 'text-sky-300',
    description: 'Waiting for wallet approval.',
  },
  submitted: {
    label: 'Submitted',
    tone: 'text-blue-300',
    description: 'Transaction submitted to the selected blockchain route.',
  },
  confirmed: {
    label: 'Confirmed',
    tone: 'text-emerald-300',
    description: 'Purchase confirmed and reflected in the presale activity feed.',
  },
  failed: {
    label: 'Failed',
    tone: 'text-red-300',
    description: 'The transaction could not be completed. Review the wallet, route, and token balance, then retry.',
  },
}

export const CARD_ROUTE_TOKEN_BY_NETWORK = {
  bsc: 'USDC',
  ethereum: 'USDC',
  solana: 'USDC',
}

export function getStagePrice(stage) {
  return Number(
    (PRESALE_CONFIG.startPrice * (1 + PRESALE_CONFIG.stageIncrease) ** Math.max(stage - 1, 0)).toFixed(6),
  )
}

export function getNextStagePrice(stage = PRESALE_CONFIG.currentStage) {
  const nextStage = Math.min(stage + 1, PRESALE_CONFIG.stages)
  return getStagePrice(nextStage)
}

export function getPriceStages(currentStage = PRESALE_CONFIG.currentStage) {
  return Array.from({ length: PRESALE_CONFIG.stages }, (_, index) => {
    const stageNumber = index + 1
    let status = 'UPCOMING'

    if (stageNumber < currentStage) {
      status = 'COMPLETED'
    } else if (stageNumber === currentStage) {
      status = 'ACTIVE'
    } else if (stageNumber === PRESALE_CONFIG.stages) {
      status = 'FINAL'
    }

    return {
      label: `Stage ${stageNumber}`,
      price: `$${getStagePrice(stageNumber).toFixed(6)}`,
      status,
    }
  })
}

export function getTokenOptionsForNetwork(networkId) {
  return TOKENS.filter((token) => token.networks.includes(networkId))
}

export function getDefaultTokenForNetwork(networkId) {
  return getTokenOptionsForNetwork(networkId).some((token) => token.symbol === 'USDC') ? 'USDC' : 'USDT'
}

export function getNetworkOptionsForProviderGroup(groupId) {
  if (groupId === 'solana') {
    return NETWORKS.filter((network) => network.walletFormat === 'solana')
  }

  if (groupId === 'evm') {
    return NETWORKS.filter((network) => network.walletFormat === 'evm')
  }

  return NETWORKS
}

export function getCardTokenForNetwork(networkId) {
  return CARD_ROUTE_TOKEN_BY_NETWORK[networkId] ?? 'USDC'
}
