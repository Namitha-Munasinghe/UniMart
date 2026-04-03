import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, Upload, Send, ShieldCheck, X, Sparkles, MessageSquareHeart } from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const SubmitReviewPage = () => {
  const { productId, sellerId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p));
  }, [previews]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return toast.error("Maximum 5 images allowed!");
    }
    const validFiles = files.filter(f => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is too large! Max 5MB`);
        return false;
      }
      return true;
    });
    setImages(prev => [...prev, ...validFiles]);
    setPreviews(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !sellerId) return toast.error("Missing product or seller information.");
    if (!user?._id && !user?.id) return toast.error("Please login to submit a review.");
    if (rating === 0) return toast.error("Please select a rating!");
    if (!comment.trim()) return toast.error("Please write a comment!");

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("buyerId", user?._id || user?.id);
      formData.append("sellerId", sellerId);
      formData.append("productId", productId);
      formData.append("rating", rating);
      formData.append("comment", comment);
      images.forEach(img => formData.append("proofImages", img));

      // ✅ XMLHttpRequest use කරලා progress track කරනවා
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Upload Progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 70);
            setUploadProgress(percent);
            setUploadStage("Uploading images to Cloudinary...");
          }
        });

        // Upload Complete - AI analyzing
        xhr.upload.addEventListener("load", () => {
          setUploadProgress(75);
          setUploadStage("AI is analyzing your review...");
          
          // Simulate AI progress
          let aiProgress = 75;
          const interval = setInterval(() => {
            aiProgress += 5;
            if (aiProgress >= 95) {
              clearInterval(interval);
            }
            setUploadProgress(aiProgress);
          }, 300);
        });

        xhr.addEventListener("load", () => {
          setUploadProgress(100);
          setUploadStage("Done! ✅");
          
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              resolve(data);
            } else {
              reject(new Error(data.message));
            }
          } catch {
            reject(new Error("Invalid response"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Connection failed"));
        });

        xhr.open("POST", "http://localhost:5000/api/reviews/submit");
        xhr.send(formData);
      });

      toast.success("Review Published! 🎉");
      setRating(0);
      setComment("");
      setImages([]);
      setPreviews([]);
      setUploadProgress(0);
      setUploadStage("");
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(`/products/${productId}`);
      }

    } catch (error) {
      toast.error(error.message || "Something went wrong!");
      setUploadProgress(0);
      setUploadStage("");
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  const ratingColors = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-emerald-400", "text-indigo-400"];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-white rounded-3xl shadow-xl mb-4">
            <MessageSquareHeart className="w-10 h-10 text-indigo-600" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How was your experience?
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Share your feedback. AI moderation ensures a safe space.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

          {/* AI Banner */}
          <div className="bg-indigo-600 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-200" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">
                AI Moderation Active
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Stars */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
                      star <= (hover || rating)
                        ? "text-yellow-400 fill-yellow-400 scale-125"
                        : "text-gray-200 hover:scale-110"
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  />
                ))}
              </div>
              {(hover || rating) > 0 && (
                <span className={`text-sm font-bold uppercase tracking-wider ${ratingColors[hover || rating]}`}>
                  {ratingLabels[hover || rating]}
                </span>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Your Review
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-4 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                rows={4}
                placeholder="What did you love or hate about the product?..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-300 mt-1 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Multiple Image Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Proof Images{" "}
                <span className="text-gray-300 normal-case font-normal">(Max 5)</span>
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden border border-gray-100 aspect-square">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="border-2 border-dashed border-gray-200 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition">
                      <Upload className="w-5 h-5 text-gray-300" />
                      <span className="text-xs text-gray-300 mt-1">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>
              )}

              {previews.length === 0 && (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition group">
                  <Upload className="w-7 h-7 text-gray-300 group-hover:text-indigo-500 mb-2" />
                  <span className="text-sm text-gray-400 group-hover:text-indigo-600">
                    Click to upload proof images
                  </span>
                  <span className="text-xs text-gray-300 mt-1">
                    JPG, PNG • Max 5MB each • Up to 5 images
                  </span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* ✅ Progress Bar */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">{uploadStage}</span>
                  <span className="text-xs font-bold text-indigo-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                 
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-60 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{uploadStage || "Processing..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish Review</span>
                </>
              )}
            </button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Reviews are AI moderated for community safety
        </p>
      </div>
    </div>
  );
};

export default SubmitReviewPage;