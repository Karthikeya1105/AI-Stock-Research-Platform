const apiClient = require("../utils/apiClient");
const Dominance = require("../models/Dominance");

async function fetchDominance() {

  try {

    const globalRes =
      await apiClient.get(
        "https://api.coingecko.com/api/v3/global"
      );

    const totalCap =
      globalRes.data.data
        .total_market_cap.usd;

    const coinsRes =
      await apiClient.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            order: "market_cap_desc",
            per_page: 100,
            page: 1
          }
        }
      );

    const dominance = {};

    let tracked = 0;

    coinsRes.data.forEach(coin => {

      const percent =
        Number(
          (
            coin.market_cap /
            totalCap *
            100
          ).toFixed(2)
        );

      dominance[
        coin.symbol.toUpperCase()
      ] = percent;

      tracked += percent;

    });

    dominance.OTHERS =
      Number(
        (
          100 - tracked
        ).toFixed(2)
      );

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    await Dominance.findOneAndUpdate(
      { date: today },
      {
        date: today,
        dominance
      },
      {
        upsert: true
      }
    );

    console.log(
      "Dominance Saved"
    );

  }

  catch (error) {

    console.log(
      error.message
    );

  }
}

const { runBackfill } = require("./backfillService");

async function backfillDominance() {
  await runBackfill();
}

module.exports = { fetchDominance, backfillDominance };