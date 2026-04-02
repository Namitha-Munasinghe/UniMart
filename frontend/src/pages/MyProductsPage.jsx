import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2, Package, X } from "lucide-react";
import {
  fetchMyProducts,
  deleteProduct,
  getSellerId,
} from "../lib/productApi";

const MyProductsPage = () => {
  const sellerId = getSellerId();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyProducts(sellerId);
      setProducts(data.products || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id, sellerId);
      toast.success("Listing removed.");
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 via-white to-violet-50/60">
      <div className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              My products
            </h1>
            <p className="mt-2 text-slate-600">
              Add, edit, or remove your listings. Only you can change these
              items.
            </p>
          </div>
          <Link
            to="/my-products/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-3 font-semibold text-white shadow-glow-sm transition hover:from-brand-500 hover:to-indigo-500"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Add a product
          </Link>
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2
              className="h-10 w-10 animate-spin text-brand-600"
              aria-label="Loading your products"
            />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-brand-200 bg-white/90 px-8 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
              <Package className="h-8 w-8" aria-hidden />
            </div>
            <p className="mt-6 text-lg font-medium text-slate-800">
              No products yet
            </p>
            <p className="mt-2 max-w-sm text-slate-600">
              Create your first listing. Other students will see it in the shop
              when it is available.
            </p>
            <Link
              to="/my-products/new"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
            >
              <Plus className="h-5 w-5" aria-hidden />
              Add a product
            </Link>
          </div>
        ) : (
          <ul className="mt-10 space-y-4" aria-label="Your product listings">
            {products.map((p) => (
              <li
                key={p._id}
                className="flex flex-col gap-4 rounded-2xl border border-brand-100 bg-white p-4 shadow-sm shadow-brand-100/60 sm:flex-row sm:items-center"
              >
                <img
                  src={p.image}
                  alt={p.name ? `${p.name} — your listing` : "Your listing"}
                  className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-32 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">{p.name}</h2>
                  <p className="text-sm text-slate-500 mt-1">{p.category}</p>
                  <p className="text-brand-700 font-bold mt-2">
                    LKR {Number(p.price).toLocaleString()}
                  </p>
                  <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.status === "Available"
                        ? "bg-emerald-100 text-emerald-800"
                        : p.status === "Sold"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="flex gap-2 sm:flex-col sm:shrink-0">
                  <Link
                    to={`/my-products/edit/${p._id}`}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget({ id: p._id, name: p.name })
                    }
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          role="presentation"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-desc"
            className="max-w-md w-full rounded-2xl border border-brand-100 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <h2
                id="delete-dialog-title"
                className="text-lg font-bold text-slate-900"
              >
                Remove listing?
              </h2>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p id="delete-dialog-desc" className="mt-3 text-slate-600 text-sm">
              This will permanently delete{" "}
              <span className="font-semibold text-slate-800">
                “{deleteTarget.name}”
              </span>
              . This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Delete listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;
