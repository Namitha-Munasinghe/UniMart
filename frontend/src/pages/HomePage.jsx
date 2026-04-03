import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock3, Package, Sparkles, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

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
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">Latest Listed Products</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-800">Recently added listings</h2>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow">
            Available products only
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[1.75rem] bg-white p-4 shadow-lg">
                <div className="h-52 animate-pulse rounded-[1.3rem] bg-indigo-100" />
                <div className="mt-4 h-5 animate-pulse rounded bg-indigo-100" />
                <div className="mt-3 h-4 animate-pulse rounded bg-slate-100" />
                <div className="mt-2 h-4 animate-pulse rounded bg-slate-100" />
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
                        {product.category}
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

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{product.description}</p>

                  <div className="mt-5 space-y-3 rounded-2xl bg-indigo-50/60 p-4">
                    {/* <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Tag size={16} className="text-indigo-600" />
                      <span className="font-medium">Category:</span>
                      <span>{product.category}</span>
                    </div> */}
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CalendarDays size={16} className="text-indigo-600" />
                      <span className="font-medium">Listed:</span>
                      <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                    </div>
                    {/* <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Clock3 size={16} className="text-indigo-600" />
                      <span className="font-medium">Expires:</span>
                      <span>{new Date(product.expiresAt).toLocaleDateString()}</span>
                    </div> */}
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-indigo-700">
                    <span>View full details</span>
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
