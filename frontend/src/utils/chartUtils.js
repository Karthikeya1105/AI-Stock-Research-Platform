export const COIN_LABELS = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether USDt",
  BNB: "BNB",
  XRP: "XRP",
  USDC: "USDC",
  SOL: "Solana",
  TRX: "TRON",
  DOGE: "Dogecoin",
  HYPE: "Hyperliquid",
  OTHERS: "Others",
};

export const COIN_COLORS = {
  BTC: "#3861FB",
  ETH: "#16C784",
  USDT: "#F7931A",
  BNB: "#00D4FF",
  XRP: "#EC4899",
  USDC: "#6366F1",
  SOL: "#A855F7",
  TRX: "#EF4444",
  DOGE: "#F59E0B",
  HYPE: "#14B8A6",
  OTHERS: "#DC2626",
};

export const TIME_RANGES = [
  { key: "1D", days: 1 },
  { key: "1W", days: 7 },
  { key: "1M", days: 30 },
  { key: "3M", days: 90 },
  { key: "6M", days: 180 },
  { key: "YTD", days: "ytd" },
  { key: "1Y", days: 365 },
  { key: "5Y", days: 1825 },
  { key: "All", days: null },
];

export function filterByRange(data, rangeKey) {
  const range = TIME_RANGES.find((r) => r.key === rangeKey);
  if (!range || range.days === null) return data;

  const now = new Date();

  if (range.days === "ytd") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return data.filter((item) => new Date(item.date) >= yearStart);
  }

  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - range.days);
  return data.filter((item) => new Date(item.date) >= cutoff);
}

export function formatCapValue(val) {
  if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  return val.toFixed(0);
}

export function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
