import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CSPR Sentinel | Autonomous Agentic Microservices on Casper',
  description: 'An autonomous AI agent that discovers, pays for, and verifies x402 gated services on Casper Network Testnet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="ambient-bg" />
        {children}
      </body>
    </html>
  );
}
