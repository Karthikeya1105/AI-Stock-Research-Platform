function Navbar({ setCategory }) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => setCategory("all")}
      >
        All
      </button>

      <button
        onClick={() => setCategory("latest")}
      >
        Latest
      </button>

      <button
        onClick={() => setCategory("trending")}
      >
        Trending
      </button>
    </div>
  );
}

export default Navbar;
s