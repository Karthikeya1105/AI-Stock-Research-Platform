import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import {
  COIN_LABELS,
  COIN_COLORS,
  TIME_RANGES,
  filterByRange,
  formatDateLabel,
} from "../utils/chartUtils";


function DominanceChart() {
  const [rawData, setRawData] = useState([]);
  const [series, setSeries] = useState([]);
  const [visibleCoins, setVisibleCoins] = useState([]);
  const [timeRange, setTimeRange] = useState("5Y");

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:5000/api/dominance");
      const data = res.data;
      if (!data.length) return;

      setRawData(data);

      const latest = data[data.length - 1];
      const top10 = Object.entries(latest.dominance)
        .filter(([coin]) => coin !== "OTHERS")
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([coin]) => coin);

      top10.push("OTHERS");
      setVisibleCoins(top10);

      const chartSeries = top10.map((coin) => ({
        name: COIN_LABELS[coin] || coin,
        coinKey: coin,
        data: data.map((item) => item.dominance?.[coin] || 0),
      }));

      setSeries(chartSeries);
    };

    fetchData();
  }, []);

  const filteredData = useMemo(
    () => filterByRange(rawData, timeRange),
    [rawData, timeRange]
  );

  const filteredSeries = useMemo(() => {
    const startIdx = rawData.length - filteredData.length;
    return series
      .filter((s) => visibleCoins.includes(s.coinKey))
      .map((s) => ({
        name: s.name,
        data: s.data.slice(startIdx),
      }));
  }, [series, visibleCoins, filteredData, rawData]);

  const dates = filteredData.map((item) => formatDateLabel(item.date));

  const colors = series
    .filter((s) => visibleCoins.includes(s.coinKey))
    .map((s) => COIN_COLORS[s.coinKey] || "#9CA3AF");

  const toggleCoin = (coinKey) => {
    setVisibleCoins((prev) =>
      prev.includes(coinKey)
        ? prev.filter((c) => c !== coinKey)
        : [...prev, coinKey]
    );
  };

  const options = {
    chart: {
      type: "line",
      background: "#000",
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      animations: {
        enabled: true
      },
    },
    theme: { mode: "dark" },
    colors,
    grid: {
      borderColor: "#27272a",
      padding: { right: 20 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 1.5 },
    fill: {
      opacity: 0.0,
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      x: { format: "dd MMM yyyy" },
      y: {
        formatter: (val) => `${val.toFixed(2)}%`,
      },
    },
    legend: { show: false },
    xaxis: {
      categories: dates,
      type: "category",
      tickAmount: 8,
      labels: {
        style: { colors: "#71717A", fontSize: "11px" },
        rotate: 0,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      crosshairs: {
        show: true,
        stroke: { color: "#52525B", width: 1, dashArray: 4 },
      },
    },
    yaxis: {
      opposite: true,
      min: 0,
      max: 100,
      tickAmount: 9,
      labels: {
        formatter: (val) => `${val.toFixed(2)}%`,
        style: { colors: "#71717A", fontSize: "11px" },
      },
    },
  };

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Dominance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Top cryptocurrencies market share over time
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {series.map((coin) => (
          <label
            key={coin.coinKey}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${visibleCoins.includes(coin.coinKey)
              ? "bg-zinc-800 border-zinc-600"
              : "bg-zinc-900 border-zinc-800 opacity-50"
              }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COIN_COLORS[coin.coinKey] || "#9CA3AF" }}
            />
            <input
              type="checkbox"
              className="sr-only"
              checked={visibleCoins.includes(coin.coinKey)}
              onChange={() => toggleCoin(coin.coinKey)}
            />
            <span>{coin.name}</span>
          </label>
        ))}
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="min-w-[900px]">
          <Chart
            options={options}
            series={filteredSeries}
            type="area"
            height={500}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-4">
        {TIME_RANGES.map((range) => (
          <button
            key={range.key}
            onClick={() => setTimeRange(range.key)}
            className={`px-3 py-1 text-xs rounded-full transition ${timeRange === range.key
              ? "bg-zinc-700 text-white"
              : "text-zinc-500 hover:text-zinc-300"
              }`}
          >
            {range.key}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DominanceChart;
