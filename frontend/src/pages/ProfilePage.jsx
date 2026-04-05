import React, { useEffect, useRef, useState } from "react";
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
  MessageSquareMore,
  Sparkles,
  X,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { Link } from "react-router-dom";
import SellerReviewsPage from "./SellerReviewsPage";
import { PRODUCT_CATEGORIES, categoryDisplayName } from "../constants/categories";

const ProfilePage = () => {
  const { user, logout, deleteAccount, loading, updateInterests } = useUserStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [editingInterests, setEditingInterests] = useState(false);
  const [interestDraft, setInterestDraft] = useState([]);
  const userData = user;
  const isCurrentUserProfile = true;
  const reviewsSectionRef = useRef(null);

  if (!user) return null;

  const meetingsPath = user.role !== "admin" ? "/my-meetings" : null;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const joinedDate = new Date(userData.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const canViewSellerReviews = userData.role === "seller" || isCurrentUserProfile;
  const interestLabels = Array.isArray(userData.interests)
    ? userData.interests.map((interest) => categoryDisplayName(interest))
    : [];

  useEffect(() => {
    setInterestDraft(Array.isArray(userData?.interests) ? userData.interests : []);
  }, [userData?.interests]);

  const handleToggleReviews = () => {
    setShowReviews((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
      return next;
    });
  };

  const toggleDraftInterest = (interest) => {
    setInterestDraft((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const handleSaveInterests = async () => {
    const success = await updateInterests(interestDraft);
    if (success) {
      setEditingInterests(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
              {userData.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                Welcome back, {userData.name} 
                {userData.role === "admin" && (
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

              <span className="inline-block mt-3 px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded-full">
                {userData.studentId}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <Link to="/edit-profile">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Stats Cards Section */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          
          {/* Rating Card */}
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-500" />
              <h3 className="font-semibold text-gray-700">Rating</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {/* {user.rating.toFixed(1)} ⭐   */}
              {(userData.rating ?? 0).toFixed(1)} ⭐
            </p>
            <p className="text-sm text-gray-500">
              Based on {userData.totalReviews} reviews
            </p>
          </div>

          {/* Role Card */}
          <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Role</h3>
            <p className="text-xl font-bold capitalize text-gray-800">
              {userData.role}
            </p>
          </div>

          {/* Account Status Card */}
          <div className="bg-gradient-to-r from-green-100 to-green-50 p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">
              Account Status
            </h3>
            <p className="text-xl font-bold text-gray-800">
              {userData.isBlocked ? "Blocked 🔴" : "Active 🟢"}
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
                <School size={18} className="text-indigo-500" />
                Faculty: {userData.faculty}
              </p>

              <p className="flex items-center gap-3">
                <IdCard size={18} className="text-indigo-500" />
                Student ID: {userData.studentId}
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
                <Mail size={18} className="text-indigo-500" />
                {userData.email}
              </p>

              <p className="flex items-center gap-3">
                <Phone size={18} className="text-indigo-500" />
                {userData.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-700">My Interests</h3>
            </div>

            {editingInterests ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setInterestDraft(Array.isArray(userData.interests) ? userData.interests : []);
                    setEditingInterests(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={loading || interestDraft.length < 3}
                  onClick={handleSaveInterests}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  Save Interests
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setEditingInterests(true)}
                className="px-4 py-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
              >
                Edit Interests
              </button>
            )}
          </div>

          {editingInterests ? (
            <div>
              <p className="mb-4 text-sm text-gray-500">
                Keep at least 3 interests. You can remove extras or add new ones below.
              </p>
              <div className="flex flex-wrap gap-3">
                {PRODUCT_CATEGORIES.map((interest) => {
                  const selected = interestDraft.includes(interest);

                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleDraftInterest(interest)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-300 hover:text-indigo-700"
                      }`}
                    >
                      {categoryDisplayName(interest)}
                      {selected && <X size={14} />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-sm font-medium text-gray-600">
                Selected: {interestDraft.length}
              </p>
            </div>
          ) : interestLabels.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {interestLabels.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              You have not selected interests yet.
            </p>
          )}
        </div>

        <div className="mt-10 border-t pt-6 flex flex-wrap justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Link to="/my-products">
              <button className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md transition">
                <Package size={18} />
                My Products
              </button>
            </Link>

            {meetingsPath && (
              <Link to={meetingsPath}>
                <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition">
                  <MessageSquareMore size={18} />
                  My Meetings
                </button>
              </Link>
            )}
          </div>

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

      {canViewSellerReviews && showReviews && (
        <div ref={reviewsSectionRef} className="mt-10">
          <SellerReviewsPage sellerId={userData._id || userData.id} />
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
