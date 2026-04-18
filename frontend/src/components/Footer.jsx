import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import unimart from '../assets/unimart.png';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-indigo-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-xl font-semibold text-indigo-600 tracking-tight mb-4">
              <img src={unimart} alt="UniMart" className="w-9 h-9 rounded-lg shadow-sm" />
              <span className="hidden sm:block">UniMart</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 gap-2">
              Your campus, your marketplace! Buy what you need or sell what you don't. Connect with your peers and trade safely and securely.
            </p>
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition duration-300">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm transition">Home</Link></li>
              <li><Link to="/products" className="text-gray-500 hover:text-indigo-600 text-sm transition">Browse Listings</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-indigo-600 text-sm transition">About Us</Link></li>
              <li><Link to="/faq" className="text-gray-500 hover:text-indigo-600 text-sm transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-gray-800 font-bold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm transition">Electronics</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm transition">Books & Notes</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm transition">Clothing</Link></li>
              <li><Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm transition">Dorm Essentials</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-800 font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-indigo-500 shrink-0 mt-0.5" size={18} />
                <span className="text-gray-500 text-sm">University Campus, Main Building, RM 404</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-indigo-500 shrink-0" size={18} />
                <span className="text-gray-500 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-indigo-500 shrink-0" size={18} />
                <span className="text-gray-500 text-sm">support@unimart.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} UniMart. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-gray-400 hover:text-indigo-600 text-sm transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-indigo-600 text-sm transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
