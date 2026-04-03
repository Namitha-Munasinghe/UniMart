import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Package2, User, X } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import unimart from "../assets/unimart.png";

const Navbar = () => {
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  const closeMenu = () => setMobileOpen(false);

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-[#BDE8F5] text-[#0F2854]"
        : "text-[#0F2854]/72 hover:bg-[#BDE8F5]/60 hover:text-[#0F2854]"
    }`;

  return (
    <header className="sticky top-0 z-40 px-4 py-4 sm:px-6">
      <nav className="um-glass mx-auto max-w-7xl rounded-[28px] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <NavLink to="/" onClick={closeMenu} className="flex items-center gap-3 text-[#0F2854]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1C4D8D] to-[#4988C4] shadow-lg shadow-[#1C4D8D]/25">
              <img src={unimart} alt="UniMart" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">UniMart</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[#4988C4]">
                Student Marketplace
              </p>
            </div>
          </NavLink>

          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            {user && (
              <>
                <NavLink to="/my-products" className={navLinkClass}>
                  My Products
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  Profile
                </NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink
                to="/admin-reviews"
                className="inline-flex items-center gap-2 rounded-full bg-[#BDE8F5] px-4 py-2 text-sm font-semibold text-[#0F2854] transition hover:bg-[#9ed8eb]"
              >
                <LayoutDashboard size={17} />
                Admin
              </NavLink>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <NavLink to="/login" className="um-secondary-btn px-4 py-2">
                  Sign In
                </NavLink>
                <NavLink to="/signup" className="um-primary-btn px-4 py-2">
                  Create Account
                </NavLink>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-full border border-[#4988C4]/15 bg-white/80 px-4 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1C4D8D] text-sm font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-[#0F2854]">{user.name}</p>
                    <p className="text-xs text-[#4988C4]">{user.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="um-primary-btn px-4 py-2">
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BDE8F5]/75 text-[#0F2854] transition hover:bg-[#BDE8F5] md:hidden"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="mt-4 space-y-3 rounded-[24px] border border-[#4988C4]/15 bg-white/90 p-4 md:hidden">
            <NavLink to="/" onClick={closeMenu} className={navLinkClass}>
              Home
            </NavLink>
            {user && (
              <>
                <NavLink to="/my-products" onClick={closeMenu} className={navLinkClass}>
                  <span className="inline-flex items-center gap-2">
                    <Package2 size={16} />
                    My Products
                  </span>
                </NavLink>
                <NavLink to="/profile" onClick={closeMenu} className={navLinkClass}>
                  <span className="inline-flex items-center gap-2">
                    <User size={16} />
                    Profile
                  </span>
                </NavLink>
              </>
            )}
            {!user ? (
              <div className="grid gap-3 pt-2">
                <NavLink to="/login" onClick={closeMenu} className="um-secondary-btn">
                  Sign In
                </NavLink>
                <NavLink to="/signup" onClick={closeMenu} className="um-primary-btn">
                  Create Account
                </NavLink>
              </div>
            ) : (
              <button onClick={handleLogout} className="um-primary-btn mt-2 w-full">
                <LogOut size={17} />
                Logout
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
