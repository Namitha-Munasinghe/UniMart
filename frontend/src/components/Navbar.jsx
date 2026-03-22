import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { User, LogOut, LayoutDashboard, Heart, Store } from "lucide-react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive
        ? "text-brand-700"
        : "text-slate-600 hover:text-brand-600"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-100/80 bg-white/90 backdrop-blur-md shadow-sm shadow-brand-100/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3.5">
        <NavLink
          to="/"
          className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent"
        >
          UniMart
        </NavLink>

        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass}>
            Shop
          </NavLink>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <NavLink
            to="/shop"
            className="md:hidden flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            aria-label="Shop"
          >
            <Store className="w-6 h-6" />
          </NavLink>

          <NavLink to="/favourites" aria-label="Favourites">
            <Heart className="w-6 h-6 text-slate-600 hover:text-rose-500 cursor-pointer transition" />
          </NavLink>

          {!isLoggedIn ? (
            <>
              <NavLink
                to="/login"
                className="text-slate-600 hover:text-brand-600 font-medium text-sm"
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-sm hover:from-brand-500 hover:to-indigo-500 transition"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/profile" aria-label="Profile">
                <User className="w-6 h-6 text-slate-600 hover:text-brand-600 cursor-pointer transition" />
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="hidden md:flex items-center gap-2 rounded-xl bg-amber-500 text-white px-4 py-2 text-sm font-semibold hover:bg-amber-600 transition"
                >
                  <LayoutDashboard size={18} />
                  Admin
                </NavLink>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50 transition"
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
