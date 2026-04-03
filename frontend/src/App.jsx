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

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule-meeting/buyer" element={user?<BuyerScheduleMeetingPage />:<Navigate to="/" />} />
          <Route path="/schedule-meeting/buyer/:productId" element={user?<BuyerScheduleMeetingPage />:<Navigate to="/" />} />
          <Route path="/schedule-meeting/seller" element={user?<SellerScheduleMeetingPage />:<Navigate to="/" />} />
          <Route
            path="/signup"
            element={!user ? <SignUpPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-profile"
            element={user ? <EditProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/my-products"
            element={user ? <MyProductsPage /> : <Navigate to="/login" />}
          />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/submit-review" element={<SubmitReviewPage />} />
          <Route path="/seller-reviews" element={<SellerReviewsPage />} />
          <Route path="/admin-reviews" element={<AdminReviewsPage />} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
