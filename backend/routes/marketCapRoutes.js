const express = require("express");
const MarketCap = require("../models/MarketCap");
const { backfillMarketCap } = require("../services/marketCapService");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let data = await MarketCap.find().sort({ date: 1 }).lean();

    if (data.length < 10) {
      await backfillMarketCap();
      data = await MarketCap.find().sort({ date: 1 }).lean();
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
