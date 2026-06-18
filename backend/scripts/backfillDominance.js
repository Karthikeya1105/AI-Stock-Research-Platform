const axios = require("axios");
const mongoose = require("mongoose");

require("dotenv").config();

const Dominance = require(
  "../models/Dominance"
);

async function runBackfill() {

  await mongoose.connect(
    process.env.MONGO_URI
  );

  console.log(
    "MongoDB Connected"
  );

  const coinsResponse =
    await axios.get(
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

  const topCoins =
    coinsResponse.data;

  const allCoinHistory = {};

  for (const coin of topCoins) {

    console.log(
      `Fetching ${coin.id}`
    );

    const history =
      await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart`,
        {
          params: {
            vs_currency:
              "usd",
            days: "max",
            interval:
              "daily",
          },
        }
      );

    allCoinHistory[
      coin.symbol.toUpperCase()
    ] =
      history.data.market_caps;

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1500
        )
    );
  }

  const dates = {};

  Object.entries(
    allCoinHistory
  ).forEach(
    ([symbol, history]) => {

      history.forEach(
        ([timestamp, cap]) => {

          const date =
            new Date(
              timestamp
            )
              .toISOString()
              .split(
                "T"
              )[0];

          if (!dates[date]) {
            dates[date] = {};
          }

          dates[date][
            symbol
          ] = cap;
        }
      );
    }
  );

  for (const date of Object.keys(
    dates
  )) {

    const marketCaps =
      dates[date];

    const totalCap =
      Object.values(
        marketCaps
      ).reduce(
        (
          sum,
          value
        ) =>
          sum +
          value,
        0
      );

    const dominance = {};

    let tracked = 0;

    Object.entries(
      marketCaps
    ).forEach(
      ([symbol, cap]) => {

        const percent =
          Number(
            (
              (cap /
                totalCap) *
              100
            ).toFixed(
              2
            )
          );

        dominance[
          symbol
        ] = percent;

        tracked +=
          percent;
      }
    );

    dominance[
      "OTHERS"
    ] = Number(
      (
        100 -
        tracked
      ).toFixed(2)
    );

    await Dominance.findOneAndUpdate(
      {
        date:
          new Date(
            date
          ),
      },
      {
        date:
          new Date(
            date
          ),
        dominance,
      },
      {
        upsert: true,
      }
    );
  }

  console.log(
    "Backfill Complete"
  );

  process.exit();
}

runBackfill();  