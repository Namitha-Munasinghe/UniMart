import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { fetchPublicProducts } from "../lib/productApi";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A–Z" },
];

const CategoryProductsPage = () => {
  const { category: encoded } = useParams();
  const category = encoded ? decodeURIComponent(encoded) : "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicProducts(category);
        if (!cancelled) setProducts(data.products || []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  const filteredSorted = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = products;
    if (q) {
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    const copy = [...list];
    switch (sortBy) {
      case "price-asc":
        return copy.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return copy.sort((a, b) => Number(b.price) - Number(a.price));
      case "name":
        return copy.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "", undefined, {
            sensitivity: "base",
          })
        );
      default:
        return copy.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  }, [products, searchQuery, sortBy]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 via-white to-violet-50/60">
      <div className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All categories
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
          {category || "Products"}
        </h1>
        <p className="mt-2 text-slate-600">
          {loading
            ? "Loading listings…"
            : `${products.length} listing${products.length === 1 ? "" : "s"} in this category.`}
        </p>

        {!loading && products.length > 0 && (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="category-search"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Search listings
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="category-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or description"
                  className="w-full rounded-xl border border-brand-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="sm:w-56">
              <label
                htmlFor="category-sort"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Sort by
              </label>
              <select
                id="category-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white py-3 px-4 text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex justify-center py-20">
            <Loader2
              className="h-10 w-10 animate-spin text-brand-600"
              aria-label="Loading"
            />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-brand-200 bg-white/80 px-8 py-16 text-center text-slate-600">
            No available listings in this category right now.
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-brand-200 bg-white/80 px-8 py-16 text-center text-slate-600">
            No listings match your search. Try a different keyword.
          </div>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSorted.map((p) => (
              <li key={p._id}>
                <Link
                  to={`/product/${p._id}`}
                  className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm shadow-brand-100/80 transition hover:border-brand-300 hover:shadow-glow-sm"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-100">
                    <img
                      src={p.image}
                      alt={p.name ? `${p.name} — product photo` : "Product"}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-brand-700">
                      {p.name}
                    </h2>
                    <p className="mt-2 text-lg font-bold text-brand-700">
                      LKR {Number(p.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
