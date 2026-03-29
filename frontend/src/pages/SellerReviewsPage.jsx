import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star, Filter, Sparkles, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";

const SellerReviewsPage = () => {
  const { sellerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [trustScore, setTrustScore] = useState(null);
  const [aiSummary, setAiSummary] = useState({ summary: "", tags: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, scoreRes, sumRes] = await Promise.all([
          fetch(`http://localhost:5000/api/reviews/seller/${sellerId}`),
          fetch(`http://localhost:5000/api/reviews/trust-score/${sellerId}`),
          fetch(`http://localhost:5000/api/reviews/summary/${sellerId}`)
        ]);
        
        const revData = await revRes.json();
        const scoreData = await scoreRes.json();
        const sumData = await sumRes.json();

        if (revData.success) setReviews(revData.data);
        if (scoreData.success) setTrustScore(scoreData);
        setAiSummary(sumData);
      } catch (err) {
        console.error("Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sellerId]);

  const filteredReviews = filter === "all" ? reviews : reviews.filter(r => r.rating === parseInt(filter));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ratings & Reviews</h1>
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-500">
            {reviews.length} Total Reviews
          </div>
        </div>

        {/* --- AI INSIGHT CARD (Modern Glow Style) --- */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-900 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">AI Experience Insight</span>
              </div>
            </div>
            <div className="p-8">
              <p className="text-xl text-slate-700 leading-relaxed font-medium italic mb-6">
                "{aiSummary.summary}"
              </p>
              <div className="flex flex-wrap gap-3">
                {aiSummary.tags?.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold border border-indigo-100 uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- TRUST SCORE WIDGET (Glassmorphism) --- */}
        {trustScore && (
          <div className="bg-white/70 backdrop-blur-md border border-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle cx="72" cy="72" r="65" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <circle cx="72" cy="72" r="65" stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={408} strokeDashoffset={408 - (trustScore.trustScore / 100) * 408}
                  strokeLinecap="round" className="text-indigo-600 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{trustScore.trustScore}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trust Index</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 w-full">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Seller Status: <span className="text-indigo-600">{trustScore.grade}</span></h3>
                <p className="text-slate-500 text-sm">Calculated based on recent verified transactions and sentiment.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 uppercase">
                    <span>Positive Feedback</span>
                    <span>{trustScore.breakdown.positivePercent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${trustScore.breakdown.positivePercent}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 uppercase">
                    <span>Content Safety</span>
                    <span>{trustScore.breakdown.notFlaggedPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${trustScore.breakdown.notFlaggedPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- FILTER BAR --- */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm mr-2">
            <Filter className="w-5 h-5 text-slate-400" />
          </div>
          {["all", "5", "4", "3", "2", "1"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === f ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-300"}`}>
              {f === "all" ? "All Reviews" : `${f} Stars`}
            </button>
          ))}
        </div>

        {/* --- REVIEWS LIST --- */}
        <div className="grid gap-4">
          {filteredReviews.map((review) => (
            <div key={review._id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">
                    {review.buyerId?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${review.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {review.sentiment}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerReviewsPage;