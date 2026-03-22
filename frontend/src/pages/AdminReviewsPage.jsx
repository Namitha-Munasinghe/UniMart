import { useEffect, useMemo, useState } from "react";
import { Star, Check, X, Flag, Filter, AlertTriangle, RefreshCw, BarChart3, ShieldCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/reviews/admin/all");
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      } else {
        toast.error("Unable to load reviews");
      }
    } catch (error) {
      toast.error("Network error loading reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/admin/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        toast.success("Review approved ✅");
        fetchAllReviews();
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/admin/${id}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        toast.success("Review rejected ❌");
        fetchAllReviews();
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const metrics = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter((r) => r.adminStatus === "pending").length,
    flagged: reviews.filter((r) => r.isFlagged).length,
    approved: reviews.filter((r) => r.adminStatus === "approved").length,
  }), [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => (statusFilter === "all" ? true : r.adminStatus === statusFilter))
      .filter((r) => (showFlaggedOnly ? r.isFlagged : true));
  }, [reviews, statusFilter, showFlaggedOnly]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#eff0f5] pb-20 font-sans">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="text-indigo-600" /> Review Moderation
            </h1>
            <p className="text-sm text-gray-500">Manage customer trust and review authenticity</p>
          </div>
          <button 
            onClick={fetchAllReviews} 
            className="flex items-center gap-2 text-sm text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-md transition-all"
          >
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Received", value: metrics.total, color: "border-indigo-500", icon: <BarChart3 className="text-indigo-500" /> },
            { label: "Needs Review", value: metrics.pending, color: "border-orange-500", icon: <ShieldAlert className="text-orange-500" /> },
            { label: "AI Flagged", value: metrics.flagged, color: "border-red-500", icon: <Flag className="text-red-500" /> },
            { label: "Approved", value: metrics.approved, color: "border-green-500", icon: <ShieldCheck className="text-green-500" /> },
          ].map((item, idx) => (
            <div key={idx} className={`bg-white p-5 rounded-xl border-l-4 ${item.color} shadow-sm flex justify-between items-center`}>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{item.label}</p>
                <p className="text-2xl font-bold text-gray-800">{item.value}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded-full">{item.icon}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                  statusFilter === s 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                    : "border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFlaggedOnly(!showFlaggedOnly)}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full border transition ${
              showFlaggedOnly 
                ? "bg-red-50 border-red-200 text-red-600" 
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            <Flag size={14} fill={showFlaggedOnly ? "currentColor" : "none"} /> Flagged Only
          </button>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
            <Filter size={14} /> Showing {filteredReviews.length} Moderation Tasks
          </div>

          {filteredReviews.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <AlertTriangle size={40} className="text-gray-300" />
              <p className="text-gray-500">No reviews found for this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReviews.map((review) => (
                <div key={review._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">

                    {/* ✅ Multiple Images Grid */}
                    {review.proofImages && review.proofImages.length > 0 && (
                      <div className="flex-shrink-0">
                        <div className={`grid gap-1 ${review.proofImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {review.proofImages.slice(0, 4).map((img, index) => (
                            <div 
                              key={index} 
                              className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative"
                            >
                              <img 
                                src={img} 
                                alt={`Proof ${index + 1}`} 
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                              />
                              {/* Show +X if more than 4 images */}
                              {index === 3 && review.proofImages.length > 4 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    +{review.proofImages.length - 4}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">
                          {review.proofImages.length} photo{review.proofImages.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              size={14} 
                              className={star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                          review.adminStatus === 'approved' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : review.adminStatus === 'rejected' 
                            ? 'bg-red-50 text-red-600 border-red-200' 
                            : 'bg-orange-50 text-orange-600 border-orange-200'
                        }`}>
                          {review.adminStatus}
                        </span>
                      </div>

                      <p className="text-sm text-gray-800 mb-3 leading-relaxed font-medium">
                        "{review.comment}"
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-500 uppercase">Date:</span> 
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        <div className={`px-2 py-0.5 rounded-full uppercase font-bold border text-[10px] ${
                          review.sentiment === 'positive' 
                            ? 'text-green-600 bg-green-50 border-green-200' 
                            : review.sentiment === 'negative'
                            ? 'text-red-600 bg-red-50 border-red-200'
                            : 'text-gray-500 bg-gray-50 border-gray-200'
                        }`}>
                          AI: {review.sentiment}
                        </div>
                        {review.isFlagged && (
                          <div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 text-[10px] font-bold">
                            <Flag size={10} fill="currentColor" /> AI Flagged
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {review.adminStatus === "pending" && (
                      <div className="flex md:flex-col gap-2 justify-center">
                        <button
                          onClick={() => handleApprove(review._id)}
                          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                        >
                          <Check size={14} /> APPROVE
                        </button>
                        <button
                          onClick={() => handleReject(review._id)}
                          className="px-6 py-2 bg-white border border-gray-200 hover:border-red-500 hover:text-red-500 text-gray-600 text-xs font-bold rounded-lg transition-all flex items-center gap-2"
                        >
                          <X size={14} /> REJECT
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReviewsPage;