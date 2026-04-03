import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock3, MessageSquareMore, Package, Sparkles, Star, Tag } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const DUMMY_SELLER_ID = "000000000000000000000001";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[420px] rounded-[1.75rem] bg-indigo-100" />
            <div className="space-y-4">
              <div className="h-6 rounded bg-indigo-100" />
              <div className="h-4 rounded bg-slate-100" />
              <div className="h-24 rounded bg-slate-100" />
              <div className="h-40 rounded bg-indigo-50" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-lg">
          <Package className="mx-auto h-10 w-10 text-indigo-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">Product not found</h1>
          <p className="mt-2 text-sm text-gray-500">This listing may no longer be available.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const sellerReviewTargetId =
    typeof product.sellerId === "object" ? product.sellerId?._id : product.sellerId;

  const handleWriteReview = () => {
    if (!product?._id || !sellerReviewTargetId) {
      toast.error("Unable to open review form for this product.");
      return;
    }
    navigate(`/submit-review/${product._id}/${sellerReviewTargetId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 p-8 text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-100">Product Details</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-50">{product.description}</p>
            </div>
            <div className="rounded-3xl bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-indigo-100">Price</p>
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
                        ? "border-indigo-500"
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
                <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Tag size={18} className="text-indigo-600" />
                    <span className="font-medium">Category</span>
                  </div>
                  <span className="font-semibold capitalize text-indigo-700">{product.category}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Package size={18} className="text-indigo-600" />
                    <span className="font-medium">Status</span>
                  </div>
                  <span className="font-semibold text-emerald-700">{product.status}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CalendarDays size={18} className="text-indigo-600" />
                    <span className="font-medium">Listed on</span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock3 size={18} className="text-indigo-600" />
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
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white opacity-80"
                >
                  Contact Seller
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white opacity-80"
                >
                  <MessageSquareMore size={18} />
                  Schedule Meeting
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-indigo-700">Enjoyed this product?</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                    <Sparkles size={12} />
                    Recommended
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleWriteReview}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md ring-2 ring-indigo-100 transition hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg"
                >
                  <Star size={16} className="fill-white" />
                  Write a Review
                </button>
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-indigo-500">Coming soon</p>
            </div>

            <Link
              to="/"
              className="inline-flex rounded-2xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
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
