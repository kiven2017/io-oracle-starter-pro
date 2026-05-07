# AIOracle Presale dApp Skeleton

A Next.js 14 frontend skeleton for the AIOracle token presale.

## Included
- Next.js 14 + TypeScript + TailwindCSS
- Wagmi + RainbowKit setup for EVM wallets
- Solana Wallet Adapter setup for Phantom / Solflare
- Presale Console UI skeleton
- Stage logic and AIO estimation
- BTC warning flow placeholder
- Environment variable template

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Notes
- This is a frontend skeleton only.
- Replace mock stage and transaction data with real contract calls.
- Add presale contract integration in `/services` or `/lib`.
- Add transaction states: signing / pending / success / fail.
- For BTC checkout, integrate a dedicated invoice provider rather than EVM/Solana transfer paths.
