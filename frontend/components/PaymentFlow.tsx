'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AgentStatus } from '@cspr-sentinel/shared';
import { Bot, Server, ShieldCheck, ArrowRight } from 'lucide-react';

interface PaymentFlowProps {
  status: AgentStatus;
  activeServiceId?: string;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({ status, activeServiceId }) => {
  const isPaying = status === 'paying' || status === 'evaluating';
  const isSettled = status === 'settled';

  return (
    <div className="glass-card p-6 flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Payment Flow Visualization</h3>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          x402 Protocol
        </span>
      </div>

      <div className="relative flex-1 flex items-center justify-between py-6 px-4">
        {/* SVG Curved Flow Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <path
            d="M 80 80 Q 200 20 320 80"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* Animated dot traveling along curved path during payment */}
          {isPaying && (
            <motion.circle
              r="6"
              fill="#8b5cf6"
              initial={{ offsetDistance: '0%' }}
              animate={{ offsetDistance: '100%' }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ offsetPath: `path('M 80 80 Q 200 20 320 80')` }}
            />
          )}

          {/* Return data flow when settled */}
          {isSettled && (
            <motion.circle
              r="6"
              fill="#10b981"
              initial={{ offsetDistance: '100%' }}
              animate={{ offsetDistance: '0%' }}
              transition={{ duration: 1.2, repeat: 1, ease: 'easeOut' }}
              style={{ offsetPath: `path('M 80 80 Q 200 20 320 80')` }}
            />
          )}
        </svg>

        {/* Node 1: Agent */}
        <div className="z-10 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
              isPaying
                ? 'bg-violet-600/20 border-violet-500 shadow-xl shadow-violet-500/30 scale-105'
                : 'bg-slate-900/80 border-slate-700/80'
            }`}
          >
            <Bot className={`w-8 h-8 ${isPaying ? 'text-violet-400 animate-bounce' : 'text-slate-300'}`} />
          </div>
          <span className="text-xs font-semibold mt-2 text-slate-200">CSPR Sentinel</span>
          <span className="text-[10px] text-slate-400">Autonomous Hot-Wallet</span>
        </div>

        {/* Middle Status Indicator */}
        <div className="z-10 flex flex-col items-center">
          <div className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-[11px] font-mono font-semibold text-slate-300 flex items-center gap-1.5 shadow-lg">
            {isPaying ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-amber-300">HTTP 402 → Signing CSPR</span>
              </>
            ) : isSettled ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">200 OK (Paid)</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                <span>Monitoring</span>
              </>
            )}
          </div>
        </div>

        {/* Node 2: Service */}
        <div className="z-10 flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all ${
              isSettled
                ? 'bg-emerald-600/20 border-emerald-500 shadow-xl shadow-emerald-500/30'
                : 'bg-slate-900/80 border-slate-700/80'
            }`}
          >
            <Server className={`w-8 h-8 ${isSettled ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <span className="text-xs font-semibold mt-2 text-slate-200">
            {activeServiceId ? activeServiceId : 'x402 Service'}
          </span>
          <span className="text-[10px] text-slate-400">Gated Oracle / API</span>
        </div>
      </div>
    </div>
  );
};
