'use client';

import React, { useState } from 'react';
import { Wallet, Copy, Check, ArrowUpRight, Zap } from 'lucide-react';
import { AgentStatus } from '@cspr-sentinel/shared';

interface WalletCardProps {
  publicKey: string;
  balanceCspr: number;
  totalSpentCspr: number;
  status: AgentStatus;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  publicKey,
  balanceCspr,
  totalSpentCspr,
  status,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedKey = publicKey
    ? `${publicKey.substring(0, 8)}...${publicKey.substring(publicKey.length - 6)}`
    : '01...';

  const isPaying = status === 'paying';

  return (
    <div
      className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${
        isPaying ? 'border-violet-500/60 shadow-2xl shadow-violet-500/20 animate-glow-pulse' : ''
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Agent Hot Wallet</h3>
            <p className="text-[11px] text-slate-400">Autonomous Signer Engine</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
        >
          <span>{truncatedKey}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Balance Display */}
      <div className="my-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Available Balance</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {balanceCspr.toFixed(3)}
          </span>
          <span className="text-sm font-bold text-violet-400">CSPR</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
        <div>
          <span className="text-[11px] text-slate-400 block">Total Lifetime Spent</span>
          <span className="text-sm font-bold text-slate-200 font-mono">
            {totalSpentCspr.toFixed(2)} CSPR
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block">Settlement Engine</span>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Real Testnet Tx
          </span>
        </div>
      </div>
    </div>
  );
};
