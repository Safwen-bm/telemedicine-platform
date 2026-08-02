import { useState, useEffect } from "react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext.jsx";
import Loading from "../../components/Loader/Loading";
import { toast } from "react-toastify";
import {
  CalendarDays,
  ClipboardList,
  Stethoscope,
  AlertCircle,
  Pill,
  FlaskConical,
} from "lucide-react";

const MedicalFolder = () => {
  const { user, token } = useAuth();
  const { data: medicalFolder, loading, error } = useFetchData(
    `${BASE_URL}/medical-folder/${user._id}`,
    token
  );

  // Debug the structure of appointments and medical notes
  useEffect(() => {
    if (medicalFolder?.appointments) {
      console.log("Appointments:", medicalFolder.appointments);
    }
    if (medicalFolder?.medicalNotes) {
      console.log("Medical Notes:", medicalFolder.medicalNotes);
    }
  }, [medicalFolder]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loading />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-800 mb-10 border-b-4 border-blue-200 pb-3">
          🩺 Your Medical Folder
        </h1>

        <div className="space-y-10">
          <SectionCard title="Past Appointments" icon={<CalendarDays className="text-blue-600 w-6 h-6" />}>
            {medicalFolder?.appointments?.length > 0 ? (
              <div className="space-y-4">
                {medicalFolder.appointments
                  .filter((appt) => appt.status === "completed")
                  .map((appt) => (
                    <InfoCard key={appt._id}>
                      <div className="relative">
                        <div className="absolute top-2 right-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">Date:</span>{" "}
                          {new Date(appt.appointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">Time:</span>{" "}
                          {new Date(appt.appointmentDate).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                        <p className="text-base font-semibold text-blue-600 mt-1">
                          <span className="font-medium text-gray-900">Doctor:</span>{" "}
                          Dr. {appt.doctor?.name || "Unknown"}, {appt.doctor?.specialization || "N/A"}
                        </p>
                      </div>
                    </InfoCard>
                  ))}
              </div>
            ) : (
              <EmptyState message="No completed appointments recorded." />
            )}
            {medicalFolder?.appointments?.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Last Updated:{" "}
                {new Date(
                  Math.max(...medicalFolder.appointments.map((a) => new Date(a.updatedAt)))
                ).toLocaleDateString()}
              </p>
            )}
          </SectionCard>

          <SectionCard title="Medical Notes" icon={<Stethoscope className="text-blue-600 w-6 h-6" />}>
            {medicalFolder?.medicalNotes?.length > 0 ? (
              <div className="space-y-4">
                {medicalFolder.medicalNotes.map((note) => (
                  <InfoCard key={note._id}>
                    <p className="text-base font-semibold text-blue-600">
                      <span className="font-medium text-gray-900">Doctor:</span>{" "}
                      Dr. {note.doctor?.name || "Unknown"}, {note.doctor?.specialization || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Diagnosis:</span>{" "}
                      {note.diagnosis || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Treatment:</span>{" "}
                      {note.treatment || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Notes:</span>{" "}
                      {note.notes || "No additional notes"}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">Date:</span>{" "}
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </InfoCard>
                ))}
              </div>
            ) : (
              <EmptyState message="No medical notes recorded." />
            )}
            {medicalFolder?.medicalNotes?.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Last Updated:{" "}
                {new Date(
                  Math.max(...medicalFolder.medicalNotes.map((n) => new Date(n.updatedAt)))
                ).toLocaleDateString()}
              </p>
            )}
          </SectionCard>

          <SectionCard title="Allergies" icon={<AlertCircle className="text-blue-600 w-6 h-6" />}>
            {medicalFolder?.allergies?.length > 0 ? (
              <div className="space-y-4">
                {medicalFolder.allergies.map((allergy, index) => (
                  <InfoCard key={index}>
                    <p className="text-sm text-gray-600">{allergy}</p>
                  </InfoCard>
                ))}
              </div>
            ) : (
              <EmptyState message="No allergies recorded." />
            )}
            {medicalFolder?.updatedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Last Updated: {new Date(medicalFolder.updatedAt).toLocaleDateString()}
              </p>
            )}
          </SectionCard>

          <SectionCard title="Medications" icon={<Pill className="text-blue-600 w-6 h-6" />}>
            {medicalFolder?.medications?.length > 0 ? (
              <div className="space-y-4">
                {medicalFolder.medications.map((med) => (
                  <InfoCard key={med._id || med.name}>
                    <p className="text-base font-semibold text-blue-600">
                      <span className="font-medium text-gray-900">{med.name}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Dosage:</span> {med.dosage}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">Start Date:</span>{" "}
                      {new Date(med.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">End Date:</span>{" "}
                      {med.endDate ? new Date(med.endDate).toLocaleDateString() : "Ongoing"}
                    </p>
                  </InfoCard>
                ))}
              </div>
            ) : (
              <EmptyState message="No medications recorded." />
            )}
            {medicalFolder?.updatedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Last Updated: {new Date(medicalFolder.updatedAt).toLocaleDateString()}
              </p>
            )}
          </SectionCard>

          <SectionCard title="Lab Results" icon={<FlaskConical className="text-blue-600 w-6 h-6" />}>
            {medicalFolder?.labResults?.length > 0 ? (
              <div className="space-y-4">
                {medicalFolder.labResults.map((result) => (
                  <InfoCard key={result._id || result.testName}>
                    <p className="text-base font-semibold text-blue-600">
                      <span className="font-medium text-gray-900">{result.testName}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Result:</span> {result.result}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900">Date:</span>{" "}
                      {new Date(result.date).toLocaleDateString()}
                    </p>
                  </InfoCard>
                ))}
              </div>
            ) : (
              <EmptyState message="No lab results recorded." />
            )}
            {medicalFolder?.updatedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Last Updated: {new Date(medicalFolder.updatedAt).toLocaleDateString()}
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

// Section container
const SectionCard = ({ title, children, icon }) => (
  <div className="bg-white shadow-lg rounded-xl p-4 md:p-6 border-l-4 border-blue-500">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

// Card layout for entries
const InfoCard = ({ children }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
    {children}
  </div>
);

// Row inside a card (used as a fallback, but mostly replaced with custom layouts)
const InfoRow = ({ label, value }) => (
  <p className="text-sm text-gray-800 mb-1">
    <span className="font-medium text-gray-900">{label}:</span> {value}
  </p>
);

// Fallback message
const EmptyState = ({ message }) => (
  <p className="text-gray-500 italic">{message}</p>
);

export default MedicalFolder;