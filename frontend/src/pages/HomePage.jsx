import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div><h1>this is homepage</h1>
      <button><Link to="/schedule-meeting/buyer">Schedule Meeting (Buyer)</Link></button>
      <button><Link to="/schedule-meeting/seller">Schedule Meeting (Seller)</Link></button>
    </div>
  );
};

export default HomePage;