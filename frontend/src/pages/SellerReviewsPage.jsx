import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, MessageCircle, Filter, Sparkles, ShieldCheck, X, Maximize2 } from "lucide-react";

const SellerReviewsPage = () => {
  const { sellerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filter, setFilter] = useState("all");
  const [trustScore, setTrustScore] = useState(null);
  
  // AI Summary & Modal states
  const [aiSummary, setAiSummary] = useState({ summary: "", tags: [] });
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null); // පින්තූරය ලොකුවට පෙන්වන්න

  useEffect(() => {
    if (sellerId) {
      fetchReviews();
      fetchTrustScore();
      fetchAISummary();
    }
  }, [sellerId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/seller/${sellerId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
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
      const res = await fetch(`http://localhost:5000/api/reviews/trust-score/${sellerId}`);
      const data = await res.json();
      if (data.success) setTrustScore(data);
    } catch (error) {
      console.error("Trust Score Error:", error);
    }
  };

  const fetchAISummary = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/summary/${sellerId}`);
      const data = await res.json();
      setAiSummary(data);
    } catch (error) {
      console.error("AI Summary Error:", error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const filteredReviews = filter === "all" ? reviews : reviews.filter((r) => r.rating === parseInt(filter));

  const getSentimentStyles = (sentiment) => {
    if (sentiment === "positive") return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (sentiment === "negative") return "bg-rose-50 text-rose-600 border-rose-200";
    return "bg-gray-50 text-gray-500 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <div className="text-gray-400 text-sm">Loading UniMart Reviews...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        
        <h1 className="text-xl font-bold text-gray-800 mb-6">Ratings & Reviews</h1>

        {/* --- AI SUMMARY CARD --- */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">AI Experience Insight</span>
          </div>
          <div className="p-5">
            {loadingSummary ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic font-medium">
                  "{aiSummary.summary || "Not enough reviews for AI analysis yet."}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {aiSummary.tags?.map((tag, index) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold border border-indigo-100 uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- TRUST SCORE WIDGET --- */}
        {trustScore && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke={trustScore.trustScore >= 70 ? "#4f46e5" : "#f59e0b"} strokeWidth="10" strokeDasharray={`${(trustScore.trustScore / 100) * 314} 314`} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-gray-900">{trustScore.trustScore}</span>
                  <span className="text-xs text-gray-400 font-bold">/100</span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">Trust Score: <span className="text-indigo-600">{trustScore.grade}</span></h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Positive Feedback</span>
                    <span className="font-bold">{trustScore.breakdown.positivePercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${trustScore.breakdown.positivePercent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Content Safety</span>
                    <span className="font-bold">{trustScore.breakdown.notFlaggedPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${trustScore.breakdown.notFlaggedPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FILTER BAR --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-400" />
            {["all", "5", "4", "3", "2", "1"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${filter === f ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                {f === "all" ? "All Reviews" : `${f} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* --- REVIEWS LIST --- */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center border border-dashed border-gray-200">
              <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <div className="text-gray-400">No reviews found for this filter.</div>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">{review.comment.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${getSentimentStyles(review.sentiment)}`}>
                    {review.sentiment}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{review.comment}</p>

                {/* ✅ පින්තූර පෙන්වන කොටස (මෙන්න මේකයි ඔයාට අඩුවෙලා තිබුණේ) */}
                {review.proofImages && review.proofImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {review.proofImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="group relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in"
                        onClick={() => setSelectedImg(img)}
                      >
                        <img src={img} alt="Review proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- IMAGE OVERLAY (Lightbox) --- */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
          <img 
            src={selectedImg} 
            alt="Full size proof" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  );
};

export default SellerReviewsPage;