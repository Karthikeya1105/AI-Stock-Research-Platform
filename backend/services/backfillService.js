const apiClient = require("../utils/apiClient");
const Dominance = require("../models/Dominance");
const MarketCap = require("../models/MarketCap");

let isBackfilling = false;

const TOP_COINS = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "tether", symbol: "USDT" },
  { id: "binancecoin", symbol: "BNB" },
  { id: "ripple", symbol: "XRP" },
  { id: "usd-coin", symbol: "USDC" },
  { id: "solana", symbol: "SOL" },
  { id: "tron", symbol: "TRX" },
  { id: "dogecoin", symbol: "DOGE" },
  { id: "hyperliquid", symbol: "HYPE" }
];

async function runBackfill() {
  if (isBackfilling) {
    console.log("Backfill already in progress...");
    return;
  }

  try {
    const mcCount = await MarketCap.countDocuments();
    const domCount = await Dominance.countDocuments();

    if (mcCount > 10 && domCount > 10) {
      return;
    }

    isBackfilling = true;
    console.log("Unified historical backfill starting...");

    const allCoinHistory = {};

    for (const coin of TOP_COINS) {
      console.log(`Fetching history for ${coin.id}...`);
      const history = await apiClient.get(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`,
        {
          params: {
            vs_currency: "usd",
            days: 365,
            interval: "daily"
          }
        }
      );

      allCoinHistory[coin.symbol] = history.data.market_caps;

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const dates = {};

    Object.entries(allCoinHistory).forEach(([symbol, history]) => {
      history.forEach(([timestamp, cap]) => {
        const date = new Date(timestamp).toISOString().split("T")[0];
        if (!dates[date]) {
          dates[date] = {};
        }
        dates[date][symbol] = cap;
      });
    });

    const dominanceOps = [];
    const marketCapOps = [];

    Object.keys(dates).forEach((dateStr) => {
      const marketCaps = dates[dateStr];

      const total10 = Object.values(marketCaps).reduce((sum, value) => sum + value, 0);

      const total = total10 / 0.82;

      const btcCap = marketCaps["BTC"] || 0;
      const ethCap = marketCaps["ETH"] || 0;

      const date = new Date(dateStr);

      marketCapOps.push({
        updateOne: {
          filter: { date },
          update: {
            date,
            total,
            excludingBtc: total - btcCap,
            altcoins: total - btcCap - ethCap,
          },
          upsert: true,
        },
      });

      const dominance = {};
      let tracked = 0;

      Object.entries(marketCaps).forEach(([symbol, cap]) => {
        const percent = Number(((cap / total) * 100).toFixed(2));
        dominance[symbol] = percent;
        tracked += percent;
      });

      dominance["OTHERS"] = Number((100 - tracked).toFixed(2));

      dominanceOps.push({
        updateOne: {
          filter: { date },
          update: { date, dominance },
          upsert: true,
        },
      });
    });

    if (marketCapOps.length > 0) {
      console.log(`Writing ${marketCapOps.length} market cap records...`);
      await MarketCap.bulkWrite(marketCapOps);
    }

    if (dominanceOps.length > 0) {
      console.log(`Writing ${dominanceOps.length} dominance records...`);
      await Dominance.bulkWrite(dominanceOps);
    }

    console.log("Unified historical backfill complete!");
  } catch (error) {
    console.error("Error running unified backfill:", error.message);
  } finally {
    isBackfilling = false;
  }
}

module.exports = { runBackfill };
