import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col gap-6">
        
        <Link
          to="/schedule-meeting/buyer"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg text-center font-semibold hover:bg-indigo-700 transition"
        >
          Schedule Meeting (Buyer)
        </Link>

        <Link
          to="/schedule-meeting/seller"
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg text-center font-semibold hover:bg-emerald-700 transition"
        >
          Schedule Meeting (Seller)
        </Link>

      </div>
    </div>
  );
};

export default HomePage;