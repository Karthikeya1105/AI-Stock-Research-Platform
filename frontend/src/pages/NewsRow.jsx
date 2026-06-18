function NewsRow({ news }) {
  const time = new Date(
    news.published_on * 1000
  ).toLocaleString();

  return (
    <div
      className="
        grid
        grid-cols-[160px_180px_1fr_250px_120px]
        items-center
        border-b
        py-5
        px-4
        hover:bg-blue-50
        even:bg-gray-50
        transition
      "
    >
      <div className="text-gray-500 whitespace-nowrap">
        {time}
      </div>

      <div className="flex items-center gap-3">
        {news.icon && (
          <img
            src={news.icon}
            alt=""
            className="
              w-8
              h-8
              rounded-full
              object-cover
            "
          />
        )}

        <span className="font-medium">
          {news.instrument || "CRYPTO"}
        </span>
      </div>

      <div
        className="
          font-semibold
          text-gray-900
          text-lg
        "
      >
        {news.link ? (
          <a
            href={news.link}
            target="_blank"
            rel="noreferrer"
            className="
              hover:text-blue-600
              hover:underline
            "
          >
            {news.title}
          </a>
        ) : (
          news.title
        )}
      </div>

      <div
        className="
          text-gray-600
          text-sm
          line-clamp-3
        "
      >
        {news.description ||
          "No description available"}
      </div>

      <div
        className="
          flex
          flex-col
          items-end
          gap-2
        "
      >
        <span
          className="
            px-2
            py-1
            rounded-full
            bg-gray-100
            text-xs
          "
        >
          {news.source}
        </span>

        {news.link && (
          <a
            href={news.link}
            target="_blank"
            rel="noreferrer"
            className="
              bg-blue-600
              text-white
              px-3
              py-1
              rounded
              text-sm
              hover:bg-blue-700
            "
          >
            Read
          </a>
        )}
      </div>
    </div>
  );
}

export default NewsRow;