import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  School,
  IdCard,
  LogOut,
  CalendarDays,
  Star,
  ShieldCheck,
  Edit,
  Trash2,
  Package,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout, deleteAccount, loading } = useUserStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-transparent p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="um-glass mx-auto max-w-5xl rounded-[28px] p-8"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1C4D8D] text-3xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                Welcome back, {user.name} 
                {user.role === "admin" && (
                  <span className="flex items-center gap-1 text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full">
                    <ShieldCheck size={16} />
                    Admin
                  </span>
                )}
              </h2>

              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <CalendarDays size={16} />
                Today is {today}
              </p>

              <p className="text-gray-400 text-sm mt-1">
                Member since {joinedDate}
              </p>

              <span className="mt-3 inline-block rounded-full bg-[#BDE8F5] px-3 py-1 text-sm text-[#1C4D8D]">
                {user.studentId}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <Link to="/edit-profile">
            <button
              className="um-primary-btn px-4 py-2"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Stats Cards Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          
          {/* Rating Card */}
          <div className="rounded-xl bg-[#BDE8F5]/55 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-500" />
              <h3 className="font-semibold text-gray-700">Rating</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {/* {user.rating.toFixed(1)} ⭐   */}
              {(user.rating ?? 0).toFixed(1)} ⭐
            </p>
            <p className="text-sm text-gray-500">
              Based on {user.totalReviews} reviews
            </p>
          </div>

          {/* Role Card */}
          <div className="rounded-xl bg-[#BDE8F5]/45 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Role</h3>
            <p className="text-xl font-bold capitalize text-gray-800">
              {user.role}
            </p>
          </div>

          {/* Account Status Card */}
          <div className="rounded-xl bg-white/85 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">
              Account Status
            </h3>
            <p className="text-xl font-bold text-gray-800">
              {user.isBlocked ? "Blocked 🔴" : "Active 🟢"}
            </p>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-8 mt-10">
          
          {/* Academic Info */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Academic Information
            </h3>

            <div className="space-y-3 text-gray-600">
              <p className="flex items-center gap-3">
                <School size={18} className="text-[#1C4D8D]" />
                Faculty: {user.faculty}
              </p>

              <p className="flex items-center gap-3">
                <IdCard size={18} className="text-[#1C4D8D]" />
                Student ID: {user.studentId}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Contact Information
            </h3>

            <div className="space-y-3 text-gray-600">
              <p className="flex items-center gap-3">
                <Mail size={18} className="text-[#1C4D8D]" />
                {user.email}
              </p>

              <p className="flex items-center gap-3">
                <Phone size={18} className="text-[#1C4D8D]" />
                {user.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 flex flex-wrap justify-between gap-3">
          <Link to="/my-products">
            <button className="um-primary-btn px-5 py-2">
              <Package size={18} />
              My Products
            </button>
          </Link>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition"
            >
              <Trash2 size={18} />
              Delete Account
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </motion.div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-800">Delete account?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This action will permanently delete your account. Do you want to continue?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                No
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  const deleted = await deleteAccount();
                  if (deleted) {
                    setShowDeleteConfirm(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-70"
              >
                {loading ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
