import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useState } from "react";

import Navbar from "./pages/Navbar";
import NewsTable from "./components/NewsTable";
import Coins from "./pages/Coins";
import DominanceChart from "./components/DominanceChart";
import MarketCapChart from "./components/MarketCapChart";

function App() {
  const [category, setCategory] = useState("all");
  const location = useLocation();
  const isDarkPage =
    location.pathname === "/dominance" ||
    location.pathname === "/marketcap";

  const linkClass = (path) => {
    const active = location.pathname === path;
    return `font-bold text-xl transition ${
      isDarkPage
        ? active
          ? "text-white"
          : "text-zinc-500 hover:text-zinc-300"
        : active
          ? "text-blue-600"
          : "hover:text-blue-500"
    }`;
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDarkPage ? "bg-black text-white" : "bg-white"
      }`}
    >
      <nav className="flex gap-6 mb-8">
        <Link to="/" className={linkClass("/")}>
          News
        </Link>
        <Link to="/coins" className={linkClass("/coins")}>
          Coins
        </Link>
        <Link to="/dominance" className={linkClass("/dominance")}>
          Dominance
        </Link>
        <Link to="/marketcap" className={linkClass("/marketcap")}>
          Market Cap
        </Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <h1 className="text-3xl font-bold mb-8">Crypto News Flow</h1>
              <Navbar setCategory={setCategory} />
              <NewsTable category={category} />
            </div>
          }
        />

        <Route
          path="/coins"
          element={
            <div>
              <h1 className="text-3xl font-bold mb-8">Crypto Coins</h1>
              <Coins />
            </div>
          }
        />

        <Route
          path="/dominance"
          element={
            <div className="max-w-7xl mx-auto">
              <DominanceChart />
            </div>
          }
        />

        <Route
          path="/marketcap"
          element={
            <div className="max-w-7xl mx-auto">
              <MarketCapChart />
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
