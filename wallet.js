const { webln } = require('alby-js-sdk'); // We might need to install this or implement raw NWC
const bip39 = require('bip39');
const { generateSecretKey, getPublicKey } = require('nostr-tools');
require('dotenv').config();
// Note: alby-js-sdk is a wrapper for NWC. I'll use a simpler raw NWC implementation if needed, 
// but for now let's assume we can zap via Nostr events (standard wallet interaction).

class Wallet {
  constructor() {
    this.nwcString = process.env.NWC_CONNECTION_STRING;
    this.seed = process.env.MNEMONIC;
    this.nostrSk = null;
    this.nostrPk = null;
  }

  async init() {
    // 1. Identity Setup (Nostr)
    if (process.env.NOSTR_SK) {
      this.nostrSk = process.env.NOSTR_SK; // Hex
    } else {
      this.nostrSk = generateSecretKey(); // Generate ephemeral if missing
      console.log("⚠️ No NOSTR_SK in .env, using ephemeral identity.");
    }
    this.nostrPk = getPublicKey(this.nostrSk);
    console.log(`🆔 Agent Pubkey: ${this.nostrPk}`);

    // 2. Wallet Setup
    if (this.nwcString) {
      console.log("🔗 NWC Connection String found. Connecting...");
      // In a full implementation, we'd connect via NWC here to check balance
      // For this MVP, we assume the user's NWC service handles the Zaps via the Relay
    } else if (!this.seed) {
      // Create new wallet
      this.seed = bip39.generateMnemonic();
      console.log("\n🆕 NEW WALLET CREATED (SAVE THIS):");
      console.log(`   "${this.seed}"`);
      console.log("   Add MNEMONIC=... to your .env to persist this wallet.\n");
    } else {
      console.log("🔑 Loaded Wallet from Mnemonic.");
    }
  }

  // Generate a Zap Request Event (to be signed and sent to the Game Agent)
  createZapRequest(amountSats, targetPubkey, comment = "") {
    // Basic Zap Request structure (NIP-57)
    const zapRequest = {
      kind: 9734,
      content: comment,
      tags: [
        ['p', targetPubkey],
        ['amount', (amountSats * 1000).toString()], // millisats
        ['relays', 'wss://relay.damus.io'],
      ],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: this.nostrPk
    };
    return zapRequest;
  }
}

module.exports = new Wallet();
