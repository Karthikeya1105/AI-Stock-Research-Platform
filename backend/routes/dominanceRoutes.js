const express = require("express");
const router = express.Router();
const Dominance = require("../models/Dominance");
const { backfillDominance } = require("../services/dominanceService");

router.get("/", async (req, res) => {
  try {
    let data = await Dominance.find().sort({ date: 1 }).lean();

    if (data.length < 10) {
      await backfillDominance();
      data = await Dominance.find().sort({ date: 1 }).lean();
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dominance",
      error: error.message,
    });
  }
});

module.exports = router;