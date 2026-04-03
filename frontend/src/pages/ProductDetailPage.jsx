import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Clock3, MessageSquareMore, Package, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const DUMMY_SELLER_ID = "000000000000000000000001";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useUserStore();
  const sellerId = useMemo(() => user?._id || user?.id || DUMMY_SELLER_ID, [user]);

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/products/${id}`, {
          headers: {
            "x-seller-id": sellerId,
          },
        });
        setProduct(response.data.data);
        setActiveImage(response.data.data?.images?.[0] || "");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[420px] rounded-[1.75rem] bg-[#BDE8F5]" />
            <div className="space-y-4">
              <div className="h-6 rounded bg-[#BDE8F5]" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
              <div className="h-40 rounded bg-[#BDE8F5]/45" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-transparent px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-lg">
          <Package className="mx-auto h-10 w-10 text-[#4988C4]" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Product not found</h1>
          <p className="mt-2 text-sm text-gray-500">This listing may no longer be available.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-[#1C4D8D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F2854]"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-[#0F2854] via-[#1C4D8D] to-[#4988C4] p-8 text-white shadow-2xl shadow-[#1C4D8D]/20">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#BDE8F5]">Product Details</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#e5f7fc]">{product.description}</p>
            </div>
            <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-[#BDE8F5]">Price</p>
              <p className="mt-2 text-3xl font-bold">LKR {product.price}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] bg-white p-5 shadow-xl">
            <img
              src={activeImage || product.images?.[0]}
              alt={product.name}
              className="h-[420px] w-full rounded-[1.75rem] object-cover"
            />

            {product.images?.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-2xl border-2 transition ${
                      activeImage === image || (!activeImage && index === 0)
                        ? "border-[#1C4D8D]"
                        : "border-transparent"
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800">Listing overview</h2>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-[#BDE8F5]/35 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Tag size={18} className="text-[#1C4D8D]" />
                    <span className="font-medium">Category</span>
                  </div>
                  <span className="font-semibold capitalize text-[#1C4D8D]">{product.category}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#BDE8F5]/35 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Package size={18} className="text-[#1C4D8D]" />
                    <span className="font-medium">Status</span>
                  </div>
                  <span className="font-semibold text-emerald-700">{product.status}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#BDE8F5]/35 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarDays size={18} className="text-[#1C4D8D]" />
                    <span className="font-medium">Listed on</span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#BDE8F5]/35 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock3 size={18} className="text-[#1C4D8D]" />
                    <span className="font-medium">Expires on</span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {new Date(product.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800">Seller actions</h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Contact seller and meeting coordination will be connected in a future feature. This page already keeps the
                action area ready for that flow.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled
                  className="rounded-2xl bg-[#1C4D8D] px-5 py-3 text-sm font-semibold text-white opacity-80"
                >
                  Contact Seller
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0F2854] px-5 py-3 text-sm font-semibold text-white opacity-80"
                >
                  <MessageSquareMore size={18} />
                  Schedule Meeting
                </button>
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#4988C4]">Coming soon</p>
            </div>

            <Link
              to="/"
              className="inline-flex rounded-2xl border border-[#4988C4]/25 bg-white px-5 py-3 text-sm font-semibold text-[#1C4D8D] shadow-sm transition hover:bg-[#BDE8F5]/35"
            >
              Back to latest products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
