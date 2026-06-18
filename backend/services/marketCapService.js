const apiClient = require("../utils/apiClient");
const MarketCap = require("../models/MarketCap");

async function fetchMarketCap() {
  try {
    const globalRes = await apiClient.get(
      "https://api.coingecko.com/api/v3/global"
    );

    const total = globalRes.data.data.total_market_cap.usd;

    const coinsRes = await apiClient.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 10,
          page: 1,
        },
      }
    );

    const btc = coinsRes.data.find((c) => c.symbol === "btc");
    const eth = coinsRes.data.find((c) => c.symbol === "eth");

    const btcCap = btc?.market_cap || 0;
    const ethCap = eth?.market_cap || 0;

    const excludingBtc = total - btcCap;
    const altcoins = total - btcCap - ethCap;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await MarketCap.findOneAndUpdate(
      { date: today },
      { date: today, total, excludingBtc, altcoins },
      { upsert: true }
    );

    console.log("MarketCap Saved");
  } catch (error) {
    console.log(error.message);
  }
}

const { runBackfill } = require("./backfillService");

async function backfillMarketCap() {
  await runBackfill();
}

module.exports = { fetchMarketCap, backfillMarketCap };
