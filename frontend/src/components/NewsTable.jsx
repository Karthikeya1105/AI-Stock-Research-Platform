import { useEffect, useState } from "react";
import { getCryptoNews } from "../api/newsApi";

function NewsTable({ category }) {
  const [news, setNews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setVisibleCount(20);
    loadNews();
  }, [category]);

  const loadNews = async () => {
    setLoading(true);

    const data = await getCryptoNews(category);

    setNews(data);
    setLoading(false);
  };

  const handleShowLess = () => {
    setVisibleCount(20);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (loading) {
    return <h2>Loading crypto news...</h2>;
  }

  return (
    <div className="w-full">
      <div
        className="
          max-h-[80vh]
          overflow-y-auto
          overflow-x-auto
          scrollbar-hide
          border
          border-gray-800
          rounded-lg
          bg-black
        "
      >
        <table className="w-full text-sm text-left border-collapse bg-black">
          {/* HEADER */}
          <thead className="sticky top-0 bg-gray-900 z-20 shadow-md">
            <tr className="text-gray-300 uppercase text-xs">
              <th className="px-4 py-3 whitespace-nowrap">Time</th>
              <th className="px-4 py-3 whitespace-nowrap">Instrument</th>
              <th className="px-4 py-3 whitespace-nowrap">Headline</th>
              <th className="px-4 py-3 whitespace-nowrap">Description</th>
              <th className="px-4 py-3 whitespace-nowrap">Provider</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-800">
            {news.slice(0, visibleCount).map((item) => (
              <tr
                key={item.id}
                className="
                  bg-black
                  text-white
                  hover:bg-gray-800
                  transition
                "
              >
                <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                  {new Date(item.published_on * 1000).toLocaleString()}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-semibold">
                    {item.instrument || "CRYPTO"}
                  </span>
                </td>

                <td className="px-4 py-3 min-w-[350px]">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        text-blue-400
                        hover:text-blue-300
                        hover:underline
                      "
                    >
                      {item.title}
                    </a>
                  ) : (
                    item.title
                  )}
                </td>

                <td className="px-4 py-3 min-w-[500px]">
                  <p className="text-gray-300 line-clamp-3">
                    {item.description || "No description available"}
                  </p>
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className="
                      px-3
                      py-1
                      text-xs
                      rounded-full
                      bg-gray-700
                      text-gray-200
                    "
                  >
                    {item.source}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {news.length > 20 && (
        <div className="text-center mt-5">
          {visibleCount < news.length ? (
            <button
              onClick={() =>
                setVisibleCount((prev) => prev + 20)
              }
              className="
                px-5
                py-2
                bg-blue-600
                text-white
                rounded-lg
                hover:bg-blue-700
                transition
              "
            >
              Show More
            </button>
          ) : (
            <button
              onClick={handleShowLess}
              className="
                px-5
                py-2
                bg-gray-700
                text-white
                rounded-lg
                hover:bg-gray-600
                transition
              "
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NewsTable;