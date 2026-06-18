import { useEffect, useState } from "react";
import { getCoins } from "../api/coinsApi";

function CoinsTable() {
  const [coins, setCoins] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);

  const [sort, setSort] = useState({
    key: "price",
    direction: "desc",
  });

  useEffect(() => {
    loadCoins();
  }, []);

  const loadCoins = async () => {
    const data = await getCoins();

    const sortedData = [...data]
      .sort((a, b) => b.price - a.price)
      .map((coin, index) => ({
        ...coin,
        rank: index + 1,
      }));
    setCoins(sortedData);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sort.key === key && sort.direction === "asc") {
      direction = "desc";
    }
    let sorted = [...coins].sort((a, b) => {
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }
      return direction === "asc"
        ? a[key] - b[key]
        : b[key] - a[key];

    });
    sorted = sorted.map((coin, index) => ({
      ...coin,
      rank: index + 1,
    }));
    setCoins(sorted);
    setSort({
      key,
      direction,
    });
  };

  const handleShowMore = () => {
    setVisibleCount(coins.length);
  };

  const handleShowLess = () => {
    setVisibleCount(20);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const headers = [
    ["instrument", "Instrument"],
    ["rank", "Rank"],
    ["price", "Price"],
    ["change", "Chg % 24h"],
    ["marketCap", "Mkt cap"],
    ["volume", "Vol in USD 24h"],
    ["supply", "Circ supply"],
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="max-h-[700px] overflow-y-auto overflow-x-auto scrollbar-hide border rounded-lg bg-black">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 bg-gray-900 z-50">
            <tr className="text-gray-300 uppercase text-xs">
              {headers.map(([key, label]) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-700 whitespace-nowrap transition"
                >
                  {label}
                  {sort.key === key && (sort.direction === "asc" ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {coins.slice(0, visibleCount).map((coin) => (
              <tr
                key={coin.id}
                className="bg-black text-white hover:bg-gray-800 transition"
              >
                <td className="px-4 py-3 flex items-center gap-2">
                  <img
                    src={coin.icon}
                    alt={coin.instrument}
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="font-semibold">{coin.instrument}</span>
                </td>

                <td className="px-4 py-3 text-gray-200">{coin.rank}</td>

                <td className="px-4 py-3">
                  $
                  {coin.price?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                <td
                  className={`px-4 py-3 font-semibold ${
                    coin.change >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {coin.change?.toFixed(2)}%
                </td>

                <td className="px-4 py-3">
                  ${(coin.marketCap / 1e9).toFixed(2)}B
                </td>

                <td className="px-4 py-3">
                  ${(coin.volume / 1e9).toFixed(2)}B
                </td>

                <td className="px-4 py-3">
                  {(coin.supply / 1e6).toFixed(2)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {coins.length > 20 && (
        <div className="text-center mt-5">
          {visibleCount < coins.length ? (
            <button
              onClick={handleShowMore}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Show More
            </button>
          ) : (
            <button
              onClick={handleShowLess}
              className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CoinsTable;