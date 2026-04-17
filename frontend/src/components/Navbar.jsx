// Navbar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  CalendarDays,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import unimart from "../assets/unimart.png";

const Navbar = () => {
  const { user, logout } = useUserStore();

  const isAdmin = user?.role === "admin";
  const meetingsPath = !isAdmin ? "/my-meetings" : null;

  const handleLogout = () => {
    logout();
  };

  const linkClass =
    "text-gray-600 hover:text-indigo-600 font-medium transition duration-200";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-xl font-semibold text-indigo-600 tracking-tight"
        >
          <img
            src={unimart}
            alt="UniMart"
            className="w-10 h-10 rounded-lg shadow-sm"
          />
          <span className="hidden sm:block">UniMart</span>
        </NavLink>

        {/* Right Section */}
        <div className="flex items-center gap-5">
          
          {/* Favorites (Icon + Hover Text) */}
          <NavLink to="/favourites" className="relative group">
            <div className="p-2 rounded-full hover:bg-gray-100 transition">
              <Heart className="w-6 h-6 text-gray-600 group-hover:text-red-500" />
            </div>

            <span className="absolute top-11 left-1/2 -translate-x-1/2 
              bg-gray-900 text-white text-xs px-2 py-1 rounded-md 
              opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 
              transition-all duration-200 whitespace-nowrap">
              Favorites
            </span>
          </NavLink>

          {!user ? (
            <>
              <NavLink to="/login" className={linkClass}>
                Sign In
              </NavLink>

              <NavLink
                to="/signup"
                className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition shadow-sm"
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              {/* My Meetings */}
              {meetingsPath && (
                <NavLink to={meetingsPath} className="relative group hidden md:flex">
                  <div className="p-2 rounded-full hover:bg-gray-100 transition">
                    <CalendarDays
                      size={22}
                      className="text-gray-600 group-hover:text-indigo-600"
                    />
                  </div>

                  <span className="absolute top-11 left-1/2 -translate-x-1/2 
                    bg-gray-900 text-white text-xs px-2 py-1 rounded-md 
                    opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 
                    transition-all duration-200 whitespace-nowrap">
                    My Meetings
                  </span>
                </NavLink>
              )}

              {/* Profile (Icon + Hover Text) */}
              <NavLink to="/profile" className="relative group">
                <div className="p-2 rounded-full hover:bg-gray-100 transition">
                  <User className="w-6 h-6 text-gray-600 group-hover:text-indigo-600" />
                </div>

                <span className="absolute top-11 left-1/2 -translate-x-1/2 
                  bg-gray-900 text-white text-xs px-2 py-1 rounded-md 
                  opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 
                  transition-all duration-200 whitespace-nowrap">
                  Profile
                </span>
              </NavLink>

              {/* Admin */}
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className="hidden md:flex items-center gap-2 bg-yellow-500 text-white px-5 py-2 rounded-full hover:bg-yellow-600 transition shadow-sm"
                >
                  <LayoutDashboard size={18} />
                  Admin
                </NavLink>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="relative group hidden md:flex"
              >
                <div className="p-2 rounded-full hover:bg-gray-100 transition">
                  <LogOut
                    size={22}
                    className="text-gray-600 group-hover:text-red-500"
                  />
                </div>

                <span className="absolute top-11 left-1/2 -translate-x-1/2 
                  bg-gray-900 text-white text-xs px-2 py-1 rounded-md 
                  opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 
                  transition-all duration-200 whitespace-nowrap">
                  Logout
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;