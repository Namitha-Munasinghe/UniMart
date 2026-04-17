import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, LayoutGrid, Package, Search, Sparkles, Star, User } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { PRODUCT_CATEGORIES, categoryDisplayName } from "../constants/categories";
import { useUserStore } from "../stores/useUserStore";

const ProductCard = ({ product }) => (
  <Link
    key={product._id}
    to={`/products/${product._id}`}
    className="group overflow-hidden rounded-[1.75rem] bg-white shadow-lg ring-1 ring-indigo-100 transition hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="relative">
      <img
        src={product.images?.[0]}
        alt={product.name}
        className="h-56 w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-indigo-950/80 via-indigo-950/10 to-transparent px-4 pb-4 pt-10">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-900">
            {product.status}
          </span>
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700">
            {categoryDisplayName(product.category)}
          </span>
        </div>
      </div>
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-xl font-bold text-gray-800">{product.name}</h3>
        <div className="shrink-0 rounded-2xl bg-indigo-50 px-3 py-2 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-500">Price</p>
          <p className="text-lg font-bold text-indigo-700">LKR {product.price}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3 rounded-2xl bg-indigo-50/60 p-4">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <User size={16} className="shrink-0 text-indigo-600" />
          <span className="font-medium">Seller:</span>
          <span className="truncate">{product.seller?.name || "Unknown seller"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <CalendarDays size={16} className="text-indigo-600" />
          <span className="font-medium">Listed:</span>
          <span>{new Date(product.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-indigo-700">
        <span>View full details</span>
        <ArrowRight size={18} />
      </div>
    </div>
  </Link>
);

const HomePage = () => {
  const { user } = useUserStore();
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const hasInterestProfile = Array.isArray(user?.interests) && user.interests.length >= 3;
  const lastTrackedSearchRef = useRef("");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = !categoryFilter || product.category === categoryFilter;
      const matchesSearch =
        !normalizedSearch ||
        product.name?.toLowerCase().includes(normalizedSearch) ||
        product.description?.toLowerCase().includes(normalizedSearch) ||
        product.category?.toLowerCase().includes(normalizedSearch) ||
        product.seller?.name?.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchTerm]);

  useEffect(() => {
    const loadLatestProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/products/available");
        setProducts(response.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadLatestProducts();
  }, []);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!hasInterestProfile) {
        setRecommendedProducts([]);
        return;
      }

      try {
        setLoadingRecommendations(true);
        const response = await axios.get("/products/recommended");
        setRecommendedProducts(response.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load recommendations");
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [hasInterestProfile]);

  useEffect(() => {
    if (!user || !searchTerm.trim()) {
      return undefined;
    }

    const normalizedSearch = `${searchTerm.trim().toLowerCase()}::${categoryFilter || "all"}`;
    if (lastTrackedSearchRef.current === normalizedSearch) {
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        await axios.post("/products/search-signal", {
          query: searchTerm.trim(),
          category: categoryFilter,
        });
        lastTrackedSearchRef.current = normalizedSearch;
      } catch {
        // Search tracking should not interrupt the browsing experience.
      }
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [user, searchTerm, categoryFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-indigo-700 text-white shadow-2xl">
          <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10">
            <div>
              
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                Your campus, your marketplace!
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                Buy what you need or sell what you don’t. Meet up between lectures to complete your trade instantly.
              </p>
            </div>

            <div className="grid gap-4 self-end sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Visible Now</p>
                <p className="mt-3 text-3xl font-bold">{products.length}</p>
                <p className="mt-2 text-sm text-indigo-100/90">New items nearby</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Buyer Ready</p>
                <p className="mt-3 text-lg font-semibold">Secure Trading</p>
                <p className="mt-2 text-sm text-indigo-100/90">View full details before you buy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-lg sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                <LayoutGrid size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Shop by category</p>
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Browse listings</h2>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search listings"
                className="w-full rounded-full border border-indigo-200 bg-indigo-50/80 py-2.5 pl-10 pr-28 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                className="absolute right-1.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-2 rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                <Search size={14} />
                Search
              </button>
            </div>
            <button
              type="button"
              onClick={() => setCategoryFilter(null)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                categoryFilter === null
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                  : "border-indigo-200 bg-indigo-50/80 text-indigo-800 hover:border-indigo-300 hover:bg-indigo-100"
              }`}
            >
              All
            </button>
            {PRODUCT_CATEGORIES.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => setCategoryFilter(slug)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  categoryFilter === slug
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                    : "border-indigo-200 bg-indigo-50/80 text-indigo-800 hover:border-indigo-300 hover:bg-indigo-100"
                }`}
              >
                {categoryDisplayName(slug)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Latest Listed Products</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {categoryFilter ? categoryDisplayName(categoryFilter) : "Recently added listings"}
            </h2>
            {(categoryFilter || searchTerm.trim()) && (
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} available listings
              </p>
            )}
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow">
            {categoryFilter
              ? `Category: ${categoryDisplayName(categoryFilter)}`
              : searchTerm.trim()
                ? `Search: ${searchTerm.trim()}`
                : "Available products only"}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-lg">
                <div className="h-52 animate-pulse rounded-[1.3rem] bg-indigo-100" />
                <div className="mt-4 h-5 animate-pulse rounded bg-indigo-100" />
                <div className="mt-3 h-4 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-indigo-200 bg-white/90 p-10 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-indigo-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">No available products yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Once sellers add products with status set to Available, they will appear here automatically.
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-indigo-200 bg-white/90 p-10 text-center shadow-sm">
            <Package className="mx-auto h-10 w-10 text-indigo-300" />
            <h3 className="mt-4 text-xl font-semibold text-gray-800">No matching listings found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try another search term or choose <span className="font-medium text-indigo-700">All</span> to see every
              available item.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {hasInterestProfile && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-r from-amber-50 via-white to-indigo-50 p-6 shadow-lg sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
                  <Star size={14} />
                  Recommended For You
                </p>
                <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">Picked from your interests</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  Based on {user.interests.map((interest) => categoryDisplayName(interest)).join(", ")}.
                </p>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow">
                Tailored around your signup selections
              </div>
            </div>

            {loadingRecommendations ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-[1.5rem] bg-white p-4 shadow">
                    <div className="h-44 animate-pulse rounded-[1.2rem] bg-amber-100" />
                    <div className="mt-4 h-5 animate-pulse rounded bg-slate-100" />
                    <div className="mt-3 h-4 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : recommendedProducts.length === 0 ? (
              <div className="mt-8 rounded-[1.75rem] border border-dashed border-amber-200 bg-white/90 p-8 text-center">
                <Package className="mx-auto h-10 w-10 text-amber-300" />
                <h3 className="mt-4 text-xl font-semibold text-slate-900">No recommendations yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  As soon as new listings appear in your selected categories, they will show up here.
                </p>
              </div>
            ) : (
              <div className="mt-8 flex gap-5 overflow-x-auto pb-2">
                {recommendedProducts.map((product) => (
                  <div key={product._id} className="min-w-[290px] max-w-[290px] flex-none">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
