import { useContext, useEffect, useState } from "react";
import { authContext } from "../../context/AuthContext";

const Patients = () => {
  const { token } = useContext(authContext);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPatients = async () => {
    try {
      console.log("Fetching patients with token:", token);
      const res = await fetch("http://localhost:5000/api/v1/users/admin/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch patients");
      if (data.success) {
        setPatients(data.data);
        setFilteredPatients(data.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePatient = async (patientId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/users/${patientId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete patient");
      if (data.success) {
        setPatients((prev) => prev.filter((p) => p._id !== patientId));
        setFilteredPatients((prev) => prev.filter((p) => p._id !== patientId));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-indigo-200 pb-3">
        Patients Management
      </h2>
      {error && <p className="text-red-600 mb-4 text-lg">Error: {error}</p>}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full md:w-1/2"
        />
      </div>
      {filteredPatients.length > 0 ? (
        <div className="space-y-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="bg-white border border-indigo-200 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {patient.photo && (
                  <img
                    src={patient.photo}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 mt-1"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-indigo-900">
                      {patient.name || "N/A"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    <span><strong>Email:</strong> {patient.email || "N/A"}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deletePatient(patient._id)}
                      className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition duration-200 transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">
            Last Updated:{" "}
            {new Date(
              Math.max(...patients.map((p) => new Date(p.updatedAt)))
            ).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <h2 className="mt-10 text-center text-gray-800 text-2xl font-semibold">
          No patients found.
        </h2>
      )}
    </div>
  );
};

export default Patients;