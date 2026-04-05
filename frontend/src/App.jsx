import { Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import SubmitReviewPage from "./pages/SubmitReviewPage";
import SellerReviewsPage from "./pages/SellerReviewsPage";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import BuyerScheduleMeetingPage from "./pages/BuyerScheduleMeetingPage";
import SellerScheduleMeetingPage from "./pages/SellerScheduleMeetingPage";
import MyProductsPage from "./pages/MyProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MyMeetingsPage from "./pages/MyMeetingsPage";
import SellerPublicProfile from "./pages/SellerPublicProfile";
import InterestSelectionPage from "./pages/InterestSelectionPage";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const requiresInterestSelection = user && (!Array.isArray(user.interests) || user.interests.length < 3);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <HomePage />} />
          <Route path="/my-meetings" element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <MyMeetingsPage />) : <Navigate to="/login" />} />
          <Route path="/schedule-meeting/buyer" element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <BuyerScheduleMeetingPage />) : <Navigate to="/" />} />
          <Route path="/schedule-meeting/buyer/:productId" element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <BuyerScheduleMeetingPage />) : <Navigate to="/" />} />
          <Route path="/schedule-meeting/seller" element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <SellerScheduleMeetingPage />) : <Navigate to="/" />} />
          <Route path="/schedule-meeting/seller/:productId" element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <SellerScheduleMeetingPage />) : <Navigate to="/" />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/onboarding/interests"
            element={user ? (requiresInterestSelection ? <InterestSelectionPage /> : <Navigate to="/" />) : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <ProfilePage />) : <Navigate to="/login" />}
          />
          <Route
            path="/edit-profile"
            element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <EditProfilePage />) : <Navigate to="/login" />}
          />
          <Route
            path="/my-products"
            element={user ? (requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <MyProductsPage />) : <Navigate to="/login" />}
          />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/seller/:sellerId" element={<SellerPublicProfile />} />
          <Route path="/submit-review/:productId/:sellerId" element={requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <SubmitReviewPage />} />
          <Route path="/seller-reviews" element={requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <SellerReviewsPage />} />
          <Route path="/admin-reviews" element={requiresInterestSelection ? <Navigate to="/onboarding/interests" /> : <AdminReviewsPage />} />
          <Route path="*" element={<Navigate to={user ? (requiresInterestSelection ? "/onboarding/interests" : "/") : "/login"} />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
