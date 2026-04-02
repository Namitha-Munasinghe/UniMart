// Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard, Heart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import unimart from "../assets/unimart.png";

const Navbar = () => {
  const { user, logout } = useUserStore(); // make sure your store has a logout function

  const isAdmin = user?.role === "admin";
  const linkClass = "hover:text-indigo-600 transition";

  const handleLogout = () => {
    logout(); // call store logout
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="flex items-center text-2xl font-bold text-indigo-600">
          <img src={unimart} alt="UniMart" className="w-8 h-8 mr-2" />
          UniMart
        </NavLink>

        <div className="flex items-center space-x-5">
          {/* Favorites / Heart */}
          <NavLink to="/favourites">
            <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 cursor-pointer transition" />
          </NavLink>

          {/* Auth Links */}
          {!user ? (
            <>
              <NavLink
                to="/login"
                className="text-gray-700 hover:text-indigo-600 font-medium"
              >
                Sign In
              </NavLink>

              <NavLink
                to="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              {/* Profile */}
              <NavLink to="/profile">
                <User className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer transition" />
              </NavLink>

              {/* Admin Link */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="hidden md:flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                >
                  <LayoutDashboard size={18} />
                  Admin
                </NavLink>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;