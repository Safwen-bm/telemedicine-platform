import React from "react";
import { Link } from "react-router-dom";

const AboutComponent = () => {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-12">
      {/* Text & CTA Section */}
      <div className="w-full lg:w-1/2 text-left">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
          Excellence in Telehealthcare
        </h2>
        <p className="text-gray-600 text-lg mb-10">
          Experience seamless virtual consultations, secure medical record management, and easy e-prescriptions with our trusted platform.
        </p>

        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-blue-100 p-6 mb-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Personalized Healthcare
          </h3>
          <p className="text-gray-600 mb-4">
            Take control of your health with our intuitive platform.
          </p>
          <Link to="/book">
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-full font-medium transition-all duration-300">
              Book a Consultation
            </button>
          </Link>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Secure and Private
          </h3>
          <p className="text-gray-600 mb-4">
            Your medical data is safeguarded with industry-leading security.
          </p>
          <Link to="/schedule">
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-full font-medium transition-all duration-300">
              Schedule Appointment
            </button>
          </Link>
        </div>
      </div>

      {/* Image Section */}
      <div className="w-full lg:w-1/2 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <img
              src="/about-img1.png"
              alt="Telehealthcare Overview"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutComponent;
