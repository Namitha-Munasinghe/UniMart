import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CalendarRange, Package, ShoppingBag, Store } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const sectionCardClass =
  "rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]";

const MotionDiv = motion.div;
const DUMMY_SELLER_ID = "000000000000000000000001";
const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2364758b' font-family='Arial, sans-serif' font-size='28'%3EUniMart%3C/text%3E%3C/svg%3E";

const formatCreatedAt = (value) =>
  new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const groupMeetingsByProductId = (meetings) =>
  meetings.reduce((accumulator, meeting) => {
    const product = meeting.product;
    const productId = product?._id || meeting.productId;

    if (!productId) {
      return accumulator;
    }

    if (!accumulator[productId]) {
      accumulator[productId] = [];
    }

    accumulator[productId].push(meeting);
    return accumulator;
  }, {});

const MyMeetingsPage = () => {
  const { user } = useUserStore();
  const sellerId = user?._id || user?.id || DUMMY_SELLER_ID;

  const [myProducts, setMyProducts] = useState([]);
  const [buyerMeetings, setBuyerMeetings] = useState([]);
  const [sellerMeetings, setSellerMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [productsResponse, buyerMeetingsResponse, sellerMeetingsResponse] = await Promise.all([
          axios.get("/products/my-products", {
            headers: {
              "x-seller-id": sellerId,
            },
          }),
          axios.get("/meetings/buyer"),
          axios.get("/meetings/seller"),
        ]);

        setMyProducts(productsResponse.data.data || []);
        setBuyerMeetings(buyerMeetingsResponse.data.data || []);
        setSellerMeetings(sellerMeetingsResponse.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load your meetings");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sellerId]);

  const sellerMeetingsByProductId = useMemo(() => groupMeetingsByProductId(sellerMeetings), [sellerMeetings]);
  const buyerMeetingsByProductId = useMemo(() => groupMeetingsByProductId(buyerMeetings), [buyerMeetings]);

  const sellingProducts = useMemo(
    () =>
      myProducts.map((product) => ({
        ...product,
        meetingCount: sellerMeetingsByProductId[product._id]?.length || 0,
        pendingCount:
          sellerMeetingsByProductId[product._id]?.filter((meeting) => meeting.status === "Pending").length || 0,
      })),
    [myProducts, sellerMeetingsByProductId],
  );

  const buyingProducts = useMemo(() => {
    const entries = Object.entries(buyerMeetingsByProductId);

    return entries
      .map(([productId, meetings]) => {
        const product = meetings[0]?.product;

        if (!product) {
          return null;
        }

        return {
          ...product,
          _id: productId,
          meetingCount: meetings.length,
          activeCount: meetings.filter((meeting) => ["Pending", "Confirmed"].includes(meeting.status)).length,
          sellerName: meetings[0]?.seller?.name || "Seller",
        };
      })
      .filter(Boolean);
  }, [buyerMeetingsByProductId]);

  const statCards = [
    {
      label: "Selling Listings",
      value: sellingProducts.length,
      accent: "text-indigo-600",
    },
    {
      label: "Selling Meetings",
      value: sellerMeetings.length,
      accent: "text-emerald-600",
    },
    {
      label: "Buying Meetings",
      value: buyerMeetings.length,
      accent: "text-amber-500",
    },
  ];

  const renderProductImage = (product) => product.images?.[0] || FALLBACK_IMAGE;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f8fafc_45%,#f1f5f9_100%)] px-4 py-8 md:px-6 lg:px-8">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl space-y-10"
      >
        <section className="rounded-[32px] border border-indigo-100 bg-white/80 px-6 py-7 shadow-[0_20px_60px_rgba(79,70,229,0.08)] backdrop-blur md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                <CalendarRange size={16} />
                My Meetings
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Choose a product to view its meetings</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  Your selling side shows all of your listed products. Your buying side shows every product you have already requested a meetup for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* <section className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className={`text-3xl font-bold ${stat.accent}`}>{loading ? "..." : stat.value}</div>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
            </div>
          ))}
        </section> */}

        <section className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Store className="text-indigo-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Selling </h2>
                <p className="text-sm text-slate-500">Open a listed product to see all buyer meeting requests tied to it.</p>
              </div>
            </div>

            <div className={`${sectionCardClass} p-6`}>
              {loading ? (
                <p className="text-sm text-slate-500">Loading your listed products...</p>
              ) : sellingProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  You have not listed any products yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {sellingProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/schedule-meeting/seller/${product._id}`}
                      className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 transition hover:border-indigo-300 hover:bg-indigo-50/40 sm:flex-row"
                    >
                      <img
                        src={renderProductImage(product)}
                        alt={product.name}
                        className="h-28 w-full rounded-2xl object-cover sm:w-36"
                      />
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                              {product.category}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Listed {formatCreatedAt(product.createdAt)} · LKR {product.price}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              {product.meetingCount} total meetings
                            </span>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                              {product.pendingCount} pending
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                            View meetings
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <ShoppingBag className="text-emerald-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Buying </h2>
                <p className="text-sm text-slate-500">Open a product to jump back into its existing buyer meeting scheduler and chat.</p>
              </div>
            </div>

            <div className={`${sectionCardClass} p-6`}>
              {loading ? (
                <p className="text-sm text-slate-500">Loading your buyer meeting products...</p>
              ) : buyingProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  You have not created any buyer meeting requests yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {buyingProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/schedule-meeting/buyer/${product._id}`}
                      state={{ product }}
                      className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40 sm:flex-row"
                    >
                      <img
                        src={renderProductImage(product)}
                        alt={product.name}
                        className="h-28 w-full rounded-2xl object-cover sm:w-36"
                      />
                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {product.category}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Seller: {product.sellerName} · LKR {product.price}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              {product.meetingCount} total meetings
                            </span>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                              {product.activeCount} active
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                            Open scheduler
                            <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
            >
              <Package size={16} />
              Browse more products
            </Link>
          </div>
        </section>
      </MotionDiv>
    </div>
  );
};

export default MyMeetingsPage;
