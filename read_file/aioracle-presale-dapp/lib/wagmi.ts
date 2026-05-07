'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { bsc, mainnet } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

export const wagmiConfig = getDefaultConfig({
  appName: 'AIOracle Presale',
  projectId,
  chains: [bsc, mainnet],
  ssr: true,
});
