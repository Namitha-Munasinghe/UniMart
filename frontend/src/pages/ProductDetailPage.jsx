import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MessageSquareMore,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const DUMMY_SELLER_ID = "000000000000000000000001";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const currentUserId = user?._id || user?.id || null;
  const sellerId = useMemo(() => currentUserId || DUMMY_SELLER_ID, [currentUserId]);

  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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
        setActiveImageIndex(0);
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
            <div className="space-y-4">
              <div className="h-[420px] rounded-[1.75rem] bg-indigo-100" />
              <div className="h-24 rounded-[1.75rem] bg-slate-100" />
            </div>
            <div className="space-y-4">
              <div className="h-6 rounded bg-indigo-100" />
              <div className="h-40 rounded bg-indigo-50" />
              <div className="h-32 rounded bg-slate-100" />
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

  const ownerIdString =
    typeof product.sellerId === "object" && product.sellerId !== null
      ? String(product.sellerId._id ?? "")
      : String(product.sellerId ?? "");
  const isOwner = Boolean(currentUserId && ownerIdString && ownerIdString === String(currentUserId));

  const sellerReviewTargetId =
    typeof product.sellerId === "object" ? product.sellerId?._id : product.sellerId;

  const handleWriteReview = () => {
    if (!product?._id || !sellerReviewTargetId) {
      toast.error("Unable to open review form for this product.");
      return;
    }
    navigate(`/submit-review/${product._id}/${sellerReviewTargetId}`);
  };

  const handleViewSellerReputation = () => {
    if (!sellerReviewTargetId) {
      toast.error("Seller information is not available for this listing.");
      return;
    }
    navigate(`/seller/${sellerReviewTargetId}`);
  };

  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  const safeIndex = images.length ? Math.min(activeImageIndex, images.length - 1) : 0;
  const activeImageUrl = images[safeIndex] || "";
  const hasMultipleImages = images.length > 1;

  const showPrevImage = () => {
    if (!images.length) return;
    setActiveImageIndex((index) => (index - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    if (!images.length) return;
    setActiveImageIndex((index) => (index + 1) % images.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-5 shadow-xl">
              <h2 className="sr-only">Product images</h2>
              <div className="relative">
                <img
                  src={activeImageUrl}
                  alt={product.name}
                  className="h-[420px] w-full rounded-[1.75rem] object-cover"
                />

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={showPrevImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-800 shadow-md ring-1 ring-indigo-100 transition hover:bg-white"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-800 shadow-md ring-1 ring-indigo-100 transition hover:bg-white"
                    >
                      <ChevronRight size={22} />
                    </button>
                    <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-950/75 px-3 py-1 text-xs font-medium text-white">
                      {safeIndex + 1} / {images.length}
                    </p>
                  </>
                )}
              </div>

              {hasMultipleImages && (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {images.map((image, index) => (
                    <button
                      key={`${index}-${image}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`overflow-hidden rounded-2xl border-2 transition ${
                        safeIndex === index ? "border-indigo-500" : "border-transparent"
                      }`}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-lg font-bold text-gray-800">Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-600">{product.description}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800">Listing overview</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-indigo-700 px-5 py-5 text-white shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">Product name</p>
                  <h3 className="mt-3 text-2xl font-bold">{product.name}</h3>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Tag size={18} className="text-indigo-600" />
                    <span className="font-medium">Price</span>
                  </div>
                  <span className="font-semibold text-indigo-700">LKR {product.price}</span>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-indigo-50 px-4 py-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <User size={18} className="shrink-0 text-indigo-600" />
                    <span className="font-medium">Seller</span>
                  </div>
                  <span className="text-right font-semibold text-indigo-700">
                    {product.seller?.name || "Listing owner"}
                  </span>
                </div>

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
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800">Seller actions</h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Schedule a meetup with the seller for this specific product and keep the request synced across the buyer and seller dashboards.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-indigo-50 px-5 py-3 text-sm font-medium text-indigo-700">
                  Seller: {product.seller?.name || "Listing owner"}
                </div>
                {user ? (
                  <Link
                    to={isOwner ? `/schedule-meeting/seller/${product._id}` : `/schedule-meeting/buyer/${product._id}`}
                    state={{ product }}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white ${
                      isOwner ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    <MessageSquareMore size={18} />
                    {isOwner ? "View Seller Requests" : "Schedule Meeting"}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                  >
                    <MessageSquareMore size={18} />
                    Login to Schedule
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={handleViewSellerReputation}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
              >
                <ShieldCheck size={18} className="text-indigo-600" />
                View Seller Reputation
              </button>

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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-md ring-2 ring-indigo-100 transition hover:bg-indigo-800 hover:shadow-lg"
                >
                  <Star size={16} className="fill-white" />
                  Write a Review
                </button>
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-indigo-500">
                {isOwner ? "Seller dashboard ready" : "Buyer scheduling ready"}
              </p>
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
