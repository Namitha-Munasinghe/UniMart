import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const PRODUCT_CATEGORIES = [
  "mobiles",
  "laptops",
  "electronics",
  "accessories",
  "notes/books",
  "boarding/rooms",
  "services",
];

const PRODUCT_STATUSES = ["Available", "Sold", "Hidden"];
const DUMMY_SELLER_ID = "000000000000000000000001";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  category: PRODUCT_CATEGORIES[0],
  images: [],
  keptImageUrls: [],
  status: "Available",
};

const MyProductsPage = () => {
  const { user } = useUserStore();
  const sellerId = useMemo(() => user?._id || user?.id || DUMMY_SELLER_ID, [user]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [suggestion, setSuggestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/products/my-products", {
        headers: {
          "x-seller-id": sellerId,
        },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [sellerId]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProductId(null);
    setSuggestion(null);
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "images") {
      setForm((current) => {
        const maxNew = Math.max(0, 5 - current.keptImageUrls.length);
        const next = Array.from(files || []).slice(0, maxNew);
        return { ...current, images: next };
      });
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSuggestPrice = async () => {
    if (!form.category) {
      toast.error("Choose a category first");
      return;
    }

    try {
      setSuggestingPrice(true);
      const response = await axios.post("/products/suggest-price", {
        category: form.category,
        name: form.name,
        description: form.description,
      });

      const result = response.data.data;
      setSuggestion(result);
      setForm((current) => ({
        ...current,
        price: result?.suggestedPrice ? String(result.suggestedPrice) : current.price,
      }));
      toast.success("Price suggestion added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to suggest a price");
    } finally {
      setSuggestingPrice(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!editingProductId && form.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    if (editingProductId && form.keptImageUrls.length + form.images.length < 1) {
      toast.error("Keep at least one image or upload a new one");
      return;
    }

    try {
      setSaving(true);

      const payload = new FormData();
      payload.append("sellerId", sellerId);
      payload.append("name", form.name);
      payload.append("description", form.description);
      payload.append("price", form.price);
      payload.append("category", form.category);
      payload.append("status", form.status);
      if (editingProductId) {
        payload.append("keptImageUrls", JSON.stringify(form.keptImageUrls));
      }

      form.images.forEach((image) => {
        payload.append("images", image);
      });

      if (editingProductId) {
        await axios.put(`/products/${editingProductId}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-seller-id": sellerId,
          },
        });
        toast.success("Product updated");
      } else {
        await axios.post("/products", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-seller-id": sellerId,
          },
        });
        toast.success("Product created");
      }

      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save product",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);
    setSuggestion(null);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      images: [],
      keptImageUrls: [...(product.images || [])],
      status: product.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeKeptImage = (url) => {
    setForm((current) => ({
      ...current,
      keptImageUrls: current.keptImageUrls.filter((u) => u !== url),
    }));
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`/products/${productId}`, {
        headers: {
          "x-seller-id": sellerId,
        },
      });
      toast.success("Product deleted");
      setDeleteTarget(null);
      if (editingProductId === productId) {
        resetForm();
      }
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-100">Seller Dashboard</p>
              <h1 className="mt-3 text-4xl font-bold">My Products</h1>
              <p className="mt-3 max-w-2xl text-sm text-indigo-50/90">
                Manage only the items you created, upload product images, and keep listings fresh for the public marketplace.
              </p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-2xl border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Back to Profile
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {editingProductId ? "Edit Product" : "Add Product"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Up to 5 images per product. When editing, remove old thumbnails or add new files.
                </p>
              </div>
              {editingProductId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product name"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                required
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item or service"
                rows="5"
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                required
              />

              <div className="grid gap-4 md:grid-cols-2">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                  required
                >
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                >
                  {PRODUCT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500"
                  required
                />

                <button
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={suggestingPrice}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Sparkles size={18} />
                  {suggestingPrice ? "Thinking..." : "Suggest Price"}
                </button>
              </div>

              {editingProductId && form.keptImageUrls.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {form.keptImageUrls.map((url) => (
                    <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeKeptImage(url)}
                        className="absolute right-1 top-1 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                disabled={form.keptImageUrls.length + form.images.length >= 5}
                className="rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-slate-500">
                Slots left: {Math.max(0, 5 - form.keptImageUrls.length - form.images.length)} / 5
              </p>

              {suggestion && (
                <div className="rounded-2xl bg-amber-50 p-4 text-sm text-slate-700">
                  Suggested price: <span className="font-semibold">LKR {suggestion.suggestedPrice}</span>.{" "}
                  {suggestion.reasoning}
                </div>
              )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Plus size={18} />
                  {saving ? "Saving..." : editingProductId ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">My Listings</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Only products created by this seller are shown here.
                </p>
              </div>
              <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
                {products.length} products
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">Loading your products...</p>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-indigo-200 p-6 text-sm text-slate-500">
                  No product added yet. Use the form on the left to create your first listing.
                </div>
              ) : (
                products.map((product) => (
                  <div key={product._id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                            {product.category}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              product.status === "Available"
                                ? "bg-emerald-100 text-emerald-700"
                                : product.status === "Expired"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                        <p className="mt-3 text-base font-semibold text-indigo-700">LKR {product.price}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          Expires on {new Date(product.expiresAt).toLocaleDateString()}
                        </p>
                        <Link
                          to={`/products/${product._id}`}
                          className="mt-3 inline-flex text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                          View detail page
                        </Link>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: product._id, name: product.name })}
                          className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-600"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Delete product?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Remove &quot;{deleteTarget.name}&quot;? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteTarget.id)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;
