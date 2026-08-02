import { useContext, useEffect, useState } from "react";
import { authContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDoctors = () => {
  const { token } = useContext(authContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("all");

  const fetchDoctors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/doctors/admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch doctors");
      if (data.success) {
        setDoctors(data.data);
        setFilteredDoctors(data.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const updateApproval = async (doctorId, status) => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/doctors/approve", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorId, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update approval");
      if (data.success) {
        setDoctors((prev) =>
          prev.map((d) => (d._id === doctorId ? { ...d, isApproved: status } : d))
        );
        setFilteredDoctors((prev) =>
          prev.map((d) => (d._id === doctorId ? { ...d, isApproved: status } : d))
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;
    if (searchTerm) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (specializationFilter !== "all") {
      filtered = filtered.filter(
        (doctor) => doctor.specialization === specializationFilter
      );
    }
    setFilteredDoctors(filtered);
  }, [searchTerm, specializationFilter, doctors]);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-indigo-200 pb-3">
        Doctors Management
      </h2>
      {error && <p className="text-red-600 mb-4 text-lg">Error: {error}</p>}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full md:w-1/2"
        />
        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full md:w-1/4"
        >
          <option value="all">All Specializations</option>
          <option value="surgery">Surgery</option>
          <option value="cardiology">Cardiology</option>
          <option value="dermatology">Dermatology</option>
          <option value="endocrinology">Endocrinology</option>
          <option value="gastroenterology">Gastroenterology</option>
          <option value="neurology">Neurology</option>
          <option value="oncology">Oncology</option>
          <option value="orthopedics">Orthopedics</option>
          <option value="pediatrics">Pediatrics</option>
          <option value="psychiatry">Psychiatry</option>
          <option value="radiology">Radiology</option>
        </select>
      </div>
      {filteredDoctors.length > 0 ? (
        <div className="space-y-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="bg-white border border-indigo-200 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {doctor.photo && (
                  <img
                    src={doctor.photo}
                    alt={doctor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 mt-1"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-indigo-900">
                      Dr. {doctor.name || "N/A"}, {doctor.specialization || "N/A"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doctor.isApproved === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : doctor.isApproved === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {doctor.isApproved.charAt(0).toUpperCase() + doctor.isApproved.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span><strong>Email:</strong> {doctor.email || "N/A"}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/doctors/${doctor._id}`)}
                      className="text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg transition duration-200 transform hover:scale-105"
                    >
                      View Profile
                    </button>
                    {doctor.isApproved === "pending" && (
                      <>
                        <button
                          onClick={() => updateApproval(doctor._id, "approved")}
                          className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateApproval(doctor._id, "cancelled")}
                          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">
            Last Updated:{" "}
            {new Date(
              Math.max(...doctors.map((d) => new Date(d.updatedAt)))
            ).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <h2 className="mt-10 text-center text-gray-800 text-2xl font-semibold">
          No doctors found.
        </h2>
      )}
    </div>
  );
};

export default AdminDoctors;