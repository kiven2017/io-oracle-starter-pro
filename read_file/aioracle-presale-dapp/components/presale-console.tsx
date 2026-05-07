'use client';

import { useMemo, useState } from 'react';
import { PRESALE_CONFIG } from '@/config/presale';
import { NETWORKS } from '@/config/networks';
import { TOKENS } from '@/config/tokens';
import { usePresaleCalculator } from '@/hooks/usePresaleCalculator';
import { ShieldAlert, Wallet } from 'lucide-react';

export function PresaleConsole() {
  const [network, setNetwork] = useState('bsc');
  const [token, setToken] = useState<'USDT' | 'USDC' | 'ETH' | 'SOL' | 'BTC'>('USDT');
  const [amount, setAmount] = useState<number>(0);
  const { estimatedAio, price, nextPrice, isBelowMinimum } = usePresaleCalculator(amount);

  const availableTokens = useMemo(
    () => TOKENS.filter((t) => t.networks.includes(network)),
    [network],
  );

  const currentToken = TOKENS.find((t) => t.symbol === token);

  return (
    <div className="glass shadow-cyan rounded-[2rem] border border-white/5 p-6 md:p-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Stage" value={`${PRESALE_CONFIG.currentStage} / ${PRESALE_CONFIG.stages}`} accent />
        <StatCard label="Price" value={`$${price.toFixed(4)}`} />
        <StatCard label="Next" value={`$${nextPrice.toFixed(4)}`} />
        <StatCard label="Default" value="BSC · USDT" />
      </div>

      <div className="mt-8 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-heading text-3xl font-black uppercase tracking-tight text-white">Presale Active</h3>
            <p className="mt-1 text-sm text-slate-500">Transparent staged participation for early backers.</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Ends in</p>
            <p className="font-mono text-2xl font-black tracking-widest text-red-500">01:23:45</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-bold uppercase tracking-[0.2em]">
            <span className="text-slate-500">Allocation Sold</span>
            <span className="text-cyan-400">{PRESALE_CONFIG.soldPercent}%</span>
          </div>
          <div className="h-4 rounded-full border border-white/5 bg-white/5 p-1">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${PRESALE_CONFIG.soldPercent}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>{PRESALE_CONFIG.remainingAio.toLocaleString()} AIO Remaining</span>
            <span className="font-bold text-cyan-500">15 stages · +10% each</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Field label="Network">
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none"
            value={network}
            onChange={(e) => {
              const next = e.target.value;
              setNetwork(next);
              const firstToken = TOKENS.find((t) => t.networks.includes(next))?.symbol ?? 'USDT';
              setToken(firstToken as typeof token);
            }}
          >
            {NETWORKS.map((n) => (
              <option key={n.id} value={n.id}>{n.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Payment Token">
          <select
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-white outline-none"
            value={token}
            onChange={(e) => setToken(e.target.value as typeof token)}
          >
            {availableTokens.map((t) => (
              <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Amount">
          <div className="relative">
            <input
              type="number"
              min={0}
              placeholder="Minimum 100 USDT"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value || 0))}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-5 pr-24 text-2xl font-black text-white outline-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
              <span className="text-sm font-bold uppercase text-slate-400">{token}</span>
              <button
                type="button"
                onClick={() => setAmount(1000)}
                className="rounded-lg bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-400"
              >
                Max
              </button>
            </div>
          </div>
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <MiniCard label="Estimated Receive" value={`${estimatedAio.toLocaleString()} AIO`} />
        <MiniCard label="Minimum" value="100 USDT" accent />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <MiniCard label="Supported Chains" value="BSC / Ethereum / Solana" small />
        <MiniCard label="Supported Assets" value="USDT / USDC / BTC / ETH / SOL" small />
      </div>

      {currentToken?.warning ? (
        <div className="mt-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.2em] text-yellow-300">BTC Invoice Checkout</p>
          <p className="text-sm leading-relaxed text-slate-400">{currentToken.warning}</p>
        </div>
      ) : null}

      {isBelowMinimum ? (
        <p className="mt-4 text-sm font-semibold text-red-400">Minimum purchase is 100 USDT equivalent.</p>
      ) : null}

      <button className="mt-5 flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white py-5 text-xl font-black uppercase text-black transition hover:scale-[1.01] hover:bg-cyan-400">
        <Wallet className="h-6 w-6" />
        Connect Wallet
      </button>

      <div className="mt-5 rounded-3xl border border-red-500/10 bg-red-500/5 p-4 text-center text-[11px] font-bold uppercase tracking-tight text-red-300">
        <ShieldAlert className="mr-1 inline h-3 w-3 -mt-0.5" />
        Only trust AIOracle.link. Admins never DM first.
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <MiniStatusCard
          title="Plan B Unlock"
          lines={['15% at TGE', '85% linear over 12 months']}
        />
        <MiniStatusCard
          title="Launch Checklist"
          checklist={[
            ['Audit', 'Running', 'running'],
            ['MVP Demo', 'Pending', 'pending'],
            ['Multisig', 'Pending', 'pending'],
          ]}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${accent ? 'border-cyan-500/10 bg-cyan-500/5' : 'border-white/5 bg-white/5'}`}>
      <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">{label}</p>
      <p className={`text-base font-black ${accent ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function MiniCard({ label, value, accent = false, small = false }: { label: string; value: string; accent?: boolean; small?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`${small ? 'text-sm' : 'text-xl'} font-black ${accent ? 'text-cyan-400' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function MiniStatusCard({
  title,
  lines,
  checklist,
}: {
  title: string;
  lines?: string[];
  checklist?: [string, string, 'running' | 'pending' | 'done'][];
}) {
  return (
    <div className="glass rounded-[2rem] p-5">
      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">{title}</p>
      {lines ? (
        <div className="space-y-1 text-xs font-bold text-slate-300">
          {lines.map((line) => <p key={line}>{line}</p>)}
        </div>
      ) : null}
      {checklist ? (
        <div className="space-y-2">
          {checklist.map(([name, status, kind]) => (
            <div key={name} className="flex items-center justify-between text-[10px] font-bold uppercase">
              <span className="text-slate-500 flex items-center gap-2">
                <span className={`inline-block h-2 w-2 rounded-full ${kind === 'running' ? 'bg-cyan-400' : kind === 'done' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                {name}
              </span>
              <span className={kind === 'running' ? 'text-cyan-400' : kind === 'done' ? 'text-emerald-400' : 'text-slate-600'}>{status}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
