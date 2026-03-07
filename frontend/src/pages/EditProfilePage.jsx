import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Loader, User } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const EditProfilePage = () => {
  const { user, updateProfile, loading } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    faculty: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        faculty: user.faculty || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <User className="text-indigo-600" size={28} />
          <h2 className="text-2xl font-bold">Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Faculty */}
          <div>
            <label className="text-sm font-medium">Faculty</label>
            <input
              type="text"
              name="faculty"
              required
              value={formData.faculty}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Read Only Fields */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="text"
              value={user?.email || ""}
              disabled
              className="w-full border rounded-lg p-2 mt-1 bg-gray-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Student ID</label>
            <input
              type="text"
              value={user?.studentId || ""}
              disabled
              className="w-full border rounded-lg p-2 mt-1 bg-gray-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg flex justify-center items-center gap-2 hover:bg-indigo-700 transition"
          >
            {loading ? (
              <Loader className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfilePage;