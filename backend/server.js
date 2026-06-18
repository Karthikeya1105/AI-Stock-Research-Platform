const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const { fetchDominance } = require("./services/dominanceService");
const { fetchMarketCap } = require("./services/marketCapService");
const { runBackfill } = require("./services/backfillService");
const dominanceRoutes = require("./routes/dominanceRoutes");
const marketCapRoutes = require("./routes/marketCapRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/dominance", dominanceRoutes);
app.use("/api/marketcap", marketCapRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log(
      "MongoDB Connected"
    );

    await fetchDominance();
    await fetchMarketCap();

    (async () => {
      try {
        console.log("Checking if backfills are needed...");
        await runBackfill();
      } catch (err) {
        console.error("Backfill execution error:", err);
      }
    })();

    cron.schedule(
      "0 0 * * *",
      async () => {
        await fetchDominance();
        await fetchMarketCap();
      }
    );
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/api/news", async (req, res) => {

  try {

    const type = req.query.type || "all";

    const newsDataResponse =
      await axios.get(
        "https://newsdata.io/api/1/latest",
        {
          params: {
            apikey:
              process.env.NEWSDATA_API_KEY,

            q: "crypto",

            language: "en"
          }
        }
      );

    const newsData =
      (newsDataResponse.data.results || [])
        .map((article, index) => ({
          id: `news-${index}`,

          published_on: Math.floor(
            new Date(article.pubDate).getTime() / 1000
          ),

          instrument:
            article.creator?.[0] || "CRYPTO",

          icon:
            article.source_icon,

          title:
            article.title,

          description:
            article.description || "No description available",

          source:
            article.source_name,

          link:
            article.link
        }));


    const finnhubResponse =
      await axios.get(
        "https://finnhub.io/api/v1/news",
        {
          params: {
            category: "crypto",
            token: process.env.FINNHUB_API
          }
        }
      );



    const finnhubNews =
      (finnhubResponse.data || [])
        .map((article, index) => ({

          id:
            `finnhub-${index}`,


          published_on:
            article.datetime,


          instrument:
            article.category || "CRYPTO",


          icon:
            article.image,


          title:
            article.headline,


          description:
            article.summary ||
            "No description available",


          source:
            article.source,


          link:
            article.url

        }));

    const mediaStackResponse = await axios.get(
      "http://api.mediastack.com/v1/news",
      {
        params: {
          access_key:
            process.env.MEDIASTACK_API,

          keywords:
            "crypto OR bitcoin OR ethereum",

          languages: "en",

          limit: 60,

          sort: "published_desc",
        },
      }
    );

    const mediaStackNews =
      (mediaStackResponse.data.data || []).map(
        (article, index) => ({
          id: `mediastack-${index}`,

          published_on: Math.floor(
            new Date(
              article.published_at
            ).getTime() / 1000
          ),

          instrument: article.source,

          icon: article.image,

          title: article.title,

          description:
            article.description,

          source: article.source,

          link: article.url,
        })
      );



    let finalNews = [];



    if (type === "latest") {

      finalNews = [
        ...newsData,
      ];

    }

    else if (type === "trending") {

      finalNews = [
        ...mediaStackNews,
        ...finnhubNews]

    }

    else {

      finalNews = [
        ...newsData,
        ...mediaStackNews,
        ...finnhubNews,
      ];

    }



    finalNews.sort(
      (a, b) =>
        b.published_on -
        a.published_on
    );

    res.json(finalNews);

  }

  catch (error) {

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      message:
        "Failed fetching data"
    });

  }
});


app.get("/api/coins", async (req, res) => {
  try {
    const response = await axios.get(
      "https://openapiv1.coinstats.app/coins",
      {
        headers: {
          "X-API-KEY": process.env.COINSTATS_API,
        },
        params: {
          limit: 100,
          currency: "USD",
        },
      }
    );

    const coins = response.data.result;

    const coinData = coins.map((coin) => {
      return {
        id: coin.id,

        icon: coin.icon,

        instrument: coin.symbol,

        rank: coin.rank,

        price: coin.price,

        change: coin.priceChange1d,

        volume: coin.volume,

        website: coin.websiteUrl,

        twitter: coin.twitterUrl,

        chg1d: coin.priceChange1d,

        marketCap: coin.marketCap,

        supply: coin.availableSupply,

      };

    });

    res.json(coinData);

  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Coin fetching failed",
    });
  }
});


app.listen(5000, () => {

  console.log(

    "Server running on 5000"
  );

});