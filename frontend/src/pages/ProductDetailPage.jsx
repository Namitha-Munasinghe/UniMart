import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, MessageSquareMore, Package, Tag, User } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const DUMMY_SELLER_ID = "000000000000000000000001";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useUserStore();
  const sellerId = useMemo(() => user?._id || user?.id || DUMMY_SELLER_ID, [user]);

  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const images = product?.images?.length ? product.images : [];

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
        setImageIndex(0);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, sellerId]);

  const activeImage = images[imageIndex] || "";

  const showCarousel = images.length > 1;
  const goPrevImage = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const goNextImage = () => setImageIndex((i) => (i + 1) % images.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
        <div className="mx-auto max-w-6xl animate-pulse rounded-2xl bg-white p-5 shadow-xl">
          <div className="grid gap-5 lg:grid-cols-[1.15fr_minmax(260px,340px)] lg:items-stretch">
            <div className="flex h-full min-h-0 flex-col rounded-2xl bg-white p-4 shadow-xl">
              <div className="aspect-[4/3] w-full rounded-xl bg-indigo-100" />
            </div>
            <div className="flex h-full min-h-0 flex-col justify-start rounded-2xl bg-indigo-50/80 p-4">
              <div className="h-7 rounded bg-indigo-100" />
              <div className="mt-3 h-14 rounded bg-indigo-100/80" />
              <div className="mt-3 min-h-0 flex-1 space-y-2 rounded-lg bg-slate-100/80 p-2">
                <div className="h-3 rounded bg-slate-200" />
                <div className="h-3 rounded bg-slate-200" />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
              </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_minmax(260px,340px)] lg:items-stretch">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-xl">
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/90">
              <img
                src={activeImage || images[0]}
                alt={product.name}
                className="h-full w-full object-contain object-center"
              />
              {showCarousel && (
                <>
                  <button
                    type="button"
                    onClick={goPrevImage}
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-700 shadow-md backdrop-blur transition hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={goNextImage}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-indigo-700 shadow-md backdrop-blur transition hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {imageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-col justify-start rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 p-4 text-white shadow-xl">
            <h1 className="text-left text-2xl font-bold leading-tight tracking-tight md:text-[1.65rem]">{product.name}</h1>
            <div className="mt-3 shrink-0 rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-[0.65rem] uppercase tracking-[0.18em] text-indigo-100">Price</p>
              <p className="mt-1 text-2xl font-bold">LKR {product.price}</p>
            </div>
            <p className="mt-3 min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-left text-xs leading-relaxed text-indigo-100 md:text-sm">
              {product.description}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800">Listing overview</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-3.5 py-3">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Tag size={17} className="text-indigo-600" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <span className="text-sm font-semibold capitalize text-indigo-700">{product.category}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-3.5 py-3">
                <div className="flex items-center gap-2.5 text-gray-700">
                  <Package size={17} className="text-indigo-600" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <span className="text-sm font-semibold text-emerald-700">{product.status}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800">Meet the seller</h2>
            <div className="mt-4 flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/40 px-3.5 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <User size={18} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900">
                  {product.seller?.name || "Seller"}
                  {product.seller?.faculty ? (
                    <span className="block text-xs font-normal text-gray-500">{product.seller.faculty}</span>
                  ) : null}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{product.sellerTrustLine}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-xl lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-800">Interested in this item?</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              When messaging goes live, you will be able to reach the seller and arrange a safe meet-up on campus.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 sm:max-w-lg">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white opacity-80"
              >
                <MessageSquareMore size={17} />
                Contact the seller
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white opacity-80"
              >
                <CalendarDays size={17} />
                Schedule a meeting
              </button>
            </div>

            <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-indigo-500">Coming soon</p>
          </div>

          <div className="lg:col-span-2">
            <Link
              to="/"
              className="inline-flex rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
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
