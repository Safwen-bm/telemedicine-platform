import React from "react";
import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";
import starIcon from "../../assets/images/Star.png";

const DoctorCard = ({ doctor }) => {
  const { name, averageRating, totalRating, photo, specialization, experiences } = doctor;

  return (
    <div className="bg-white shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
      <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
        {photo ? (
          <img src={photo} alt="Doctor" className="object-cover w-full h-full" />
        ) : (
          <span className="text-gray-400 text-sm">No Photo Available</span>
        )}
      </div>

      <div className="p-5 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900 truncate">{name || "Unknown Doctor"}</h2>

        <div className="flex items-center justify-between">
          <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
            {specialization || "N/A"}
          </span>
          <div className="flex items-center text-yellow-500 text-sm gap-1">
            <img src={starIcon} alt="starIcon" className="w-4 h-4" />
            <span>{averageRating || 0}</span>
            <span className="text-gray-500">({totalRating || 0})</span>
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          {experiences?.[0]?.hospital ? `At ${experiences[0].hospital}` : "Hospital Info Unavailable"}
        </p>

        <Link
          to={`/doctors/${doctor._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-full hover:bg-[#1E4FC2] transition">
          View Profile <BsArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
