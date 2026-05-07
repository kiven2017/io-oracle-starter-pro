export const EVM_NETWORKS = [
  { id: 'bsc', label: 'BSC', kind: 'evm' as const },
  { id: 'ethereum', label: 'Ethereum', kind: 'evm' as const },
];

export const SOLANA_NETWORK = { id: 'solana', label: 'Solana', kind: 'solana' as const };

export const NETWORKS = [...EVM_NETWORKS, SOLANA_NETWORK];
