export const WALLET_PROVIDER_GROUPS = [
  {
    id: 'evm',
    title: 'EVM Wallet',
    description: 'MetaMask, Binance, Trust Wallet, Coinbase, TokenPocket, Bitget Wallet and more.',
    providers: [
      {
        id: 'metamask',
        name: 'MetaMask',
        brand: 'metamask',
        connectMode: 'direct',
        status: 'INSTALLED',
        installUrl: 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn',
        mobileInstallUrl: 'https://metamask.io/download/',
      },
      {
        id: 'binance',
        name: 'Binance Wallet',
        brand: 'binance',
        connectMode: 'qr',
        status: 'SCAN',
        installUrl: 'https://chromewebstore.google.com/detail/%E5%B8%81%E5%AE%89%E9%92%B1%E5%8C%85/cadiboklkpojfamcoggejbbdjcoiljjk',
        mobileInstallUrl: 'https://www.binance.com/en/download',
      },
      {
        id: 'safepal',
        name: 'SafePal',
        brand: 'safepal',
        connectMode: 'qr',
        status: 'SCAN',
        installUrl: 'https://www.safepal.com/extension',
        mobileInstallUrl: 'https://www.safepal.com/download?product=2',
      },
      {
        id: 'trustwallet',
        name: 'Trust Wallet',
        brand: 'trustwallet',
        connectMode: 'qr',
        status: 'SCAN',
        installUrl: 'https://trustwallet.com/browser-extension',
        mobileInstallUrl: 'https://trustwallet.com/download',
      },
      {
        id: 'coinbase',
        name: 'Coinbase Wallet',
        brand: 'coinbase',
        connectMode: 'qr',
        status: 'SCAN',
        installUrl: 'https://www.coinbase.com/wallet/articles/getting-started-extension',
        mobileInstallUrl: 'https://www.coinbase.com/wallet/downloads',
      },
      {
        id: 'tokenpocket',
        name: 'TokenPocket',
        brand: 'tokenpocket',
        connectMode: 'qr',
        status: 'SCAN',
        installUrl: 'https://www.tokenpocket.pro/',
        mobileInstallUrl: 'https://www.tokenpocket.pro/',
      },
      {
        id: 'bitget',
        name: 'Bitget Wallet',
        brand: 'bitget',
        connectMode: 'qr',
        status: 'SCAN',
        installUrl: 'https://web3.bitget.com/en/wallet-download',
        mobileInstallUrl: 'https://web3.bitget.com/en/wallet-download',
      },
    ],
  },
  {
    id: 'solana',
    title: 'Solana',
    description: 'Phantom, Solflare and other Solana wallet routes.',
    providers: [
      {
        id: 'phantom',
        name: 'Phantom',
        brand: 'phantom',
        connectMode: 'direct',
        status: 'INSTALLED',
        installUrl: 'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
        mobileInstallUrl: 'https://phantom.com/download',
      },
      {
        id: 'solflare',
        name: 'Solflare',
        brand: 'solflare',
        connectMode: 'direct',
        status: 'INSTALLED',
        installUrl: 'https://chromewebstore.google.com/detail/solflare-wallet/bhhhlbepdkbapadjdnnojkbgioiodbic',
        mobileInstallUrl: 'https://www.solflare.com/download/',
      },
    ],
  },
]

export const QUICK_ACCESS_METHODS = [
  {
    id: 'ethereum-route',
    label: 'Ethereum',
    brand: 'ethereum',
    type: 'crypto',
    networkId: 'ethereum',
    tokenSymbol: 'USDC',
    providerId: 'metamask',
  },
  {
    id: 'solana-route',
    label: 'Solana',
    brand: 'solana',
    type: 'crypto',
    networkId: 'solana',
    tokenSymbol: 'USDC',
    providerId: 'phantom',
  },
  {
    id: 'bsc-route',
    label: 'BSC',
    brand: 'binance',
    type: 'crypto',
    networkId: 'bsc',
    tokenSymbol: 'USDC',
    providerId: 'binance',
  },
  {
    id: 'mastercard',
    label: 'Mastercard',
    brand: 'mastercard',
    type: 'card',
  },
  {
    id: 'visa',
    label: 'Visa',
    brand: 'visa',
    type: 'card',
  },
  {
    id: 'applepay',
    label: 'Apple Pay',
    brand: 'applepay',
    type: 'card',
  },
  {
    id: 'gpay',
    label: 'Google Pay',
    brand: 'gpay',
    type: 'card',
  },
]

export const CARD_METHODS = QUICK_ACCESS_METHODS.filter((method) => method.type === 'card')

export function getWalletProvider(providerId) {
  for (const group of WALLET_PROVIDER_GROUPS) {
    const provider = group.providers.find((item) => item.id === providerId)

    if (provider) {
      return {
        ...provider,
        groupId: group.id,
      }
    }
  }

  return null
}
