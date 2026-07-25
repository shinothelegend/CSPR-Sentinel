'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, Check } from 'lucide-react';
import { CONFIG } from '@cspr-sentinel/shared';

interface OnChainProofProps {
  contractHash?: string;
}

export const OnChainProof: React.FC<OnChainProofProps> = () => {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProofs() {
      try {
        const res = await fetch('http://localhost:3001/api/agent/proofs');
        const data = await res.json();
        if (data.success && data.proofs) {
          setProofs(data.proofs);
        }
      } catch (err) {
        console.warn('Could not fetch direct RPC proofs');
      } finally {
        setLoading(false);
      }
    }

    fetchProofs();
    const interval = setInterval(fetchProofs, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">On-Chain Smart Contract Proofs</h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
          Contract Dictionary Verified
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Receipts notarized on-chain in Casper smart contract dictionary storage (UrEF Dictionary key).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proofs.map((proof, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-200">{proof.service_id}</span>
                {/* SVG Checkmark Draw Animation Badge */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                  <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" className="animate-checkmark" />
                  </svg>
                  Verified On-Chain
                </div>
              </div>

              <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                <p>Hash: {proof.receipt_hash}</p>
                <p>Payer: {proof.payer ? `${proof.payer.substring(0, 10)}...` : 'Hot-Wallet'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-violet-300 block">
                {(Number(proof.amount) / CONFIG.MOTES_PER_CSPR).toFixed(1)} CSPR
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Index #{proof.index}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
