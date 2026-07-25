import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { SentinelAgent } from './agent';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

const agent = new SentinelAgent();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Broadcast state to all connected UI clients
function broadcast(event: string, data: any) {
  const message = JSON.stringify({ event, data });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Wire agent events to WebSocket broadcast
agent.on('state_update', (state) => broadcast('agent_state', state));
agent.on('payment_started', (receipt) => broadcast('payment_started', receipt));
agent.on('payment_settled', (receipt) => broadcast('payment_settled', receipt));
agent.on('policy_blocked', (data) => broadcast('policy_blocked', data));

wss.on('connection', async (ws) => {
  console.log('📡 UI Client Connected to Agent Stream');
  const currentState = await agent.getState();
  ws.send(JSON.stringify({ event: 'agent_state', data: currentState }));
});

// REST Endpoints
app.get('/api/agent/state', async (req, res) => {
  const state = await agent.getState();
  res.json(state);
});

app.post('/api/agent/policy', (req, res) => {
  const updatedPolicy = agent.updatePolicy(req.body);
  res.json({ success: true, policy: updatedPolicy });
});

app.post('/api/agent/trigger', async (req, res) => {
  const { serviceId } = req.body;
  console.log(`⚡ Manual trigger requested for service: ${serviceId || 'random'}`);
  agent.executeDiscoveryStep(serviceId);
  res.json({ success: true, message: 'Discovery step triggered' });
});

app.get('/api/agent/proofs', async (req, res) => {
  const proofs = await agent.getOnChainProofRecords();
  res.json({ success: true, proofs });
});

// Cache variables for mock block generation
let cachedBlockHeight = 3128452;
let cachedPeers = 42;

app.get('/api/chain/status', async (req, res) => {
  try {
    // Try querying active Casper Testnet RPC node
    const axios = require('axios');
    const rpcRes = await axios.post(
      process.env.CASPER_RPC_URL || 'https://node-clarity-testnet.make.services/rpc',
      {
        jsonrpc: '2.0',
        method: 'info_get_status',
        id: 1,
      },
      { timeout: 2000 }
    );

    const result = rpcRes.data.result;
    res.json({
      success: true,
      status: {
        blockHeight: result.last_added_block_info.height,
        blockTime: 'Just now',
        peersCount: result.peers.length,
        apiVersion: result.api_version,
        networkName: 'casper-test',
        avgGasPriceGwei: 1.5,
        status: 'connected',
        nodeAddress: process.env.CASPER_RPC_URL || 'https://rpc.testnet.casper.network/rpc',
      },
    });
  } catch (err) {
    // Graceful offline fallback simulation
    cachedBlockHeight += 1;
    cachedPeers = 36 + Math.floor(Math.random() * 8);
    res.json({
      success: true,
      status: {
        blockHeight: cachedBlockHeight,
        blockTime: 'Just now',
        peersCount: cachedPeers,
        apiVersion: '1.5.6',
        networkName: 'casper-test',
        avgGasPriceGwei: 1.45,
        status: 'offline', // Displays offline status clearly while keeping the numbers alive
        nodeAddress: process.env.CASPER_RPC_URL || 'https://rpc.testnet.casper.network/rpc',
      },
    });
  }
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🛡️ CSPR Sentinel Autonomous Agent Service Online`);
  console.log(`🌐 REST API: http://localhost:${PORT}`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`==================================================\n`);

  // Start autonomous monitoring loop
  agent.startAutonomousLoop(12000);
});
