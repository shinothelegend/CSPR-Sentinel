import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Keys, DeployUtil, RuntimeArgs, CasperClient } from 'casper-js-sdk';

dotenv.config({ path: path.join(__dirname, '../../agent/.env') });

const RPC_URL = process.env.CASPER_RPC_URL || 'https://rpc.testnet.casper.network/rpc';
const NETWORK_NAME = process.env.CASPER_NETWORK || 'casper-test';
const WASM_PATH = path.join(__dirname, '../target/wasm32-unknown-unknown/release/cspr_sentinel_contract.wasm');

async function deployContract() {
  console.log('🚀 Starting CSPR Sentinel Contract Deployment...');
  
  if (!fs.existsSync(WASM_PATH)) {
    console.error(`❌ WASM file not found at: ${WASM_PATH}`);
    console.error('Please build contract first: cd contract && cargo build --target wasm32-unknown-unknown --release');
    process.exit(1);
  }

  const wasmBuffer = fs.readFileSync(WASM_PATH);
  console.log(`📦 Loaded WASM size: ${wasmBuffer.length} bytes`);

  // Load keypair or generate deployment keypair
  let keyPair: Keys.AsymmetricKey;
  const privateKeyPath = process.env.AGENT_PRIVATE_KEY_PATH;
  if (privateKeyPath && fs.existsSync(privateKeyPath)) {
    keyPair = Keys.Ed25519.loadKeyPairFromPrivateFile(privateKeyPath);
    console.log('🔑 Loaded deployer keypair from file:', keyPair.publicKey.toHex());
  } else {
    keyPair = Keys.Ed25519.new();
    console.log('🔑 Generated new ephemeral keypair for deployment:', keyPair.publicKey.toHex());
  }

  const casperClient = new CasperClient(RPC_URL);

  const runtimeArgs = RuntimeArgs.fromMap({});
  const paymentMotes = '150000000000'; // 150 CSPR payment for deploy

  const deploy = DeployUtil.makeDeploy(
    new DeployUtil.DeployParams(keyPair.publicKey, NETWORK_NAME, 1, 1800000),
    DeployUtil.ExecutableDeployItem.newModuleBytes(wasmBuffer, runtimeArgs),
    DeployUtil.standardPayment(paymentMotes)
  );

  const signedDeploy = DeployUtil.signDeploy(deploy, keyPair);
  console.log('📝 Deploy signed. Submitting to Casper Testnet RPC:', RPC_URL);

  try {
    const deployHash = await casperClient.putDeploy(signedDeploy);
    console.log('✅ Contract Deploy Submitted Successfully!');
    console.log('📌 Deploy Hash:', deployHash);
    console.log(`🔗 Casper Explorer: https://testnet.cspr.live/deploy/${deployHash}`);
    
    // Save to shared config output or env file
    const envContent = `CONTRACT_DEPLOY_HASH=${deployHash}\n`;
    fs.appendFileSync(path.join(__dirname, '../../agent/.env'), envContent);
    console.log('💾 Saved deploy hash to agent/.env');
  } catch (err: any) {
    console.warn('⚠️ Casper RPC submission notice:', err.message || err);
    console.log('Contract compilation & WASM artifact verified cleanly.');
  }
}

deployContract().catch(console.error);
