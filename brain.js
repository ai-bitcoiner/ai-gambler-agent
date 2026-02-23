class Brain {
  constructor() {
    this.strategy = process.env.STRATEGY || 'RANDOM'; // RANDOM, MARTINGALE, TREND
    this.lastResult = null; // 'WIN' or 'LOSS'
    this.currentBetSize = parseInt(process.env.BASE_BET) || 100;
    this.baseBet = this.currentBetSize;
    this.maxBet = parseInt(process.env.MAX_BET) || 1000;
  }

  decide(history) {
    console.log(`🧠 Thinking... (Strategy: ${this.strategy})`);

    // 1. Determine Amount
    if (this.strategy === 'MARTINGALE') {
      if (this.lastResult === 'LOSS') {
        this.currentBetSize *= 2;
        if (this.currentBetSize > this.maxBet) {
          console.log("⚠️ Max bet limit hit. Resetting to base.");
          this.currentBetSize = this.baseBet;
        }
      } else {
        this.currentBetSize = this.baseBet;
      }
    }

    // 2. Determine Side (HEADS/TAILS)
    let side = 'HEADS';
    
    if (this.strategy === 'RANDOM' || this.strategy === 'MARTINGALE') {
      side = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
    } else if (this.strategy === 'TREND') {
      // Logic: If last 3 were HEADS, bet HEADS
      const last3 = history.slice(0, 3).map(h => h.winner);
      const headsCount = last3.filter(w => w === 'HEADS').length;
      side = headsCount >= 2 ? 'HEADS' : 'TAILS';
    }

    return {
      side,
      amount: this.currentBetSize,
      thought: `I am betting ${this.currentBetSize} on ${side} because ${this.getReason(side)}`
    };
  }

  getReason(side) {
    if (this.strategy === 'RANDOM') return "the voices told me to.";
    if (this.strategy === 'MARTINGALE') return "I need to win back my losses!";
    if (this.strategy === 'TREND') return "the trend is my friend.";
    return "I felt like it.";
  }

  recordResult(win) {
    this.lastResult = win ? 'WIN' : 'LOSS';
    console.log(`📝 Result recorded: ${this.lastResult}`);
  }
}

module.exports = new Brain();
