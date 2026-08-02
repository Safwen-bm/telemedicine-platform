import React from "react";

const Contact = () => {
  return (
    <section className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed text-base">
            We’d love to hear from you. Get in touch with our team for any inquiries or support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-gray-700 text-base">Email: info@healthcare.com</span>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-700 text-base">Phone: +1-800-555-1234</span>
              </div>
              <div className="flex items-center gap-4">
                <svg className="w-6 h-6 text-[#2563EB]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-9h-2v5h2V7zm0-2h-2v2h2V5z" />
                </svg>
                <span className="text-gray-700 text-base">Address: 123 Health St, City, Country</span>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white shadow-lg rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  rows="5"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              <button
                className="bg-[#2563EB] text-white py-3 px-6 rounded-lg hover:bg-[#1E4FC2] transition-all duration-200 w-full"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;