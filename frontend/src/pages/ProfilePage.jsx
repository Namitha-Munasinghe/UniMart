import React from "react";
import { Link } from "react-router-dom";

const ProfilePage = () => {
  return (
    <div className="p-6">
      <p>This is profile page</p>
      <Link
        to="/my-products"
        className="mt-3 inline-block text-indigo-600 hover:underline text-sm font-medium"
      >
        My products
      </Link>
    </div>
  );
};

export default ProfilePage;
