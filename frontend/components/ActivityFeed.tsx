'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentReceipt, CONFIG } from '@cspr-sentinel/shared';
import { ExternalLink, CheckCircle2, Loader2, ArrowRightLeft } from 'lucide-react';

interface ActivityFeedProps {
  history: PaymentReceipt[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ history }) => {
  return (
    <div className="glass-card p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-slate-200">Live Activity Feed</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{history.length} Transactions</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No payments settled yet. Agent is actively discovering services...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'confirmed' ? (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{item.serviceName}</h4>
                    <p className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString()} • {item.amountCspr} CSPR
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/60 border border-violet-500/30 text-violet-300">
                    x402
                  </span>

                  {item.txHash && !item.txHash.startsWith('pending') && (
                    <a
                      href={`${CONFIG.CASPER_EXPLORER_URL}/${item.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      title="View on Casper Testnet Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
