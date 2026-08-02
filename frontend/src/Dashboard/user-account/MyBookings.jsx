import { useState, useEffect } from "react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import axios from "axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MyBookings = () => {
  const { user, token } = useAuth();
  const {
    data: initialAppointments,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/users/appointments/my-appointments`);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [medicalNotes, setMedicalNotes] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const fetchMedicalNotes = async () => {
    try {
      const res = await fetch(`${BASE_URL}/medical-notes/patient/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const sortedNotes = data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMedicalNotes(sortedNotes);
      } else {
        console.error("Failed to fetch medical notes:", data.message);
      }
    } catch (err) {
      console.error("Error fetching medical notes:", err.message);
    }
  };

  useEffect(() => {
    if (initialAppointments && initialAppointments.length > 0) {
      setAppointments(initialAppointments);
    }
  }, [initialAppointments]);

  useEffect(() => {
    if (user && user._id) fetchMedicalNotes();
  }, [user, token]);

  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/cancel/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === bookingId ? { ...appt, status: "cancelled" } : appt
          )
        );
        toast.success("Appointment cancelled successfully");
      } else {
        toast.error(data.message || "Failed to cancel appointment");
      }
    } catch (err) {
      toast.error("Error cancelling appointment: " + err.message);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      {loading && (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <Loading />
        </div>
      )}
      {error && (
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <Error errMessage={error} />
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-blue-800 mb-10 border-b-4 border-blue-200 pb-3">
            🗓️ Your Appointments
          </h1>

          {appointments.filter((a) => a.status !== "cancelled").map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white border border-indigo-200 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {appointment.doctor?.photo && (
                  <img
                    src={appointment.doctor.photo}
                    alt={appointment.doctor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 mt-1"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-indigo-900">
                      Dr. {appointment.doctor?.name || "N/A"}, {appointment.doctor?.specialization || "N/A"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span><strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                  </p>
                  <button
                    onClick={() => navigate(`/doctors/${appointment.doctor._id}`)}
                    className="mt-2 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg transition duration-200 transform hover:scale-105"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => cancelBooking(appointment._id)}
                    disabled={appointment.status === "cancelled"}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 transform hover:scale-105 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {appointment.status === "cancelled" ? "Cancelled" : "Cancel"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowNoteModal(true);
                    }}
                    className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-105 text-sm"
                  >
                    View Note
                  </button>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <h2 className="mt-10 text-center text-gray-800 text-2xl font-semibold">
              You have no appointments yet.
            </h2>
          )}

          {appointments.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Last Updated:{" "}
              {new Date(
                Math.max(...appointments.map((a) => new Date(a.updatedAt)))
              ).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      {showNoteModal && selectedAppointment && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-t-2xl border-b-2 border-indigo-200">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900">
                Notes for: {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {medicalNotes.filter((note) => note.booking._id === selectedAppointment._id).length > 0 ? (
                medicalNotes
                  .filter((note) => note.booking._id === selectedAppointment._id)
                  .map((note, i) => (
                    <div key={note._id} className="bg-gray-50 border border-indigo-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-base font-semibold text-gray-800">Note #{i + 1}</h4>
                        <span className="text-sm text-gray-500 font-medium">
                          {new Date(note.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium text-gray-900">Doctor:</span>{" "}
                        Dr. {note.doctor.name || "Unknown"}, {note.doctor.specialization || "N/A"}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium text-gray-900">Booking Date:</span>{" "}
                        {new Date(note.booking.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium text-gray-900">Diagnosis:</span>{" "}
                        {note.diagnosis || "N/A"}
                      </p>
                      <p className="text-gray-700 mb-2">
                        <span className="font-medium text-gray-900">Treatment:</span>{" "}
                        {note.treatment || "N/A"}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">Notes:</span>{" "}
                        {note.notes || "No additional notes"}
                      </p>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center text-lg">No notes available for this appointment.</p>
              )}
              {medicalNotes.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Last Updated:{" "}
                  {new Date(
                    Math.max(...medicalNotes.map((n) => new Date(n.updatedAt)))
                  ).toLocaleDateString()}
                </p>
              )}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition duration-200 transform hover:scale-105 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;