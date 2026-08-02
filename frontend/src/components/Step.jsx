import React from "react";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "Create Your Account",
    image: "/step1.jpg",
    step: "Step 1",
  },
  {
    title: "Book Your Appointment",
    image: "/step2.jpg",
    step: "Step 2",
  },
  {
    title: "Consult with a Doctor",
    image: "/step3.png",
    step: "Step 3",
  },
];

const StepsSection = () => {
  return (
    <section className="bg-gray-50 py-16 px-5">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Begin Your Care in 3 Simple Steps
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Unlock expert healthcare with ease—anytime, anywhere.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border border-gray-200"
            >
              <img
                src={step.image}
                alt={step.title}
                className="w-20 h-20 mx-auto rounded-md mb-5 object-cover"
              />
              <h3 className="text-lg font-semibold text-blue-600 mb-1">
                {step.step}
              </h3>
              <p className="text-gray-700 font-medium">{step.title}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-gray-600 text-base">
          Discover e-treatment options for greater flexibility.{" "}
          <Link
            to="/learn-more"
            className="text-blue-600 font-medium hover:underline"
          >
            Learn More
          </Link>
        </p>

        <Link to="/signup">
          <button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300">
            Start Now
          </button>
        </Link>
      </div>
    </section>
  );
};

export default StepsSection;
