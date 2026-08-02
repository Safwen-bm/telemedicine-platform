import React from "react";
import { Link } from "react-router-dom";
import { RiLinkedinFill } from "react-icons/ri";
import {
  AiFillYoutube,
  AiFillGithub,
  AiOutlineInstagram,
} from "react-icons/ai";

const Footer = () => {
  return (
    <footer className="bg-white py-8 border-t border-blue-500">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo and Tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="logo" />

              <span className="text-blue-600 font-semibold text-lg">
                on demand
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">by Included Health</p>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full md:w-auto">
            {/* About Us */}
            <div className="text-center md:text-left">
              <h3 className="text-blue-600 font-bold text-lg mb-4">About Us</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Our Providers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cost-insurance"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Cost – Insurance
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="text-center md:text-left">
              <h3 className="text-blue-600 font-bold text-lg mb-4">
                How It Works
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/medicare"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Medicare
                  </Link>
                </li>
                <li>
                  <Link
                    to="/organization-solutions"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Solutions for Your Organization
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Us */}
            <div className="text-center md:text-left">
              <h3 className="text-blue-600 font-bold text-lg mb-4">
                Contact Us
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/faqs"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-gray-600 hover:text-blue-600 text-sm"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Icons */}
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-end gap-4">
              <Link
                to=""
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <RiLinkedinFill className="w-5 h-5" />
              </Link>
              <Link
                to=""
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <AiFillYoutube className="w-5 h-5" />
              </Link>
              <Link
                to=""
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                <AiOutlineInstagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright and Legal Links */}
        <div className="mt-8 text-center border-t border-gray-200 pt-4">
          <p className="text-gray-600 text-sm mb-2">
            © 2025 Doctor On Demand by Included Health, Inc. All rights
            reserved.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 text-sm text-gray-600">
            <Link to="/terms" className="hover:text-blue-600">
              Terms of Service
            </Link>
            <Link to="/privacy" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link to="/notice-privacy" className="hover:text-blue-600">
              Notice of Privacy Practices
            </Link>
            <Link to="/nondiscrimination" className="hover:text-blue-600">
              Notice of Nondiscrimination
            </Link>
            <Link to="/accessibility" className="hover:text-blue-600">
              Accessibility
            </Link>
            <Link to="/sitemap" className="hover:text-blue-600">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
