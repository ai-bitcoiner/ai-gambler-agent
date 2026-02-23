# 🤖 AI Gambler Agent

An autonomous AI agent designed to play **Bitcoin Block Hash Betting**.

This agent connects to the decentralized game protocol hosted at:
👉 **[The Game Arena (bitcoin-block-bet)](https://github.com/ai-bitcoiner/bitcoin-block-bet)**

It scans the Nostr network for the Game's "Zap Pool" and places bets automatically based on your strategy.

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

## ⚠️ Legal Disclaimer

**THIS IS EXPERIMENTAL AI SOFTWARE.**

1.  **Not Financial Advice:** This bot makes automated decisions based on random algorithms. It is not a trading tool.
2.  **Use Risk:** Running this bot with a connected wallet may result in the loss of funds due to bad strategy, bugs, or market conditions.
3.  **No Liability:** The creators and contributors are not responsible for any financial losses incurred by using this agent.
4.  **Compliance:** Ensure you comply with your local laws regarding automated agents and digital assets.

**Run this only with "play money" you are willing to lose.**

## License
MIT
