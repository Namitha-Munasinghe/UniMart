import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader,
  School,
  IdCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";

const SignUpPage = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    studentId: "",
    faculty: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const {signup} = useUserStore();

  const faculties = [
    "Faculty of Computing",
    "SLIIT Business School",
    "Faculty of Engineering",
    "Faculty of Humanities and Sciences",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData.username, formData.email, formData.studentId, formData.faculty, formData.phone, formData.password, formData.confirmPassword);

    setTimeout(() => {
      console.log(formData);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <UserPlus className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account
          </h2>
          <p className="text-gray-500 text-sm">
            Join UniMart today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Student Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Student ID */}
          <div className="relative">
            <IdCard className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="studentId"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Faculty Dropdown */}
          <div className="relative">
            <School className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <select
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map((faculty, index) => (
                <option key={index} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            {loading ? (
              <Loader className="animate-spin w-5 h-5" />
            ) : (
              <>
                Sign Up <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;