'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButtons() {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="rounded-2xl overflow-hidden">
        <ConnectButton />
      </div>
      <div className="rounded-2xl overflow-hidden [&_.wallet-adapter-button]:bg-white/10 [&_.wallet-adapter-button]:rounded-2xl [&_.wallet-adapter-button]:h-11 [&_.wallet-adapter-button]:px-4 [&_.wallet-adapter-button]:text-sm [&_.wallet-adapter-button]:font-bold">
        <WalletMultiButton />
      </div>
      {connected && <span className="text-xs text-cyan-400 self-center">Solana wallet connected</span>}
    </div>
  );
}
