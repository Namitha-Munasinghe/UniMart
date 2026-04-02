import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  fetchCategories,
  fetchProduct,
  createProduct,
  updateProduct,
  getSellerId,
} from "../lib/productApi";
import { validateProductForm } from "../lib/formValidation";

const fieldClass = (hasError) =>
  `mt-2 w-full rounded-xl border px-4 py-3 text-slate-900 outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-400 bg-red-50/50 ring-red-200 focus:border-red-500 focus:ring-red-200"
      : "border-brand-200 bg-brand-50/30 ring-brand-500/30 focus:border-brand-500 focus:ring-brand-200"
  }`;

const ProductFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const sellerId = getSellerId();

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    status: "Available",
  });

  const runValidation = useCallback(() => {
    const next = validateProductForm(form, { isEdit });
    setErrors(next);
    return next;
  }, [form, isEdit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(data.categories || []);
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProduct(id);
        const p = data.product;
        if (!cancelled && p) {
          setForm({
            name: p.name || "",
            description: p.description || "",
            price: String(p.price ?? ""),
            image: p.image || "",
            category: p.category || "",
            status: p.status || "Available",
          });
        }
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const next = validateProductForm(form, { isEdit });
    if (next[name]) setErrors((prev) => ({ ...prev, [name]: next[name] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      description: true,
      price: true,
      image: true,
      category: true,
      ...(isEdit && { status: true }),
    });
    const next = runValidation();
    if (Object.keys(next).length > 0) {
      toast.error("Fix the highlighted fields.");
      return;
    }

    const price = Number(form.price);
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      image: form.image.trim(),
      category: form.category,
      sellerId,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await updateProduct(id, body);
        toast.success("Product updated.");
      } else {
        await createProduct(body);
        toast.success("Product published.");
      }
      navigate("/my-products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const err = (name) => touched[name] && errors[name];

  if (loadingCats || loadingProduct) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-b from-brand-50 to-white">
        <Loader2
          className="h-10 w-10 animate-spin text-brand-600"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-brand-50 via-white to-violet-50/60">
      <div className="max-w-xl mx-auto px-6 py-10 md:py-14">
        <Link
          to="/my-products"
          className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to my products
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-slate-900 tracking-tight">
          {isEdit ? "Edit product" : "Add a product"}
        </h1>
        <p className="mt-2 text-slate-600 text-sm leading-relaxed">
          Fields marked with an asterisk are required. Your listing uses a
          seller ID until sign-in is connected.
        </p>

        <form
          onSubmit={onSubmit}
          noValidate
          className="mt-10 space-y-6 rounded-2xl border border-brand-100 bg-white p-6 md:p-8 shadow-lg shadow-brand-200/20"
          aria-labelledby="product-form-title"
        >
          <h2 id="product-form-title" className="sr-only">
            {isEdit ? "Edit product form" : "New product form"}
          </h2>

          <div>
            <label
              htmlFor="product-name"
              className="block text-sm font-medium text-slate-700"
            >
              Product name <span className="text-red-600">*</span>
            </label>
            <input
              id="product-name"
              name="name"
              type="text"
              autoComplete="off"
              value={form.name}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={Boolean(err("name"))}
              aria-describedby={err("name") ? "err-name" : undefined}
              className={fieldClass(err("name"))}
            />
            {err("name") && (
              <p id="err-name" className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-description"
              className="block text-sm font-medium text-slate-700"
            >
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="product-description"
              name="description"
              value={form.description}
              onChange={onChange}
              onBlur={onBlur}
              rows={4}
              aria-invalid={Boolean(err("description"))}
              aria-describedby={err("description") ? "err-description" : undefined}
              className={`${fieldClass(err("description"))} resize-y min-h-[100px]`}
            />
            <p className="mt-1 text-xs text-slate-500">
              {form.description.length}/5,000 characters (minimum 10).
            </p>
            {err("description") && (
              <p
                id="err-description"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-price"
              className="block text-sm font-medium text-slate-700"
            >
              Price in LKR <span className="text-red-600">*</span>
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.price}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={Boolean(err("price"))}
              aria-describedby={err("price") ? "err-price" : undefined}
              className={fieldClass(err("price"))}
            />
            {err("price") && (
              <p id="err-price" className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.price}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-image"
              className="block text-sm font-medium text-slate-700"
            >
              Image URL <span className="text-red-600">*</span>
            </label>
            <input
              id="product-image"
              name="image"
              type="url"
              inputMode="url"
              placeholder="https://example.com/photo.jpg"
              value={form.image}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={Boolean(err("image"))}
              aria-describedby={err("image") ? "err-image" : undefined}
              className={fieldClass(err("image"))}
            />
            <p className="mt-1 text-xs text-slate-500">
              Use a direct link to an image (https).
            </p>
            {err("image") && (
              <p id="err-image" className="mt-1.5 text-sm text-red-600" role="alert">
                {errors.image}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="product-category"
              className="block text-sm font-medium text-slate-700"
            >
              Category <span className="text-red-600">*</span>
            </label>
            <select
              id="product-category"
              name="category"
              value={form.category}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={Boolean(err("category"))}
              aria-describedby={err("category") ? "err-category" : undefined}
              className={fieldClass(err("category"))}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {err("category") && (
              <p
                id="err-category"
                className="mt-1.5 text-sm text-red-600"
                role="alert"
              >
                {errors.category}
              </p>
            )}
          </div>

          {isEdit && (
            <div>
              <label
                htmlFor="product-status"
                className="block text-sm font-medium text-slate-700"
              >
                Listing status
              </label>
              <select
                id="product-status"
                name="status"
                value={form.status}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(err("status"))}
                aria-describedby={err("status") ? "err-status" : undefined}
                className={fieldClass(err("status"))}
              >
                <option value="Available">Available</option>
                <option value="Sold">Sold</option>
                <option value="Expired">Expired</option>
              </select>
              {err("status") && (
                <p
                  id="err-status"
                  className="mt-1.5 text-sm text-red-600"
                  role="alert"
                >
                  {errors.status}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 py-3.5 font-semibold text-white shadow-glow-sm transition hover:from-brand-500 hover:to-indigo-500 disabled:opacity-60"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductFormPage;
