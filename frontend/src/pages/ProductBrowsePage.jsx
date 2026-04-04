import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Package, Search, SlidersHorizontal } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import ProductListingCard from "../components/ProductListingCard";
import { formatCategoryLabel } from "../lib/categoryLabels";

const SORT_CHOICES = [
  { value: "new", label: "Newest first" },
  { value: "price_low", label: "Price: low to high" },
  { value: "price_high", label: "Price: high to low" },
  { value: "name_az", label: "Name: A → Z" },
  { value: "name_za", label: "Name: Z → A" },
];

const FALLBACK_CATEGORIES = [
  "mobiles",
  "laptops",
  "electronics",
  "accessories",
  "notes/books",
  "boarding/rooms",
  "services",
];

const ProductBrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") || "");
  const [debouncedQ, setDebouncedQ] = useState(() => searchParams.get("q") || "");

  const category = searchParams.get("category") || "all";
  const sort = searchParams.get("sort") || "new";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const setParam = useCallback(
    (key, value) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const clear = value === "" || value === null || value === undefined || (key === "category" && value === "all");
          if (clear) next.delete(key);
          else next.set(key, String(value));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setParam("q", debouncedQ || null);
  }, [debouncedQ, setParam]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("/products/categories");
        if (res.data?.data?.length) setCategories(res.data.data);
      } catch {
        /* keep fallback */
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = { sort };
        if (category && category !== "all") params.category = category;
        if (debouncedQ) params.q = debouncedQ;
        if (minPrice !== "") params.minPrice = minPrice;
        if (maxPrice !== "") params.maxPrice = maxPrice;
        const res = await axios.get("/products/browse", { params });
        setProducts(res.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, sort, minPrice, maxPrice, debouncedQ]);

  const categoryOptions = useMemo(
    () => [{ id: "all", label: "All categories" }, ...categories.map((id) => ({ id, label: formatCategoryLabel(id) }))],
    [categories],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-14">
      <div className="border-b border-indigo-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Browse UniMart</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Search by category & filters</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Pick a category, type a keyword, and narrow results by price or sort order.
          </p>

          <div className="relative mt-6 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by product name or description…"
              className="w-full rounded-2xl border border-indigo-100 bg-white py-3.5 pl-12 pr-4 text-sm text-gray-900 shadow-sm outline-none ring-indigo-100 transition focus:border-indigo-300 focus:ring-2"
              autoComplete="off"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
          Categories
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setParam("category", opt.id === "all" ? null : opt.id)}
            aria-pressed={(opt.id === "all" && category === "all") || opt.id === category}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                (opt.id === "all" && category === "all") || opt.id === category
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-700 shadow ring-1 ring-indigo-100 hover:bg-indigo-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm lg:flex-row lg:flex-wrap lg:items-end">
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto lg:min-w-[200px] lg:flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Min price (LKR)
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setParam("minPrice", e.target.value)}
                placeholder="0"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Max price (LKR)
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setParam("maxPrice", e.target.value)}
                placeholder="Any"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          </div>
          <label className="block w-full text-xs font-semibold uppercase tracking-wider text-gray-500 lg:w-56">
            Sort
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value === "new" ? null : e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              {SORT_CHOICES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setDebouncedQ("");
              setSearchParams({}, { replace: true });
            }}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 lg:shrink-0"
          >
            Clear filters
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            {loading ? "Loading…" : `${products.length} listing${products.length === 1 ? "" : "s"} found`}
          </p>
          <Link
            to="/"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ← Back to home
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-[2rem] border border-dashed border-indigo-200 bg-white/90 p-12 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-indigo-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-800">No matches</h3>
            <p className="mt-2 text-sm text-gray-500">Try another category, keyword, or price range.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductListingCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductBrowsePage;
