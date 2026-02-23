const { SimplePool, finalizeEvent } = require('nostr-tools');
const WebSocket = require('ws');
const axios = require('axios');
require('dotenv').config();
const wallet = require('./wallet');
const brain = require('./brain');

const RELAYS = ['wss://relay.damus.io', 'wss://relay.primal.net'];
const APP_TAG = 'bitcoin-block-bet-v1';
const HOUSE_LUD16 = process.env.HOUSE_LUD16 || 'waterheartwarming611802@getalby.com'; 

const pool = new SimplePool();

async function start() {
  console.log("🤖 Gambler Agent (Real Money) Starting...");
  await wallet.init();

  const ws = new WebSocket('wss://mempool.space/api/v1/ws');
  ws.on('open', () => {
    console.log("✅ Connected to Mempool.space");
    ws.send(JSON.stringify({ action: 'want', data: ['blocks'] }));
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.block) handleBlock(msg.block);
    } catch (e) {}
  });

  placeBet();
}

async function handleBlock(block) {
  const lastChar = block.id.slice(-1);
  const val = parseInt(lastChar, 16);
  const winner = val % 2 === 0 ? 'TAILS' : 'HEADS';
  console.log(`🧱 Block ${block.height}: ${winner}`);
  
  // Decide next move
  setTimeout(placeBet, 8000); 
}

async function placeBet() {
  const decision = brain.decide([]); 
  console.log(`🎲 DECISION: ${decision.side} (${decision.amount} sats)`);

  // 1. Get Invoice from House (Zap Request)
  try {
    const [name, domain] = HOUSE_LUD16.split('@');
    const lnurlRes = await axios.get(`https://${domain}/.well-known/lnurlp/${name}`);
    
    // Create Zap Request Event (Kind 9734) - Required for Zaps
    const zapRequestEvent = {
      kind: 9734,
      content: decision.side, // "HEADS" or "TAILS"
      tags: [
        ['p', lnurlRes.data.metadata.find(t => t[0] === 'p')?.[1] || ''],
        ['relays', RELAYS[0]],
        ['amount', (decision.amount * 1000).toString()],
        ['lnurl', lnurlRes.data.callback]
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: wallet.nostrPk
    };
    const signedZapReq = finalizeEvent(zapRequestEvent, wallet.nostrSk);
    const zapString = JSON.stringify(signedZapReq); // Some LNURLs want serialized JSON

    // Fetch Invoice with Zap Request
    const invRes = await axios.get(`${lnurlRes.data.callback}?amount=${decision.amount * 1000}&nostr=${encodeURIComponent(zapString)}`);
    const invoice = invRes.data.pr;

    // 2. Pay via NWC
    await wallet.zap(decision.amount, invoice);
    console.log("🚀 Bet Placed Successfully!");

  } catch (e) {
    console.error("Betting Failed:", e.message);
  }
}

start();
