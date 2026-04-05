import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenText,
  Check,
  HandHelping,
  House,
  Loader,
  Sparkles,
} from "lucide-react";
import { PRODUCT_CATEGORIES, categoryDisplayName } from "../constants/categories";
import { useUserStore } from "../stores/useUserStore";

const MINIMUM_INTERESTS = 3;

const INTEREST_META = {
  laptops: {
    colors: "from-sky-500 to-blue-600",
    miniLabel: "LT",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80",
  },
  mobiles: {
    colors: "from-rose-500 to-orange-400",
    miniLabel: "MB",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80",
  },
  electronics: {
    colors: "from-violet-500 to-indigo-600",
    miniLabel: "EL",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
  },
  accessories: {
    colors: "from-amber-500 to-orange-400",
    miniLabel: "AC",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80",
  },
  "notes/books": {
    colors: "from-emerald-500 to-teal-500",
    miniLabel: "NB",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80",
  },
  "boarding/rooms": {
    colors: "from-fuchsia-500 to-pink-500",
    miniLabel: "BR",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80",
  },
  services: {
    colors: "from-indigo-500 to-cyan-500",
    miniLabel: "SV",
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=400&q=80",
  },
};

const InterestSelectionPage = () => {
  const navigate = useNavigate();
  const { user, updateInterests, loading } = useUserStore();
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);

  const selectedCount = selectedInterests.length;
  const remainingCount = Math.max(MINIMUM_INTERESTS - selectedCount, 0);

  const helperText = useMemo(() => {
    if (selectedCount >= MINIMUM_INTERESTS) {
      return "Everything is ready. Continue to see recommendations based on your picks.";
    }

    return `Choose ${remainingCount} more ${remainingCount === 1 ? "category" : "categories"} to continue.`;
  }, [remainingCount, selectedCount]);

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const success = await updateInterests(selectedInterests);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.16),_transparent_24%),linear-gradient(135deg,#eef2ff_0%,#ffffff_48%,#f8fafc_100%)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/92 shadow-[0_28px_80px_rgba(79,70,229,0.16)] backdrop-blur"
        >
          <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-cyan-500 p-5 text-white sm:p-6">
              <div className="absolute inset-0 opacity-25">
                <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-cyan-200 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-indigo-200 blur-3xl" />
              </div>
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/95">
                  <Sparkles size={13} />
                  Personalized Feed
                </div>

                <h1 className="mt-4 text-xl font-bold leading-tight sm:text-2xl">
                  Tell us what you like
                </h1>
                <p className="mt-2.5 text-sm leading-6 text-white/85">
                  Pick the categories you are most interested in. We will use them to show better recommendations after the latest listings.
                </p>

                <div className="mt-5 rounded-[1.25rem] border border-white/15 bg-white/10 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">Selected</p>
                      <p className="mt-1.5 text-2xl font-bold">{selectedCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Minimum</p>
                      <p className="mt-1 text-lg font-bold">{MINIMUM_INTERESTS}</p>
                    </div>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-white/15 shadow-inner">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-white to-cyan-100 transition-all"
                      style={{ width: `${Math.min((selectedCount / MINIMUM_INTERESTS) * 100, 100)}%` }}
                    />
                  </div>

                  <p className="mt-2.5 text-sm text-white/85">{helperText}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedInterests.length > 0 ? (
                    selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-white/15 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {categoryDisplayName(interest)}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white/70">No categories selected yet.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,250,252,0.84))] p-4 sm:p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">Quick Setup</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Choose at least {MINIMUM_INTERESTS}</h2>
                <p className="mt-2 text-sm text-slate-500">Tap the categories that fit you best. You can update them later.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {PRODUCT_CATEGORIES.map((category, index) => {
                    const selected = selectedInterests.includes(category);
                    const meta = INTEREST_META[category];

                    return (
                      <motion.button
                        key={category}
                        type="button"
                        onClick={() => toggleInterest(category)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.22 }}
                        className={`group relative overflow-hidden rounded-[1rem] border p-2.5 text-left transition ${
                          selected
                            ? "border-indigo-500 bg-indigo-50 shadow-[0_18px_34px_rgba(99,102,241,0.16)] ring-1 ring-indigo-200"
                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg"
                        }`}
                      >
                        <div
                          className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.colors} ${
                            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          } transition-opacity`}
                        />

                        <div className="flex items-start justify-between gap-3">
                          <div className="relative h-24 w-24 overflow-hidden rounded-[1.1rem] border border-slate-200 bg-slate-100 shadow-sm">
                            <img
                              src={meta.image}
                              alt={categoryDisplayName(category)}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className={`absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t ${meta.colors} opacity-80`} />
                            <div className="absolute left-2 top-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white/90 px-1.5 text-[10px] font-bold text-slate-700">
                              {meta.miniLabel}
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                              selected ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {selected ? <Check size={12} /> : <Sparkles size={12} />}
                            {selected ? "Added" : "Select"}
                          </span>
                        </div>

                        <div className="mt-3">
                          <h3 className="text-sm font-bold text-slate-900">{categoryDisplayName(category)}</h3>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-[1.15rem] border border-indigo-100 bg-[linear-gradient(135deg,rgba(238,242,255,0.96),rgba(255,255,255,1),rgba(240,249,255,0.96))] p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">{helperText}</p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || selectedCount < MINIMUM_INTERESTS}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:from-indigo-700 hover:to-cyan-600 disabled:cursor-not-allowed disabled:from-indigo-300 disabled:to-cyan-300"
                  >
                    {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Continue to UniMart"}
                    {!loading && <ArrowRight size={16} />}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterestSelectionPage;
