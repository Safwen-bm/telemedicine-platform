import { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../config";

const SidePanel = ({ doctorId, ticketPrice }) => {
  const { token } = useAuth();
  const [appointmentDate, setAppointmentDate] = useState(null);

  const bookingHandler = async () => {
    if (!appointmentDate) {
      toast.error("Please select an appointment date and time");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/bookings/checkout-session/${doctorId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentDate: appointmentDate.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Please try again");
      if (data.session.url) window.location.href = data.session.url;
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <p className="text-lg font-semibold text-gray-900">Consultation Fee</p>
        <span className="text-xl font-bold text-gray-900">{ticketPrice} TND</span>
      </div>
      <div className="mt-6">
        <label className="block text-gray-900 font-medium mb-2">
          Select Appointment Date and Time
        </label>
        <DatePicker
          selected={appointmentDate}
          onChange={(date) => setAppointmentDate(date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-700"
          placeholderText="Select date and time"
        />
      </div>
      <button
        onClick={bookingHandler}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 w-full mt-6"
      >
        Book Appointment
      </button>
    </div>
  );
};

export default SidePanel;