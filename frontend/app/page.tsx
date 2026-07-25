'use client';

import React, { useEffect, useState } from 'react';
import { AgentState, CONFIG } from '@cspr-sentinel/shared';
import { Header } from '@/components/Header';
import { WalletCard } from '@/components/WalletCard';
import { PaymentFlow } from '@/components/PaymentFlow';
import { BudgetPanel } from '@/components/BudgetPanel';
import { ServicesGrid } from '@/components/ServicesGrid';
import { ActivityFeed } from '@/components/ActivityFeed';
import { OnChainProof } from '@/components/OnChainProof';
import { ChainMonitor } from '@/components/ChainMonitor';

export default function DashboardPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'idle',
    publicKey: '',
    balanceCspr: 100.0,
    totalSpentCspr: 0.0,
    hourlySpentCspr: 0.0,
    policy: CONFIG.DEFAULT_BUDGET_POLICY,
    history: [],
  });

  // Toggle theme class on html element
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  // Connect to Agent WebSocket Stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let timer: any = null;

    function connect() {
      ws = new WebSocket('ws://localhost:3001');

      ws.onopen = () => {
        console.log('connected to agent stream');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'agent_state' && payload.data) {
            setAgentState(payload.data);
          } else if (payload.event === 'payment_settled' && payload.data) {
            fetchStateFallback();
          }
        } catch (err) {
          console.warn('WS parse error', err);
        }
      };

      ws.onclose = () => {
        timer = setTimeout(connect, 3000);
      };
    }

    async function fetchStateFallback() {
      try {
        const res = await fetch('http://localhost:3001/api/agent/state');
        if (res.ok) {
          const data = await res.json();
          setAgentState(data);
        }
      } catch {
        // agent might be starting up
      }
    }

    connect();
    fetchStateFallback();

    return () => {
      if (ws) ws.close();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleUpdatePolicy = async (newPolicy: Partial<any>) => {
    try {
      const res = await fetch('http://localhost:3001/api/agent/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy),
      });
      if (res.ok) {
        const data = await res.json();
        setAgentState((prev) => ({ ...prev, policy: data.policy }));
      }
    } catch (err) {
      console.error('Failed to update policy', err);
    }
  };

  const handleTriggerService = async (serviceId: string) => {
    try {
      await fetch('http://localhost:3001/api/agent/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
    } catch (err) {
      console.error('Failed to trigger service', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <Header status={agentState.status} theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-6 space-y-6">
        {/* Top Section: Wallet, Payment Flow Diagram, Budget Sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WalletCard
            publicKey={agentState.publicKey}
            balanceCspr={agentState.balanceCspr}
            totalSpentCspr={agentState.totalSpentCspr}
            status={agentState.status}
          />

          <PaymentFlow status={agentState.status} activeServiceId={agentState.activeServiceId} />

          <BudgetPanel
            policy={agentState.policy}
            hourlySpentCspr={agentState.hourlySpentCspr}
            onUpdatePolicy={handleUpdatePolicy}
          />
        </div>

        {/* Casper Live Chain Monitor Panel */}
        <ChainMonitor />

        {/* Middle Section: Services Grid */}
        <ServicesGrid
          history={agentState.history}
          onTriggerService={handleTriggerService}
        />

        {/* Bottom Section: Activity Feed & Smart Contract On-Chain Proof */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed history={agentState.history} />
          <OnChainProof />
        </div>
      </main>
    </div>
  );
}
