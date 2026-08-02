import React from "react";
import { Link } from "react-router-dom";
import ServiceList from "../components/Services/ServiceList";
import About from "../components/About/About";
import DoctorList from "../components/Doctors/DoctorList";
import FaqList from "../components/Faq/FaqList";
import featureImg from "../assets/images/feature-img.png";
import videoIcon from "../assets/images/video-icon.png";
import avatarIcon from "../assets/images/avatar-icon.png";
import faqImg from "../assets/images/faq-img.png";
import Testimonial from "../components/Testimonial/Testimonial";
import Step from "../components/Step";

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero__section min-h-screen flex items-center relative overflow-hidden bg-cover bg-center bg-no-repeat">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="container max-w-7xl mx-auto px-5 relative z-20 text-center text-white">
          <div className="py-28">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 drop-shadow-lg">
              Your Health, Our Priority
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 tracking-wide max-w-2xl mx-auto">
              Connect with Expert Doctors Online – Secure, Fast, and Reliable.
            </p>
            <Link to="/appointments">
              <button className="bg-primary hover:bg-primary-dark transition-all duration-300 py-4 px-8 rounded-full font-semibold text-lg shadow-xl">
                Schedule Your Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-semibold mb-12 text-gray-900">
            Start Your Care Journey
          </h2>
          <Step />
        </div>
      </section>

      {/* About Us */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-5">
          <About />
        </div>
      </section>

      {/* Our Services */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Comprehensive Medical Services
          </h2>
          <p className="text-gray-600 mb-12 max-w-xl mx-auto">
            Quality Care Delivered with Advanced Technology.
          </p>
          <ServiceList />
        </div>
      </section>

      {/* Virtual Care Features */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-5 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-semibold text-gray-900 mb-6">
              Teleconsultation Redefined
            </h2>
            <ul className="space-y-4 mb-8">
              {[
                "Book appointments in seconds.",
                "Consult with leading specialists.",
                "Access healthcare from anywhere.",
              ].map((text, index) => (
                <li
                  key={index}
                  className="flex items-start text-gray-700 text-base"
                >
                  <span className="text-primary font-bold mr-2">•</span>
                  {text}
                </li>
              ))}
            </ul>
            <Link to="/services">
              <button className="bg-primary hover:bg-primary-dark transition-all duration-300 py-3 px-6 rounded-full font-semibold text-base shadow-md">
                Discover More
              </button>
            </Link>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img
                src="/featureImg.jpg"
                alt="Feature"
                className="rounded-xl w-full"
              />
              <div className="absolute bottom-4 left-4 bg-white shadow-md rounded-lg p-4 w-60">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">Tue, 24</p>
                    <p className="text-gray-600">10:00 AM</p>
                  </div>
                  <div className="bg-primary p-2 rounded-full">
                    <img src={videoIcon} alt="videoIcon" className="w-4 h-4" />
                  </div>
                </div>
                <span className="inline-block bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  Consultation
                </span>
                <div className="flex items-center gap-2 mt-3">
                  <img
                    src={avatarIcon}
                    alt="Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <h4 className="text-sm font-semibold text-gray-900">
                    Dr. Elena Voss
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Doctors */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Meet Our Expert Doctors
          </h2>
          <p className="text-gray-600 mb-12">
            Trusted Professionals Ready to Assist You.
          </p>
          <DoctorList limit={3} />
          <div className="mt-10">
            <Link to="/doctors">
              <button className="bg-primary hover:bg-primary-dark py-3 px-6 rounded-full text-white font-semibold text-base transition-all duration-300 shadow-md">
                See All Doctors
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-5 flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-1/2 hidden md:block">
            <div className="rounded-xl overflow-hidden shadow-md">
              <img src="/faqImg.png" alt="FAQ" className="w-full object-cover" />
            </div>
          </div>
          <div className="lg:w-1/2">
            <FaqList />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            What Our Patients Say
          </h2>
          <p className="text-gray-600 mb-12">
            Real Experiences from Our Valued Patients.
          </p>
          <Testimonial />
        </div>
      </section>

      {/* Additional Styling */}
      <style jsx>{`
        .bg-primary {
          background-color: #2563eb;
        }
        .bg-primary-dark {
          background-color: #1e4fc2;
        }
      `}</style>
    </>
  );
};

export default Home;
