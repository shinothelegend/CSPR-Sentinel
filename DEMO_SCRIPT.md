# CSPR Sentinel — 2–3 Minute Submission Video Script

> **Project Name**: CSPR Sentinel — Autonomous AI Agent discovering, paying for, and verifying microservices on Casper Network via x402
> **Track**: Casper Agentic Buildathon 2026

---

## 🎬 Shot-by-Shot Walkthrough Script

### Scene 1: Introduction & Problem Statement (0:00 - 0:30)
- **Visual**: Full screen capture of the CSPR Sentinel Financial Terminal Dashboard (Dark Mode).
- **Voiceover**: 
  > *"Welcome to CSPR Sentinel — an autonomous AI agent built natively for the Casper Network Testnet. 
  > Current AI agents are limited to passive chatbot wrappers. CSPR Sentinel changes that by giving AI agents full financial autonomy. 
  > The agent holds its own Casper Ed25519 keypair, monitors paid microservices, evaluates custom budget policies, settles micropayments on-chain via the x402 protocol in CSPR, and notarizes immutable receipts directly into a custom Rust smart contract."*

---

### Scene 2: Autonomous Discovery & x402 Challenge (0:30 - 1:10)
- **Visual**: Zoom in on the Header Agent Status pill (`Idle` -> `Evaluating...`) and the Services Grid. Click the **"Trigger x402 Flow"** button on the *Sentinel Weather Oracle* service card.
- **Voiceover**: 
  > *"Here, the agent initiates an unauthenticated HTTP request to the Weather Oracle endpoint. 
  > The service responds with an HTTP 402 Payment Required challenge detailing the required price in CSPR motes and merchant recipient key. 
  > Notice the status pill instantly morphing to 'Evaluating Policy'."*

---

### Scene 3: Policy Engine Boundaries & On-Chain Settlement (1:10 - 1:50)
- **Visual**: Highlight the **Budget & Policy Panel** sliders, then watch the **Payment Flow Diagram**. An animated particle travels along the curved SVG path from the Agent Node to the Service Node.
- **Voiceover**: 
  > *"Before signing any transaction, the agent checks its local Policy Engine. It verifies that 0.1 CSPR is within the maximum single request limit (0.5 CSPR) and hourly spend cap. 
  > Once approved, the agent constructs and signs a real Casper testnet deploy, transfers CSPR to the service recipient, and invokes the `log_payment` entrypoint on our deployed Rust smart contract."*

---

### Scene 4: On-Chain Verification & Live Content Delivery (1:50 - 2:30)
- **Visual**: Watch the **Activity Feed** slide in the new transaction with a green checkmark. Show the **On-Chain Proof Panel** displaying the verified badge with checkmark draw animation, then click the **External Link icon** opening `testnet.cspr.live/deploy/<hash>`.
- **Voiceover**: 
  > *"With payment confirmed and notarized in the smart contract dictionary, the agent resubmits the x402 payment proof header. The service returns HTTP 200 OK with the full live data payload! 
  > You can see the transaction hash directly on the public Casper Testnet Explorer, proving 100% on-chain settlement."*

---

### Scene 5: Budget Boundary Demonstration & Conclusion (2:30 - 3:00)
- **Visual**: Drag the "Max Price Per Request" slider down below 0.1 CSPR (e.g. to 0.05 CSPR), then trigger the service again. The status pill turns red with `Blocked by Policy`.
- **Voiceover**: 
  > *"Finally, we demonstrate strict boundary enforcement. Lowering our budget threshold causes the policy engine to instantly block payments exceeding our limit. 
  > CSPR Sentinel fulfills every requirement of the Casper Agentic Buildathon — real keypairs, autonomous payments, x402 protocol, and on-chain Rust smart contract receipts. Thank you!"*
