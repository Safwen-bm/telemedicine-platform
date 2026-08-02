import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";

const Appointments = ({ appointments: initialAppointments }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [noteData, setNoteData] = useState({ diagnosis: "", treatment: "", notes: "" });

  useEffect(() => {
    setAppointments(initialAppointments || []);
  }, [initialAppointments]);

  const cancelAppointment = async (bookingId) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/cancel/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      toast.error("Error cancelling appointment");
    }
  };

  const joinConsultation = (bookingId) => {
    navigate(`/consultation/${bookingId}`);
  };

  const sendReminder = async (bookingId) => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/notify/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Reminder sent successfully");
      } else {
        toast.error(data.message || "Failed to send reminder");
      }
    } catch (err) {
      toast.error("Error sending reminder");
    }
  };

  const openNoteModal = async (bookingId) => {
    const booking = appointments.find((appt) => appt._id === bookingId);
    setSelectedBooking(booking);

    if (booking.noteId) {
      try {
        const res = await fetch(`${BASE_URL}/medical-notes/patient/${booking.user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const note = data.data.find((n) => n._id === booking.noteId);
          if (note) {
            setNoteData({
              diagnosis: note.diagnosis || "",
              treatment: note.treatment || "",
              notes: note.notes || "",
            });
          }
        } else {
          toast.error("Failed to fetch existing note");
        }
      } catch (err) {
        toast.error("Error fetching existing note");
      }
    } else {
      setNoteData({ diagnosis: "", treatment: "", notes: "" });
    }
    setShowNoteModal(true);
  };

  const saveMedicalNote = async (e) => {
    e.preventDefault();
    try {
      const url = selectedBooking.noteId
        ? `${BASE_URL}/medical-notes/${selectedBooking.noteId}`
        : `${BASE_URL}/medical-notes`;
      const method = selectedBooking.noteId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          diagnosis: noteData.diagnosis,
          treatment: noteData.treatment,
          notes: noteData.notes,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setShowNoteModal(false);
        setNoteData({ diagnosis: "", treatment: "", notes: "" });
        if (!selectedBooking.noteId) {
          setAppointments((prev) =>
            prev.map((appt) =>
              appt._id === selectedBooking._id ? { ...appt, noteId: data.data._id, note: data.data } : appt
            )
          );
        } else {
          setAppointments((prev) =>
            prev.map((appt) =>
              appt._id === selectedBooking._id ? { ...appt, note: data.data } : appt
            )
          );
        }
      } else {
        toast.error(data.message || "Failed to save medical note");
      }
    } catch (err) {
      toast.error("Error saving medical note: " + err.message);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-indigo-200 pb-3">
        Appointments Management
      </h2>
      {appointments.length > 0 ? (
        <div className="space-y-6">
          {appointments.map((appointment) => {
            const appointmentDate = new Date(appointment.appointmentDate);
            const now = new Date();
            const canJoin = now >= appointmentDate && appointment.status === "pending";
            return (
              appointment.status !== "cancelled" && (
                <div
                  key={appointment._id}
                  className="bg-white border border-indigo-200 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {appointment.user?.photo && (
                      <img
                        src={appointment.user.photo}
                        alt={appointment.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 mt-1"
                      />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-indigo-900">
                          {appointment.user?.name || "N/A"}
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
                        onClick={() => navigate(`/doctors/medical-folder/${appointment.user._id}`)}
                        className="mt-2 text-sm bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-lg transition duration-200 transform hover:scale-105"
                      >
                        View Medical Folder
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <div className="flex gap-2 mt-2">
                      {appointment.status === "pending" && (
                        <>
                          {canJoin && (
                            <button
                              onClick={() => joinConsultation(appointment._id)}
                              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105 text-sm"
                            >
                              Join
                            </button>
                          )}
                          <button
                            onClick={() => sendReminder(appointment._id)}
                            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 transform hover:scale-105 text-sm"
                          >
                            Remind
                          </button>
                          <button
                            onClick={() => cancelAppointment(appointment._id)}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 transform hover:scale-105 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === "completed" && (
                        <button
                          onClick={() => openNoteModal(appointment._id)}
                          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-105 text-sm"
                        >
                          {appointment.noteId ? "Edit Medical Note" : "Add Medical Note"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            );
          })}
          {appointments.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              Last Updated:{" "}
              {new Date(
                Math.max(...appointments.map((a) => new Date(a.updatedAt)))
              ).toLocaleDateString()}
            </p>
          )}
        </div>
      ) : (
        <h2 className="mt-10 text-center text-gray-800 text-2xl font-semibold">
          No appointments available.
        </h2>
      )}

      {showNoteModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all duration-300 scale-100">
            <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-t-2xl border-b-2 border-indigo-200">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedBooking.noteId ? "Edit" : "Add"} Medical Note for {selectedBooking.user?.name}
              </h3>
            </div>
            <div className="p-4">
              <form onSubmit={saveMedicalNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <input
                    type="text"
                    value={noteData.diagnosis}
                    onChange={(e) => setNoteData({ ...noteData, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis (e.g., Flu)"
                    className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Treatment</label>
                  <input
                    type="text"
                    value={noteData.treatment}
                    onChange={(e) => setNoteData({ ...noteData, treatment: e.target.value })}
                    placeholder="Enter treatment (e.g., Rest, Hydration)"
                    className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                  <textarea
                    value={noteData.notes}
                    onChange={(e) => setNoteData({ ...noteData, notes: e.target.value })}
                    placeholder="Any additional notes (optional)"
                    className="mt-1 p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-32 transition duration-200 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
                    className="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition duration-200 transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-105"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;