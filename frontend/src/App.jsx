import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import ShopPage from "./pages/ShopPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MyProductsPage from "./pages/MyProductsPage";
import ProductFormPage from "./pages/ProductFormPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shop/c/:category" element={<CategoryProductsPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/my-products/new" element={<ProductFormPage />} />
          <Route path="/my-products/edit/:id" element={<ProductFormPage />} />
          <Route path="/my-products" element={<MyProductsPage />} />
        </Routes>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          className: "font-sans",
          style: {
            borderRadius: "12px",
            background: "#1e1b4b",
            color: "#f5f3ff",
          },
        }}
      />
    </div>
  );
}

export default App;
