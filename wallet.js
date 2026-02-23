const { generateSecretKey, getPublicKey, finalizeEvent, nip04 } = require('nostr-tools');
const WebSocket = require('ws');
require('dotenv').config();

class Wallet {
  constructor() {
    this.nwcString = process.env.NWC_CONNECTION_STRING;
    this.nostrSk = process.env.NOSTR_SK || generateSecretKey();
    this.nostrPk = getPublicKey(this.nostrSk);
    this.nwcRelay = null;
    this.nwcPubkey = null;
    this.nwcSecret = null; // if needed
  }

  async init() {
    console.log(`🆔 Agent Pubkey: ${this.nostrPk}`);
    if (this.nwcString) {
      console.log("🔗 Connecting via NWC...");
      const url = new URL(this.nwcString);
      this.nwcPubkey = url.host;
      this.nwcRelay = url.searchParams.get('relay');
      const secret = url.searchParams.get('secret');
      // In NWC, we sign commands with the 'secret' (which acts as the client private key authorized by the wallet)
      // If secret is present, we use that as our signing key for NWC commands.
      if (secret) this.nostrSk = secret; 
    } else {
      console.log("⚠️ No NWC String. Running in Simulation Mode.");
    }
  }

  async zap(amountSats, targetInvoice) {
    if (!this.nwcString) {
      console.log(`(SIMULATED) Zapped ${amountSats} sats`);
      return;
    }

    console.log(`⚡ Zapping ${amountSats} sats via NWC...`);
    
    // NWC 'pay_invoice' command (Kind 23194)
    const command = {
      method: "pay_invoice",
      params: { invoice: targetInvoice }
    };

    const event = {
      kind: 23194,
      content: await nip04.encrypt(this.nostrSk, this.nwcPubkey, JSON.stringify(command)),
      tags: [['p', this.nwcPubkey]],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: getPublicKey(this.nostrSk)
    };

    const signed = finalizeEvent(event, this.nostrSk);
    
    // Publish to Wallet Service Relay
    const ws = new WebSocket(this.nwcRelay);
    return new Promise((resolve) => {
      ws.on('open', () => {
        ws.send(JSON.stringify(["EVENT", signed]));
        console.log("   -> Zap Command Sent!");
        setTimeout(() => { ws.close(); resolve(true); }, 2000);
      });
    });
  }
}

module.exports = new Wallet();
