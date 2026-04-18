import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Edit,
  IdCard,
  LogOut,
  Mail,
  MessageSquareMore,
  Package,
  Phone,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import SellerReviewsPage from "./SellerReviewsPage";
import { PRODUCT_CATEGORIES, categoryDisplayName } from "../constants/categories";
import { useUserStore } from "../stores/useUserStore";

const StatCard = ({ icon: Icon, label, value, hint, accent = "indigo" }) => {
  const accentStyles = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    slate: "bg-slate-100 text-slate-800 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };

  return (
    <div className="rounded-[1.75rem] border border-indigo-100 bg-white p-6 shadow-lg shadow-indigo-100/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
          {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
        </div>
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accentStyles[accent]}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-[1.75rem] border border-indigo-100 bg-white p-6 shadow-lg shadow-indigo-100/30">
    <div className="flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Profile details</p>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      </div>
    </div>
    <div className="mt-6 space-y-4">{children}</div>
  </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-2xl bg-indigo-50/70 px-4 py-3">
    <Icon size={18} className="mt-0.5 shrink-0 text-indigo-600" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value || "Not provided"}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const { user, logout, deleteAccount, loading, updateInterests } = useUserStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [interestDraft, setInterestDraft] = useState([]);
  const reviewsSectionRef = useRef(null);

  if (!user) return null;

  const meetingsPath = user.role !== "admin" ? "/my-meetings" : null;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const canViewSellerReviews = user.role === "seller";
  const interestLabels = Array.isArray(user.interests)
    ? user.interests.map((interest) => categoryDisplayName(interest))
    : [];

  useEffect(() => {
    setInterestDraft(Array.isArray(user?.interests) ? user.interests : []);
  }, [user?.interests]);

  const handleToggleReviews = () => {
    setShowReviews((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
      return next;
    });
  };

  const toggleDraftInterest = (interest) => {
    setInterestDraft((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSaveInterests = async () => {
    const success = await updateInterests(interestDraft);
    if (success) {
      setEditingInterests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-6xl"
      >
        <section className="overflow-hidden rounded-[2rem] bg-indigo-700 text-white shadow-2xl shadow-indigo-300/40">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-10 md:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-100">My profile</p>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{user.name}</h1>
                    {user.role === "admin" && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/15">
                        <ShieldCheck size={16} />
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-indigo-100 sm:text-base">
                    Keep your academic and contact details current so buyers and sellers can trade with confidence.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15">
                      {user.studentId}
                    </span>
                    
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 self-end">
              <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Member since</p>
                <p className="mt-3 text-xl font-bold">{joinedDate}</p>
                <p className="mt-2 text-sm text-indigo-100/90">Today is {today}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/my-products" className="flex-1 min-w-[180px]">
                  <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50">
                    <Package size={18} />
                    My Products
                  </button>
                </Link>
                {canViewSellerReviews && (
                  <button
                    type="button"
                    onClick={handleToggleReviews}
                    className="flex flex-1 min-w-[180px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15"
                  >
                    <Star size={18} />
                    {showReviews ? "Hide Reviews" : "View Reviews"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard
            icon={Star}
            label="Seller rating"
            value={`${(user.rating ?? 0).toFixed(1)} / 5`}
            hint={`Based on ${user.totalReviews ?? 0} reviews`}
          />
          <StatCard icon={UserRound} label="Account role" value={user.role} hint="Current marketplace access level" accent="slate" />
          <StatCard
            icon={ShieldCheck}
            label="Account status"
            value={user.isBlocked ? "Blocked" : "Active"}
            hint={user.isBlocked ? "This account currently has restrictions." : "Your account is in good standing."}
            accent={user.isBlocked ? "slate" : "emerald"}
          />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <InfoCard title="Academic information" icon={School}>
            <DetailRow icon={School} label="Faculty" value={user.faculty} />
            <DetailRow icon={IdCard} label="Student ID" value={user.studentId} />
          </InfoCard>

          <InfoCard title="Contact information" icon={Mail}>
            <DetailRow icon={Mail} label="Email address" value={user.email} />
            <DetailRow icon={Phone} label="Phone number" value={user.phone} />
          </InfoCard>
        </section>

        <section className="mt-8 rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-100/30 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <Sparkles size={20} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500">Personalisation</p>
                  <h2 className="text-2xl font-bold text-slate-900">My interests</h2>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                These categories help UniMart surface listings that feel relevant the moment you arrive on the homepage.
              </p>
            </div>

            {editingInterests ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInterestDraft(Array.isArray(user.interests) ? user.interests : []);
                    setEditingInterests(false);
                  }}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || interestDraft.length < 3}
                  onClick={handleSaveInterests}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  Save Interests
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingInterests(true)}
                className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-200"
              >
                Edit Interests
              </button>
            )}
          </div>

          {editingInterests ? (
            <div className="mt-8">
              <p className="mb-4 text-sm text-slate-500">
                Select at least 3 categories so recommendations stay useful and focused.
              </p>
              <div className="flex flex-wrap gap-3">
                {PRODUCT_CATEGORIES.map((interest) => {
                  const selected = interestDraft.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleDraftInterest(interest)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "bg-indigo-600 text-white shadow-md"
                          : "border border-indigo-200 bg-indigo-50/70 text-indigo-800 hover:border-indigo-300 hover:bg-indigo-100"
                      }`}
                    >
                      {categoryDisplayName(interest)}
                      {selected ? <X size={14} /> : null}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm font-medium text-slate-600">Selected: {interestDraft.length}</p>
            </div>
          ) : interestLabels.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {interestLabels.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-slate-500">You have not selected interests yet.</p>
          )}
        </section>

        <section className=" ">
          <div className="h-12" aria-hidden="true"></div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-500"></p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900"></h2>
              <p className="mt-2 text-sm text-slate-500">
                
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/edit-profile">
                <button className="flex items-center gap-2 rounded-2xl bg-indigo-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
                  
                  <Edit size={18} />
                  Edit Profile
                </button>
              </Link>

              {/* {meetingsPath ? (
                <Link to={meetingsPath}>
                  <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700">
                    <MessageSquareMore size={18} />
                    My Meetings
                  </button>
                </Link>
              ) : null} */}

            

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </section>

        {canViewSellerReviews && showReviews ? (
          <div ref={reviewsSectionRef} className="mt-8">
            <SellerReviewsPage sellerId={user._id || user.id} />
          </div>
        ) : null}
      </motion.div>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-indigo-100 bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-500">Danger zone</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">Delete account?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This permanently removes your UniMart account and related activity. Continue only if you are sure.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  const deleted = await deleteAccount();
                  if (deleted) {
                    setShowDeleteConfirm(false);
                  }
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70"
              >
                {loading ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfilePage;
