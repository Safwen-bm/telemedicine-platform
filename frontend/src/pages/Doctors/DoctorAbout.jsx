import React from "react";
import { formateDate } from "../../utils/formateDate";

const DoctorAbout = ({ name, about, qualifications, experiences }) => {
  return (
    <div className="space-y-12">
      {/* Professional Summary */}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-900">Professional Summary</h2>
        <p className="text-gray-600 mt-4 leading-relaxed text-base max-w-2xl">
          {about || "A highly skilled professional dedicated to delivering top-tier healthcare services with extensive experience."}
        </p>
      </div>

      {/* Qualifications */}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-900">Qualifications</h2>
        <ul className="mt-6 space-y-4">
          {qualifications?.length > 0 ? (
            qualifications.map((item, index) => (
              <li
                key={index}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <p className="text-gray-800 font-medium text-lg">{item.degree || "Degree Not Specified"}</p>
                    <p className="text-sm text-gray-600">{item.university || "University Not Specified"}</p>
                  </div>
                  <span className="text-blue-600 text-sm font-medium mt-2 sm:mt-0">
                    {formateDate(item.startingDate)} - {item.endingDate ? formateDate(item.endingDate) : "Present"}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic">No qualifications listed.</p>
          )}
        </ul>
      </div>

      {/* Experience */}
      <div className="animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-900">Professional Experience</h2>
        <ul className="grid sm:grid-cols-2 gap-4 mt-6">
          {experiences?.length > 0 ? (
            experiences.map((item, index) => (
              <li
                key={index}
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <p className="text-gray-800 font-medium text-lg">{item.position || "Position Not Specified"}</p>
                    <p className="text-sm text-gray-600">{item.hospital || "Hospital Not Specified"}</p>
                  </div>
                  <span className="text-blue-600 text-sm font-medium mt-2 sm:mt-0">
                    {formateDate(item.startingDate)} - {item.endingDate ? formateDate(item.endingDate) : "Present"}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <p className="text-gray-500 italic">No experience listed.</p>
          )}
        </ul>
      </div>

      {/* Inline Styles for Animations */}
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DoctorAbout;