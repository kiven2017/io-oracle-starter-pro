import { officialWallets } from './siteContent'

const officialSolanaWallet = officialWallets.find((wallet) => wallet.id === 'solana')?.address ?? ''
const officialBscWallet = officialWallets.find((wallet) => wallet.id === 'bnb-bep20')?.address ?? ''
const officialEvmWallet = officialWallets.find((wallet) => wallet.id === 'multichain')?.address ?? ''
const CONFIG_PATHS = {
  evm: {
    ethereumSepolia: '/config/evm.ethereum.sepolia.json',
    local: '/config/evm.local.json',
    bscTestnet: '/config/evm.bsc.testnet.json',
    bscTestnetExample: '/config/evm.bsc.testnet.example.json',
    bscTestnetWallet: '/config/evm.bsc.testnet.wallet.json',
  },
  solana: {
    devnet: '/config/solana.devnet.json',
  },
}

export const SALE_ENVIRONMENTS = [
  {
    id: 'production',
    label: 'Production',
    badge: 'OFFICIAL',
    tone: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    description: 'Official wallet display only. Solana production contract is not deployed in this workspace yet.',
    evm: {
      contractEnabled: false,
      officialTreasuryByNetwork: {
        bsc: officialBscWallet,
        ethereum: officialEvmWallet,
      },
    },
    solana: {
      cluster: 'mainnet-beta',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      contractEnabled: false,
      officialTreasury: officialSolanaWallet,
    },
  },
  {
    id: 'devnet',
    label: 'Devnet Test',
    badge: 'TESTNET ONLY',
    tone: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    description: 'Use devnet and public testnet wallets only. Solana uses devnet; EVM supports both Ethereum Sepolia and BNB Smart Chain Testnet. Never publish these addresses as official treasury routes.',
    evm: {
      contractEnabled: true,
      configUrls: {
        bsc: CONFIG_PATHS.evm.bscTestnet,
        ethereum: CONFIG_PATHS.evm.ethereumSepolia,
      },
      walletNetworkConfigUrls: {
        bsc: CONFIG_PATHS.evm.bscTestnetWallet,
      },
      officialTreasuryByNetwork: {
        bsc: officialBscWallet,
        ethereum: officialEvmWallet,
      },
    },
    solana: {
      cluster: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      contractEnabled: true,
      configUrl: CONFIG_PATHS.solana.devnet,
    },
  },
  {
    id: 'local',
    label: 'Local Test Only',
    badge: 'LOCAL TEST ONLY',
    tone: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
    description: 'Use local wallets, local RPC, and throwaway test accounts only. Never publish these routes as official treasury addresses.',
    evm: {
      contractEnabled: true,
      configUrl: CONFIG_PATHS.evm.local,
      walletNetworkConfigUrls: {
        bsc: CONFIG_PATHS.evm.bscTestnetWallet,
      },
      officialTreasuryByNetwork: {
        bsc: officialBscWallet,
        ethereum: officialEvmWallet,
      },
    },
    solana: {
      cluster: 'devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      contractEnabled: false,
      officialTreasury: officialSolanaWallet,
    },
  },
]

export function getSaleEnvironment(envId) {
  return SALE_ENVIRONMENTS.find((environment) => environment.id === envId) ?? SALE_ENVIRONMENTS[0]
}
