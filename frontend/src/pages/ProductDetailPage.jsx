import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2, MessageCircle, CalendarPlus } from "lucide-react";
import { fetchProduct } from "../lib/productApi";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProduct(id);
        if (!cancelled) setProduct(data.product);
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onContact = () =>
    toast("Contact seller will open your messaging module.", {
      icon: "💬",
    });
  const onMeeting = () =>
    toast("Create meeting will use your meetings module.", { icon: "📅" });

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-brand-50 to-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 to-white px-6 py-16 text-center">
        <p className="text-slate-600">Product not found.</p>
        <Link
          to="/shop"
          className="mt-4 inline-block text-brand-700 font-medium hover:underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 via-white to-violet-50/50">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <Link
          to={`/shop/c/${encodeURIComponent(product.category)}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {product.category}
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-lg shadow-brand-200/30">
            <img
              src={product.image}
              alt={
                product.name
                  ? `${product.name} — product photo`
                  : "Product photo"
              }
              className="aspect-square w-full object-cover"
            />
          </div>

          <div>
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800">
              {product.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              LKR {Number(product.price).toLocaleString()}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              <span className="text-slate-500">Listing status:</span>{" "}
              <span className="font-medium text-slate-800">{product.status}</span>
            </p>

            <div className="mt-8 rounded-2xl border border-brand-100 bg-white/90 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Product description
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onContact}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-brand-600 bg-white px-5 py-3.5 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                <MessageCircle className="h-5 w-5" />
                Contact the seller
              </button>
              <button
                type="button"
                onClick={onMeeting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3.5 font-semibold text-white shadow-glow-sm transition hover:from-brand-500 hover:to-indigo-500"
              >
                <CalendarPlus className="h-5 w-5" />
                Create a meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
