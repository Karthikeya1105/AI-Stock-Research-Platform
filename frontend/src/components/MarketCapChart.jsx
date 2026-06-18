import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { getMarketCap } from "../api/marketCapApi";
import {
  TIME_RANGES,
  filterByRange,
  formatCapValue,
  formatDateLabel,
} from "../utils/chartUtils";

const SERIES_CONFIG = [
  { key: "total", label: "Total crypto market cap", color: "#F7931A" },
  { key: "excludingBtc", label: "Excluding BTC", color: "#3B82F6" },
  { key: "altcoins", label: "Altcoins", color: "#EC4899" },
];

function MarketCapChart() {
  const [rawData, setRawData] = useState([]);
  const [visibleSeries, setVisibleSeries] = useState(
    SERIES_CONFIG.map((s) => s.key)
  );
  const [timeRange, setTimeRange] = useState("5Y");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketCap().then((data) => {
      setRawData(data);
      setLoading(false);
    });
  }, []);

  const filteredData = useMemo(
    () => filterByRange(rawData, timeRange),
    [rawData, timeRange]
  );

  const chartSeries = useMemo(() => {
    return SERIES_CONFIG.filter((s) => visibleSeries.includes(s.key)).map(
      (s) => ({
        name: s.label,
        data: filteredData.map((item) => item[s.key]),
      })
    );
  }, [filteredData, visibleSeries]);

  const dates = filteredData.map((item) => formatDateLabel(item.date));

  const colors = SERIES_CONFIG.filter((s) =>
    visibleSeries.includes(s.key)
  ).map((s) => s.color);

  const latestValues = useMemo(() => {
    if (!filteredData.length) return {};
    const last = filteredData[filteredData.length - 1];
    return {
      total: formatCapValue(last.total),
      excludingBtc: formatCapValue(last.excludingBtc),
      altcoins: formatCapValue(last.altcoins),
    };
  }, [filteredData]);

  const toggleSeries = (key) => {
    setVisibleSeries((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const options = {
    chart: {
      type: "area",
      stacked: false,
      background: "#000",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    theme: { mode: "dark" },
    colors,
    grid: {
      borderColor: "#27272a",
      padding: { right: 60 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => `$${formatCapValue(val)}`,
      },
    },
    legend: { show: false },
    xaxis: {
      categories: dates,
      type: "category",
      tickAmount: 8,
      labels: {
        style: { colors: "#71717A", fontSize: "11px" },
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
      labels: {
        formatter: (val) => formatCapValue(val),
        style: { colors: "#71717A", fontSize: "11px" },
      },
    },
    annotations: {
      points: SERIES_CONFIG.filter((s) => visibleSeries.includes(s.key)).map(
        (s) => {
          const lastVal = filteredData.length
            ? filteredData[filteredData.length - 1][s.key]
            : 0;
          return {
            x: dates[dates.length - 1],
            y: lastVal,
            marker: { size: 0 },
            label: {
              borderWidth: 0,
              borderRadius: 4,
              offsetX: 10,
              style: {
                background: s.color,
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                padding: { left: 6, right: 6, top: 3, bottom: 3 },
              },
              text: latestValues[s.key] || "",
            },
          };
        }
      ),
    },
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen text-white flex items-center justify-center">
        Loading market cap data...
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-1">
          Market cap breakdown
          <span className="text-zinc-500 text-lg">&rsaquo;</span>
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {SERIES_CONFIG.map((s) => (
          <label
            key={s.key}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${
              visibleSeries.includes(s.key)
                ? "bg-zinc-800 border-zinc-600"
                : "bg-zinc-900 border-zinc-800 opacity-50"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <input
              type="checkbox"
              className="sr-only"
              checked={visibleSeries.includes(s.key)}
              onChange={() => toggleSeries(s.key)}
            />
            <span>{s.label}</span>
          </label>
        ))}
      </div>

      <div className="w-full overflow-x-auto scrollbar-hide">
        <div className="min-w-[900px]">
          <Chart
            options={options}
            series={chartSeries}
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
            className={`px-3 py-1 text-xs rounded-full transition ${
              timeRange === range.key
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

export default MarketCapChart;
