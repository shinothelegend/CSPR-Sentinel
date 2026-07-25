'use client';

import React from 'react';
import { AgentStatus } from '@cspr-sentinel/shared';
import { Shield, Sun, Moon, Cpu, CheckCircle2, AlertTriangle, PauseCircle } from 'lucide-react';

interface HeaderProps {
  status: AgentStatus;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ status, theme, onToggleTheme }) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'evaluating':
        return (
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-purple-300 bg-purple-950/80 border border-purple-500/30 rounded-full animate-pulse">
            <Cpu className="w-3.5 h-3.5 animate-spin" /> Evaluating Policy...
          </span>
        );
      case 'paying':
        return (
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/30 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping" /> Settling On-Chain...
          </span>
        );
      case 'settled':
        return (
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Payment Settled
          </span>
        );
      case 'blocked':
        return (
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-rose-300 bg-rose-950/80 border border-rose-500/30 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Blocked by Policy
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-400 bg-slate-800/80 border border-slate-700/50 rounded-full">
            <span className="w-2 h-2 bg-slate-500 rounded-full" /> Idle / Monitoring
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-white/10 bg-slate-950/70 py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-red-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">CSPR Sentinel</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-wider font-semibold uppercase bg-red-950/70 border border-red-500/30 text-red-400 rounded">
                Casper Testnet
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Autonomous Agentic Microservice Discovery & x402 Micropayments
            </p>
          </div>
        </div>

        {/* Right: Agent Status & Theme Toggle */}
        <div className="flex items-center gap-4">
          {getStatusBadge()}

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Dark/Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
