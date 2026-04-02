import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Laptop,
  Smartphone,
  Headphones,
  BookOpen,
  Home,
  Wrench,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { fetchCategories } from "../lib/productApi";

function StoreFallback(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={props.className}
    >
      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
      <path d="M12 14v4" />
    </svg>
  );
}

const iconFor = (name) => {
  const n = name.toLowerCase();
  if (n.includes("laptop")) return Laptop;
  if (n.includes("mobile")) return Smartphone;
  if (n.includes("accessories")) return Headphones;
  if (n.includes("notes") || n.includes("book")) return BookOpen;
  if (n.includes("boarding") || n.includes("room")) return Home;
  if (n.includes("service")) return Wrench;
  if (n.includes("electronics")) return Cpu;
  return StoreFallback;
};

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(data.categories || []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 via-white to-violet-50/60">
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <p className="text-sm font-semibold text-brand-600">Shop</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Browse by category
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Pick a category to see listings from students and staff. Only
          available items appear here.
        </p>

        {loading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-brand-100/80"
              />
            ))}
          </div>
        ) : (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = iconFor(cat);
              const to = `/shop/c/${encodeURIComponent(cat)}`;
              return (
                <li key={cat}>
                  <Link
                    to={to}
                    className="group flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm shadow-brand-200/40 transition hover:border-brand-300 hover:shadow-glow-sm"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-md">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-900 group-hover:text-brand-700 transition">
                        {cat}
                      </span>
                      <p className="text-sm text-slate-500 mt-0.5">
                        View listings
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-brand-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
