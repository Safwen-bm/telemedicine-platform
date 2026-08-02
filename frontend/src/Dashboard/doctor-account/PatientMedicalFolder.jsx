import { useState, useEffect } from "react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { ClipboardList, Stethoscope, AlertTriangle, FlaskConical, Pill, ArrowLeft } from "lucide-react";
import Loading from "../../components/Loader/Loading";

const PatientMedicalFolder = () => {
  const { patientId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    allergies: "",
    medications: { name: "", dosage: "", startDate: "", endDate: "" },
    labResults: { testName: "", result: "", date: "" },
  });

  const {
    data: medicalFolder,
    loading,
    error,
    refetch,
  } = useFetchData(`${BASE_URL}/medical-folder/${patientId}`, token);

  // Debug the structure of appointments and medical notes
  useEffect(() => {
    if (medicalFolder?.appointments) {
      console.log("Appointments:", medicalFolder.appointments);
    }
    if (medicalFolder?.medicalNotes) {
      console.log("Medical Notes:", medicalFolder.medicalNotes);
    }
  }, [medicalFolder]);

  const handleSubmit = async (e, section) => {
    e.preventDefault();
    const updatePayload = {};

    if (section === "allergies" && formData.allergies) {
      updatePayload.$push = { allergies: formData.allergies.trim() };
    } else if (
      section === "medications" &&
      formData.medications.name &&
      formData.medications.dosage &&
      formData.medications.startDate
    ) {
      updatePayload.$push = { medications: formData.medications };
    } else if (
      section === "labResults" &&
      formData.labResults.testName &&
      formData.labResults.result &&
      formData.labResults.date
    ) {
      updatePayload.$push = { labResults: formData.labResults };
    } else {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/medical-folder/${patientId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (res.ok) {
        await refetch();
        setFormData({
          allergies: "",
          medications: { name: "", dosage: "", startDate: "", endDate: "" },
          labResults: { testName: "", result: "", date: "" },
        });
        toast.success(data.message || "Medical folder updated successfully");
      } else {
        toast.error(data.message || "Failed to update medical folder");
      }
    } catch (err) {
      toast.error("Error updating medical folder: " + (err.message || "Unknown error"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-red-700">Error: {error}</p>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 mb-4">
      <Icon className="text-blue-600 w-6 h-6" />
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
  );

  return (
    <div className="p-6 md:p-12 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-10 border-b border-gray-300 pb-4">
        <h1 className="text-4xl font-bold text-gray-800">
          Patient Medical Folder
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Patient Info */}
      <div className="mb-12">
        <SectionHeader icon={ClipboardList} title="Patient Information" />
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            {medicalFolder?.patient?.photo ? (
              <img
                src={medicalFolder.patient.photo}
                alt={medicalFolder.patient.name || "Patient"}
                className="w-24 h-24 object-cover rounded-full border-2 border-blue-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">
                No Photo
              </div>
            )}
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 font-medium">Name</p>
              <p className="text-lg font-semibold text-gray-800">{medicalFolder?.patient?.name || "Unknown Patient"}</p>
            </div>
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 font-medium">Email</p>
              <p className="text-lg font-semibold text-gray-800">{medicalFolder?.patient?.email || "N/A"}</p>
            </div>
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
              <p className="text-lg font-semibold text-gray-800">{medicalFolder?.patient?.dateOfBirth ? new Date(medicalFolder.patient.dateOfBirth).toLocaleDateString() : "N/A"}</p>
            </div>
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 font-medium">Gender</p>
              <p className="text-lg font-semibold text-gray-800">{medicalFolder?.patient?.gender ? medicalFolder.patient.gender.charAt(0).toUpperCase() + medicalFolder.patient.gender.slice(1) : "N/A"}</p>
            </div>
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 font-medium">Blood Type</p>
              <p className="text-lg font-semibold text-gray-800">{medicalFolder?.patient?.bloodType || "N/A"}</p>
            </div>
            <div className="text-gray-700">
              <p className="text-sm text-gray-500 font-medium">Medical Conditions</p>
              <p className="text-lg font-semibold text-gray-800">{medicalFolder?.patient?.conditions?.length ? medicalFolder.patient.conditions.join(", ") : "None"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Section Block */}
        {[
          {
            title: "Past Appointments",
            icon: Stethoscope,
            content: medicalFolder?.appointments?.filter((a) => a.status === "completed"),
            render: (appt) => (
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  <strong>Date:</strong> {new Date(appt.appointmentDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Time:</strong> {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-base font-semibold text-blue-600 mt-1">
                  <strong>Doctor:</strong> Dr. {appt.doctor?.name || "Unknown"}, {appt.doctor?.specialization || "N/A"}
                </p>
              </div>
            ),
            fallback: "No completed appointments recorded.",
            lastUpdated: medicalFolder?.appointments?.length
              ? new Date(Math.max(...medicalFolder.appointments.map(a => new Date(a.updatedAt)))).toLocaleDateString()
              : null,
          },
          {
            title: "Medical Notes",
            icon: ClipboardList,
            content: medicalFolder?.medicalNotes,
            render: (note) => (
              <>
                <p className="text-base font-semibold text-blue-600">
                  <strong>Doctor:</strong> Dr. {note.doctor?.name || "Unknown"}, {note.doctor?.specialization || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Diagnosis:</strong> {note.diagnosis || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Treatment:</strong> {note.treatment || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Notes:</strong> {note.notes || "No additional notes"}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Date:</strong> {new Date(note.createdAt).toLocaleDateString("en-GB") || "N/A"}
                </p>
              </>
            ),
            fallback: "No medical notes recorded.",
            lastUpdated: medicalFolder?.medicalNotes?.length
              ? new Date(Math.max(...medicalFolder.medicalNotes.map(n => new Date(n.updatedAt)))).toLocaleDateString()
              : null,
          },
        ].map(({ title, icon, content, render, fallback, lastUpdated }, i) => (
          <div key={i}>
            <SectionHeader icon={icon} title={title} />
            {content?.length ? (
              <ul className="space-y-4">
                {content.map((item, idx) => (
                  <li
                    key={item._id || idx}
                    className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                  >
                    {render(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">{fallback}</p>
            )}
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-2">Last Updated: {lastUpdated}</p>
            )}
          </div>
        ))}

        {/* Allergies */}
        <div>
          <SectionHeader icon={AlertTriangle} title="Allergies" />
          {medicalFolder?.allergies?.length > 0 ? (
            <ul className="space-y-4">
              {medicalFolder.allergies.map((item, idx) => (
                <li
                  key={idx}
                  className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <p className="text-sm text-gray-600">{item}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-4">No allergies recorded.</p>
          )}
          <form onSubmit={(e) => handleSubmit(e, "allergies")} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-4">
            <input
              type="text"
              placeholder="Enter allergy (e.g., Peanuts)"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button type="submit" className="mt-3 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition">
              Add Allergy
            </button>
          </form>
          {medicalFolder?.updatedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Last Updated: {new Date(medicalFolder.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Medications */}
        <div>
          <SectionHeader icon={Pill} title="Medications" />
          {medicalFolder?.medications?.length > 0 ? (
            <ul className="space-y-4">
              {medicalFolder.medications.map((med, idx) => (
                <li
                  key={med._id || idx}
                  className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <p className="text-base font-semibold text-blue-600">
                    <strong>{med.name}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Dosage:</strong> {med.dosage}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Start:</strong> {new Date(med.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>End:</strong> {med.endDate ? new Date(med.endDate).toLocaleDateString() : "Ongoing"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-4">No medications recorded.</p>
          )}
          <form onSubmit={(e) => handleSubmit(e, "medications")} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-4">
            <input
              type="text"
              placeholder="Medication name (e.g., Ibuprofen)"
              value={formData.medications.name}
              onChange={(e) => setFormData({ ...formData, medications: { ...formData.medications, name: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g., 200mg daily)"
              value={formData.medications.dosage}
              onChange={(e) => setFormData({ ...formData, medications: { ...formData.medications, dosage: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              required
            />
            <input
              type="date"
              value={formData.medications.startDate}
              onChange={(e) => setFormData({ ...formData, medications: { ...formData.medications, startDate: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              required
            />
            <input
              type="date"
              value={formData.medications.endDate}
              onChange={(e) => setFormData({ ...formData, medications: { ...formData.medications, endDate: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition">
              Add Medication
            </button>
          </form>
          {medicalFolder?.updatedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Last Updated: {new Date(medicalFolder.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Lab Results */}
        <div>
          <SectionHeader icon={FlaskConical} title="Lab Results" />
          {medicalFolder?.labResults?.length > 0 ? (
            <ul className="space-y-4">
              {medicalFolder.labResults.map((res, idx) => (
                <li
                  key={res._id || idx}
                  className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
                >
                  <p className="text-base font-semibold text-blue-600">
                    <strong>{res.testName}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Result:</strong> {res.result}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Date:</strong> {new Date(res.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 mb-4">No lab results recorded.</p>
          )}
          <form onSubmit={(e) => handleSubmit(e, "labResults")} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-4">
            <input
              type="text"
              placeholder="Test name (e.g., Blood Test)"
              value={formData.labResults.testName}
              onChange={(e) => setFormData({ ...formData, labResults: { ...formData.labResults, testName: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              required
            />
            <input
              type="text"
              placeholder="Result (e.g., Normal)"
              value={formData.labResults.result}
              onChange={(e) => setFormData({ ...formData, labResults: { ...formData.labResults, result: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              required
            />
            <input
              type="date"
              value={formData.labResults.date}
              onChange={(e) => setFormData({ ...formData, labResults: { ...formData.labResults, date: e.target.value } })}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition">
              Add Lab Result
            </button>
          </form>
          {medicalFolder?.updatedAt && (
            <p className="text-xs text-gray-400 mt-2">
              Last Updated: {new Date(medicalFolder.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalFolder;