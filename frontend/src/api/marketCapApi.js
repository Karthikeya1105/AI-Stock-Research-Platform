const API_BASE = "http://localhost:5000/api";

export async function getMarketCap() {
  const res = await fetch(`${API_BASE}/marketcap`);
  return res.json();
}
