import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, Minus, MessageCircle, Filter } from "lucide-react";

const SellerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filter, setFilter] = useState("all");
  const [trustScore, setTrustScore] = useState(null);

  const sellerId = "507f1f77bcf86cd799439012";

  useEffect(() => {
    fetchReviews();
    fetchTrustScore();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/seller/${sellerId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustScore = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reviews/trust-score/${sellerId}`
      );
      const data = await res.json();
      if (data.success) {
        setTrustScore(data);
      }
    } catch (error) {
      console.error("Trust Score Error:", error);
    }
  };

  const getRatingCount = (star) =>
    reviews.filter((r) => r.rating === star).length;

  const getRatingPercent = (star) =>
    totalReviews > 0 ? (getRatingCount(star) / totalReviews) * 100 : 0;

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => r.rating === parseInt(filter));

  const getSentimentIcon = (sentiment) => {
    if (sentiment === "positive") return <ThumbsUp className="w-3 h-3" />;
    if (sentiment === "negative") return <ThumbsDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getSentimentStyles = (sentiment) => {
    if (sentiment === "positive") return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (sentiment === "negative") return "bg-rose-50 text-rose-600 border-rose-200";
    return "bg-gray-50 text-gray-500 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-gray-400 text-sm">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800 mb-6">
          Ratings & Reviews
        </h1>

        {/* ✅ Trust Score Widget */}
        {trustScore && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Score Circle */}
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50"
                    fill="none"
                    stroke={
                      trustScore.trustScore >= 80 ? "#4f46e5" :
                      trustScore.trustScore >= 60 ? "#06b6d4" :
                      trustScore.trustScore >= 40 ? "#f59e0b" : "#ef4444"
                    }
                    strokeWidth="10"
                    strokeDasharray={`${(trustScore.trustScore / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-gray-900">
                    {trustScore.trustScore}
                  </span>
                  <span className="text-xs text-gray-400 font-bold">/100</span>
                </div>
              </div>

              {/* Score Details */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Trust Score</h3>
                    <p className="text-sm text-gray-500">{trustScore.grade}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                    trustScore.trustScore >= 80 ? "bg-indigo-50 text-indigo-600" :
                    trustScore.trustScore >= 60 ? "bg-cyan-50 text-cyan-600" :
                    trustScore.trustScore >= 40 ? "bg-yellow-50 text-yellow-600" :
                    "bg-red-50 text-red-600"
                  }`}>
                    {trustScore.trustScore >= 80 ? "Excellent ⭐" :
                     trustScore.trustScore >= 60 ? "Good 👍" :
                     trustScore.trustScore >= 40 ? "Average 😐" :
                     "Needs Improvement ⚠️"}
                  </div>
                </div>

                {/* Breakdown Bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Average Rating</span>
                      <span className="font-bold">{trustScore.breakdown.averageRating}/5</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                        style={{ width: `${(trustScore.breakdown.averageRating / 5) * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Positive Reviews</span>
                      <span className="font-bold">{trustScore.breakdown.positivePercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${trustScore.breakdown.positivePercent}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Total Reviews</span>
                      <span className="font-bold">{trustScore.breakdown.totalReviews}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(trustScore.breakdown.totalReviews / 50 * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Content Safety</span>
                      <span className="font-bold">{trustScore.breakdown.notFlaggedPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="h-full bg-yellow-500 rounded-full transition-all duration-700"
                        style={{ width: `${trustScore.breakdown.notFlaggedPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-8 items-start">
            <div className="text-center min-w-[100px]">
              <div className="text-5xl font-black text-gray-900">
                {parseFloat(averageRating).toFixed(1)}
              </div>
              <div className="text-gray-400 text-sm">/5</div>
              <div className="flex justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                  }`} />
                ))}
              </div>
              <div className="text-gray-400 text-xs">{totalReviews} Ratings</div>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <div className="flex gap-0.5 min-w-[60px]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-2.5 h-2.5 ${
                        s <= star ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                      }`} />
                    ))}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${getRatingPercent(star)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 min-w-[30px] text-right">
                    {getRatingCount(star)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 text-xs font-semibold">
                {reviews.filter((r) => r.sentiment === "positive").length} Positive
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full">
              <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
              <span className="text-rose-700 text-xs font-semibold">
                {reviews.filter((r) => r.sentiment === "negative").length} Negative
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
              <Minus className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-600 text-xs font-semibold">
                {reviews.filter((r) => r.sentiment === "neutral").length} Neutral
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm mr-2">
              <Filter className="w-4 h-4" />
              <span>Filter:</span>
            </div>
            {["all", "5", "4", "3", "2", "1"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                  filter === f
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                {f === "all" ? "All Stars" : `${f} ★`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-700">
            Product Reviews
            <span className="text-gray-400 font-normal ml-2 text-sm">
              ({filteredReviews.length})
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center border border-dashed border-gray-200">
              <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <div className="text-gray-400">No reviews for this filter</div>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {review.comment.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex gap-0.5 mb-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-200"
                          }`} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${getSentimentStyles(review.sentiment)}`}>
                    {getSentimentIcon(review.sentiment)}
                    {review.sentiment}
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {review.comment}
                </p>

                {review.proofImages && review.proofImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {review.proofImages.map((img, index) => (
                      <div key={index} className="rounded-xl overflow-hidden border border-gray-100 aspect-square">
                        <img src={img} alt={`Proof ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                )}

                {review.adminStatus === "pending" && (
                  <div className="mt-3 text-xs text-yellow-600 bg-yellow-50 border border-yellow-100 px-3 py-1 rounded-full inline-block">
                    ⏳ Pending Review
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerReviewsPage;