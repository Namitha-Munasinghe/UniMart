import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import SellerReviewsPage from "./SellerReviewsPage";

/**
 * Public seller page: reviews/trust for the seller in the URL only (not the logged-in user).
 * Route: /seller/:sellerId — SellerReviewsPage reads sellerId via useParams().
 */
const SellerPublicProfile = () => {
  const { sellerId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-3xl px-4 pt-8 pb-4">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800"
        >
          <ArrowLeft size={18} />
          Back to home
        </Link>

        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Seller reputation</h1>
              <p className="text-sm text-gray-500">
                Ratings, reviews, and trust signals for this seller.
              </p>
            </div>
          </div>
        </div>
      </div>

      {!sellerId ? (
        <div className="mx-auto max-w-3xl px-4 pb-16 text-center text-sm text-gray-500">
          Missing seller information.
        </div>
      ) : (
        <SellerReviewsPage />
      )}
    </div>
  );
};

export default SellerPublicProfile;
