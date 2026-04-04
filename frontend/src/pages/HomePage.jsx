import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Search, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import ProductListingCard from "../components/ProductListingCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLatestProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/products/available");
        setProducts((response.data.data || []).slice(0, 8));
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadLatestProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 text-white shadow-2xl">
          <div className="grid gap-8 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-100">
                <Sparkles size={14} />
                Latest Listings
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
                Your campus, your marketplace!
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-50 sm:text-base">
                Buy what you need or sell what you don’t. Meet up between lectures to complete your trade instantly.
              </p>
              <Link
                to="/browse"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-md transition hover:bg-indigo-50"
              >
                <Search className="h-4 w-4" aria-hidden />
                Search products
              </Link>
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

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Latest Listed Products</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-800">Recently added listings</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
            >
              <Search className="h-4 w-4" aria-hidden />
              Search
            </Link>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow">
              Available products only
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-lg">
                <div className="h-52 animate-pulse rounded-[1.3rem] bg-indigo-100" />
                <div className="mt-4 flex justify-between gap-3">
                  <div className="h-6 flex-1 animate-pulse rounded bg-indigo-100" />
                  <div className="h-14 w-24 shrink-0 animate-pulse rounded-2xl bg-indigo-100" />
                </div>
                <div className="mt-5 h-12 animate-pulse rounded-2xl bg-slate-200" />
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => (
              <ProductListingCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
