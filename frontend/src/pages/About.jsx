import React from "react";
import AboutComponent from "../components/About/About";

const About = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-5 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6 glow-text">
          About Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Discover how our platform brings healthcare closer to you, offering
          virtual care with confidence, privacy, and personalization.
        </p>
        <AboutComponent />
      </div>
    </section>
  );
};

export default About;
