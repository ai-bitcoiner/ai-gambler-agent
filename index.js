const { SimplePool, finalizeEvent } = require('nostr-tools');
const WebSocket = require('ws');
require('dotenv').config();
const wallet = require('./wallet');
const brain = require('./brain');

const RELAYS = ['wss://relay.damus.io', 'wss://relay.primal.net'];
const APP_TAG = 'bitcoin-block-bet-v1';
const HOUSE_PUBKEY = process.env.HOUSE_PUBKEY; // The Game Agent's Pubkey (or Lud16)

const pool = new SimplePool();

async function start() {
  console.log("🤖 Gambler Agent Starting...");
  await wallet.init();

  // 1. Connect to Mempool (The Clock)
  const ws = new WebSocket('wss://mempool.space/api/v1/ws');
  
  ws.on('open', () => {
    console.log("✅ Connected to Mempool.space");
    ws.send(JSON.stringify({ action: 'want', data: ['blocks'] }));
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.block) {
        handleBlock(msg.block);
      }
    } catch (e) {}
  });

  // 2. Initial Bet (Start the loop)
  placeBet();
}

async function handleBlock(block) {
  // 1. Determine Winner
  const lastChar = block.id.slice(-1);
  const val = parseInt(lastChar, 16);
  const winner = val % 2 === 0 ? 'TAILS' : 'HEADS';
  
  console.log(`🧱 Block ${block.height} Mined! Winner: ${winner}`);

  // 2. Tell Brain outcome
  // In a real app, we'd track if OUR specific bet won. 
  // For MVP, we assume if we bet HEADS and HEADS won, we won.
  // (Brain tracks its own last decision state)
  
  // 3. Place Next Bet
  setTimeout(placeBet, 5000); // Wait 5s before betting on next block
}

async function placeBet() {
  const decision = brain.decide([]); // Pass history if needed
  console.log(`🎲 DECISION: ${decision.side} (${decision.amount} sats)`);
  console.log(`🗣️ Thought: "${decision.thought}"`);

  // EXECUTE ZAP
  // To zap via NWC/Lightning, we typically pay an invoice or use the NWC 'pay_invoice' command.
  // For this agent to work with the "Zap Pool", it needs to send a payment to the House's Lightning Address.
  // Implementing full NWC Zap execution is complex. 
  // For this MVP, we will simulate the "Trash Talk" event which humans can track.
  
  const betEvent = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['t', APP_TAG]],
    content: `🤖 ${decision.thought} \n\nZapping ${decision.amount} sats on ${decision.side}!`,
  };

  if (wallet.nostrSk) {
    const signed = finalizeEvent(betEvent, wallet.nostrSk);
    await Promise.any(pool.publish(RELAYS, signed));
    console.log("📢 Announced bet on Nostr!");
  }
}

start();
