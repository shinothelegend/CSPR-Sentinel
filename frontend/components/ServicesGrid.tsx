'use client';

import React from 'react';
import { CONFIG, ServiceDefinition, PaymentReceipt } from '@cspr-sentinel/shared';
import { CloudSun, TrendingUp, Cpu, Database, Play, CheckCircle2 } from 'lucide-react';

interface ServicesGridProps {
  history: PaymentReceipt[];
  onTriggerService: (serviceId: string) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ history, onTriggerService }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-violet-400" />;
      case 'Database':
        return <Database className="w-5 h-5 text-sky-400" />;
      default:
        return <Cpu className="w-5 h-5 text-slate-400" />;
    }
  };

  const getLastResponse = (serviceId: string) => {
    const receipt = history.find((h) => h.serviceId === serviceId && h.responsePayload);
    return receipt ? receipt.responsePayload : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Discovered Paid Microservices</h3>
          <p className="text-xs text-slate-400">gated behind x402 Payment Required challenge</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONFIG.MOCK_SERVICES.map((svc) => {
          const lastResp = getLastResponse(svc.id);

          return (
            <div
              key={svc.id}
              className="glass-card p-5 flex flex-col justify-between hover:border-violet-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {getIcon(svc.iconName)}
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/30 text-violet-300">
                    {svc.priceCspr} CSPR
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-100">{svc.name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{svc.description}</p>

                {/* Last Returned Payload Display */}
                <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-[11px]">
                  {lastResp ? (
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid & Delivered
                      </div>
                      <pre className="text-slate-300 overflow-x-auto text-[10px] whitespace-pre-wrap">
                        {JSON.stringify(lastResp.data || lastResp, null, 1)}
                      </pre>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">No request executed yet</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => onTriggerService(svc.id)}
                className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-200 hover:text-white hover:bg-violet-600 hover:border-violet-500 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5" /> Trigger x402 Flow
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
