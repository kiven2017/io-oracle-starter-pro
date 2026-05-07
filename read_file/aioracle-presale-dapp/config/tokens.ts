export type TokenOption = {
  symbol: 'USDT' | 'USDC' | 'ETH' | 'SOL' | 'BTC';
  networks: string[];
  warning?: string;
};

export const TOKENS: TokenOption[] = [
  { symbol: 'USDT', networks: ['bsc', 'ethereum', 'solana'] },
  { symbol: 'USDC', networks: ['bsc', 'ethereum', 'solana'] },
  { symbol: 'ETH', networks: ['bsc', 'ethereum'] },
  { symbol: 'SOL', networks: ['solana'] },
  {
    symbol: 'BTC',
    networks: ['bsc', 'ethereum', 'solana'],
    warning: 'BTC payments must use a dedicated BTC invoice address. Do not send BTC to EVM or Solana addresses.',
  },
];
