import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles, ArrowRight, Loader } from "lucide-react";
import { PRODUCT_CATEGORIES, categoryDisplayName } from "../constants/categories";
import { useUserStore } from "../stores/useUserStore";

const MINIMUM_INTERESTS = 3;

const InterestSelectionPage = () => {
  const navigate = useNavigate();
  const { user, updateInterests, loading } = useUserStore();

  const [selectedInterests, setSelectedInterests] = useState(
    user?.interests || []
  );

  const selectedCount = selectedInterests.length;
  const remainingCount = Math.max(MINIMUM_INTERESTS - selectedCount, 0);

  const helperText = useMemo(() => {
    if (selectedCount >= MINIMUM_INTERESTS) {
      return "You're all set! Continue to explore your personalized marketplace.";
    }
    return `Select ${remainingCount} more ${
      remainingCount === 1 ? "category" : "categories"
    } to continue.`;
  }, [selectedCount, remainingCount]);

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateInterests(selectedInterests);
    if (success) navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        

        {/* MAIN CARD */}
        <div className="mt-8 rounded-[2rem] border border-indigo-100 bg-white/90 p-6 shadow-lg sm:p-8">
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Select your interests
            </h2>
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* CATEGORY GRID */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {PRODUCT_CATEGORIES.map((category) => {
                const selected = selectedInterests.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleInterest(category)}
                    className={`group overflow-hidden rounded-[1.75rem] border p-5 text-left transition ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 shadow-lg"
                        : "border-indigo-100 bg-white hover:-translate-y-1 hover:shadow-xl"
                    }`}
                  >
                    {/* TOP BADGE */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          selected
                            ? "bg-emerald-400 text-gray-900"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {selected ? "Selected" : "Select"}
                      </span>

                      {selected ? (
                        <Check className="text-green-600" size={18} />
                      ) : (
                        <Sparkles className="text-indigo-400" size={18} />
                      )}
                    </div>

                    {/* TITLE */}
                    <h3 className="mt-6 text-lg font-bold text-gray-800">
                      {categoryDisplayName(category)}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      Explore listings related to this category.
                    </p>

                    {/* BOTTOM BAR */}
                    <div className="mt-6 h-2 w-full rounded-full bg-indigo-100">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          selected ? "w-full bg-indigo-600" : "w-0"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ACTION BAR */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-gray-600">
                {helperText}
              </p>

              <button
                type="submit"
                disabled={loading || selectedCount < MINIMUM_INTERESTS}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  "Continue"
                )}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default InterestSelectionPage;