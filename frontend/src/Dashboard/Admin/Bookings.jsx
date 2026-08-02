import { useContext, useEffect, useState } from "react";
import { authContext } from "../../context/AuthContext";

const Bookings = () => {
  const { token } = useContext(authContext);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBookings = async () => {
    try {
      console.log("Fetching bookings with token:", token);
      const res = await fetch("http://localhost:5000/api/v1/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
      if (data.success) {
        setBookings(data.data);
        setFilteredBookings(data.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/bookings/cancel/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
        );
        setFilteredBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: "cancelled" } : b))
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;
    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }
    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-indigo-200 pb-3">
        Bookings Management
      </h2>
      {error && <p className="text-red-600 mb-4 text-lg">Error: {error}</p>}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by patient or doctor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full md:w-1/2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full md:w-1/4"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {filteredBookings.length > 0 ? (
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white border border-indigo-200 rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-indigo-900">
                      {booking.user?.name || "N/A"}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : "N/A"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a2 2 0 00-2-2h-3m-2 4h-5a2 2 0 01-2-2v-2m7-6a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span><strong>Doctor:</strong> Dr. {booking.doctor?.name || "N/A"}, {booking.doctor?.specialization || "N/A"}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span><strong>Date:</strong> {new Date(booking.appointmentDate).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span><strong>Time:</strong> {new Date(booking.appointmentDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-2">
                {booking.status === "pending" && (
                  <button
                    onClick={() => cancelBooking(booking._id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 transform hover:scale-105 text-sm"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">
            Last Updated:{" "}
            {new Date(
              Math.max(...bookings.map((b) => new Date(b.updatedAt)))
            ).toLocaleDateString()}
          </p>
        </div>
      ) : (
        <h2 className="mt-10 text-center text-gray-800 text-2xl font-semibold">
          No bookings found.
        </h2>
      )}
    </div>
  );
};

export default Bookings;