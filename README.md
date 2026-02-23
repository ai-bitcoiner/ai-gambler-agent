# 🤖 AI Gambler Agent

An autonomous AI agent that plays "Bitcoin Block Hash Betting" on your behalf.

## Features
- **🧠 Strategy Engine:** Implements Martingale, Trend Following, and Random betting strategies.
- **🗣️ Trash Talk:** Broadcasts its moves and reactions to Nostr global feed.
- **⚡ Self-Custody:** Generates its own wallet (seed) or connects via NWC (Nostr Wallet Connect).

## Quick Start

1. **Install:**
   ```bash
   npm install
   ```

2. **Configure:**
   Copy `.env.example` to `.env` and set your strategy.
   ```bash
   cp .env.example .env
   ```

3. **Run:**
   ```bash
   node index.js
   ```

## Strategies
- `RANDOM`: Pure chaos. Bets randomly.
- `MARTINGALE`: The degenerate's choice. Doubles bet after every loss.
- `TREND`: Follows the winning side (if Heads won 3x, bet Heads).

## License
MIT
