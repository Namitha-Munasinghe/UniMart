import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  // 🔐 Simulated auth state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // change to false to test normal user

  const linkClass = "hover:text-indigo-600 transition";

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <NavLink to="/" className="text-2xl font-bold text-indigo-600">
          UniMart
        </NavLink>

        {/* Center Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? "text-indigo-600 font-semibold" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/browse"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? "text-indigo-600 font-semibold" : ""}`
            }
          >
            Browse
          </NavLink>
        </div>

        {/* Right Section */}
        {/* Right Section */}
        <div className="flex items-center space-x-5 items-center">
          <NavLink to="/cart">
            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer transition" />
          </NavLink>

          {!isLoggedIn ? (
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
              {/* 👤 Profile FIRST */}
              <NavLink to="/profile">
                <User className="w-6 h-6 text-gray-700 hover:text-indigo-600 cursor-pointer transition" />
              </NavLink>

              {/* 👑 Admin AFTER Profile */}
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
