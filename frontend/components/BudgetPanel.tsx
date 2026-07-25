'use client';

import React from 'react';
import { BudgetPolicy } from '@cspr-sentinel/shared';
import { Sliders, PauseCircle, PlayCircle, ShieldAlert } from 'lucide-react';

interface BudgetPanelProps {
  policy: BudgetPolicy;
  hourlySpentCspr: number;
  onUpdatePolicy: (newPolicy: Partial<BudgetPolicy>) => void;
}

export const BudgetPanel: React.FC<BudgetPanelProps> = ({
  policy,
  hourlySpentCspr,
  onUpdatePolicy,
}) => {
  const cap = policy.maxSpendPerHourCspr || 5.0;
  const pct = Math.min(100, Math.max(0, (hourlySpentCspr / cap) * 100));

  return (
    <div className="glass-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-slate-200">Budget & Policy Controls</h3>
          </div>

          <button
            onClick={() => onUpdatePolicy({ paused: !policy.paused })}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              policy.paused
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {policy.paused ? (
              <>
                <PlayCircle className="w-3.5 h-3.5" /> Resume Agent
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5" /> Pause Payments
              </>
            )}
          </button>
        </div>

        {/* Live Spend vs Hourly Cap Progress Bar */}
        <div className="mb-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400">Hourly Budget Utilization</span>
            <span className="font-mono font-bold text-slate-200">
              {hourlySpentCspr.toFixed(2)} / {cap.toFixed(2)} CSPR
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                pct > 90
                  ? 'bg-rose-500'
                  : pct > 60
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-violet-500 to-indigo-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Slider 1: Max Price per Call */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label className="text-slate-300 font-medium">Max Price Per Request</label>
              <span className="font-mono font-bold text-violet-400">
                {policy.maxPricePerRequestCspr.toFixed(2)} CSPR
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.5"
              step="0.05"
              value={policy.maxPricePerRequestCspr}
              onChange={(e) => onUpdatePolicy({ maxPricePerRequestCspr: parseFloat(e.target.value) })}
              className="w-full accent-violet-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
            <span className="text-[10px] text-slate-500 block mt-1">
              Requests exceeding this limit trigger an HTTP 402 rejection policy block.
            </span>
          </div>

          {/* Slider 2: Max Spend per Hour */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <label className="text-slate-300 font-medium">Hourly Spend Limit</label>
              <span className="font-mono font-bold text-violet-400">
                {policy.maxSpendPerHourCspr.toFixed(2)} CSPR
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="15.0"
              step="0.5"
              value={policy.maxSpendPerHourCspr}
              onChange={(e) => onUpdatePolicy({ maxSpendPerHourCspr: parseFloat(e.target.value) })}
              className="w-full accent-violet-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>Boundaries enforced locally by keypair policy engine before signing.</span>
      </div>
    </div>
  );
};
