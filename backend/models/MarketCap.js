const mongoose = require("mongoose");

const marketCapSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    total: { type: Number, required: true },
    excludingBtc: { type: Number, required: true },
    altcoins: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketCap", marketCapSchema);
