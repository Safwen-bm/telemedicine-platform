import { useState } from "react";
import {
  FaUserMd,
  FaHeartbeat,
  FaStethoscope,
  FaBrain,
  FaTooth,
  FaUserNurse,
  FaBone,
  FaLungs,
  FaAllergies,
  FaCapsules,
  FaVideo,
  FaMicrophone,
  FaVolumeUp,
  FaPhoneSlash
} from "react-icons/fa";
import { Link } from "react-router-dom";

const symptoms = [
  { name: "Stomach Ache", icon: <FaHeartbeat /> },
  { name: "Period Issue", icon: <FaUserNurse /> },
  { name: "Acne / Pimples", icon: <FaAllergies /> },
  { name: "Fever", icon: <FaCapsules /> },
  { name: "Depression", icon: <FaBrain /> },
  { name: "Diabetes", icon: <FaCapsules /> },
  { name: "Cough", icon: <FaLungs /> },
  { name: "Hairfall", icon: <FaAllergies /> },
  { name: "Gastritis", icon: <FaHeartbeat /> },
  { name: "Body Pain", icon: <FaBone /> },
];

const specialties = [
  { name: "Physician", icon: <FaUserMd /> },
  { name: "Sexologist", icon: <FaUserMd /> },
  { name: "Dermatologist", icon: <FaAllergies /> },
  { name: "Orthopedician", icon: <FaBone /> },
  { name: "ENT Specialist", icon: <FaStethoscope /> },
  { name: "Psychotherapist", icon: <FaBrain /> },
  { name: "Dentist", icon: <FaTooth /> },
  { name: "Cardiologist", icon: <FaHeartbeat /> },
  { name: "Gynaecologist", icon: <FaUserNurse /> },
  { name: "Dietitian", icon: <FaCapsules /> },
];

export default function OnlineDoctorConsultation() {
  const [tab, setTab] = useState("symptoms");

  return (
    <div className="p-10 pt-20 bg-blue-100 rounded-lg shadow-lg mx-auto">
      {/* Background Image Section */}
      <div
        className="relative bg-cover bg-center bg-no-repeat rounded-lg shadow-lg p-16 min-h-[500px] flex flex-col justify-center items-center"
        style={{ backgroundImage: "url('/doctor-video-call.png')" }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black opacity-30 rounded-lg"></div>

        {/* Floating Call Controls */}
        <div className="absolute top-5 right-5 flex gap-3 z-20">
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-200 transition">
            <FaVideo className="text-blue-600 text-2xl" />
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-200 transition">
            <FaMicrophone className="text-blue-600 text-2xl" />
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-200 transition">
            <FaVolumeUp className="text-blue-600 text-2xl" />
          </button>
          <button className="p-3 bg-red-500 rounded-full shadow-lg hover:bg-red-700 transition">
            <FaPhoneSlash className="text-white text-2xl" />
          </button>
        </div>

        {/* Text Content */}
        <div className="relative z-10 text-center text-white">
          <h2 className="text-5xl font-bold mb-5">Consult World's Top Doctors Online</h2>
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div>✔ 35+ Specialties</div>
            <div>✔ 10L+ Satisfied Users</div>
            <div>✔ Consult online in 10 mins</div>
            <div>✔ Free follow-up for 5 days</div>
          </div>
        </div>
      </div>

      {/* Tab Section */}
      <div className="flex justify-center mt-8">
        <button
          className={`mr-3 px-6 py-3 rounded-lg text-lg font-semibold transition ${
            tab === "symptoms" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setTab("symptoms")}
        >
          Symptoms
        </button>
        <button
          className={`px-6 py-3 rounded-lg text-lg font-semibold transition ${
            tab === "specialties" ? "bg-blue-600 text-white" : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setTab("specialties")}
        >
          Specialties
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-lg mt-6">
        {(tab === "symptoms" ? symptoms : specialties).map((item, index) => (
          <div
            key={index}
            className="p-6 text-center bg-white shadow-lg rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition duration-300"
          >
            <div className="text-4xl text-blue-500 mb-3">{item.icon}</div>
            <div className="font-semibold">{item.name}</div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-8">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition duration-300">
        <Link to="/services">View all</Link>
        </button>
      </div>
    </div>
  );
};