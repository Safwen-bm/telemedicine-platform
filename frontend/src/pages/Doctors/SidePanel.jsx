import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../context/AuthContext.jsx";
import { BASE_URL } from "../../config";
import { inputClass, labelClass } from "../../components/ui/dashboard.jsx";

const CURRENCY = "USD";

const SidePanel = ({ doctorId, ticketPrice }) => {
  const { token, role } = useAuth();
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const bookingHandler = async () => {
    if (!appointmentDate) {
      toast.error("Please select an appointment date and time");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings/checkout-session/${doctorId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentDate: appointmentDate.toISOString() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Please try again");
      if (!data.session?.url) throw new Error("The payment page is unavailable. Please try again.");

      window.location.href = data.session.url; // keep the loading state while redirecting
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[14px] border border-line bg-white p-6">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <p className="font-heading text-[18px] font-semibold text-headingColor">
          Consultation fee
        </p>
        <span className="font-heading text-[24px] font-semibold text-headingColor">
          {ticketPrice} <span className="text-[14px] font-normal text-textColor">{CURRENCY}</span>
        </span>
      </div>

      {!token ? (
        <p className="mt-6 text-[15px] leading-7 text-textColor">
          <Link to="/login" className="font-semibold text-primaryColor hover:underline">
            Log in
          </Link>{" "}
          or{" "}
          <Link to="/register" className="font-semibold text-primaryColor hover:underline">
            create an account
          </Link>{" "}
          to book this doctor.
        </p>
      ) : role !== "patient" ? (
        <p className="mt-6 text-[15px] leading-7 text-textColor">
          Only patient accounts can book consultations.
        </p>
      ) : (
        <>
          <div className="mt-6">
            <label className={labelClass}>Select date and time</label>
            <DatePicker
              selected={appointmentDate}
              onChange={(date) => setAppointmentDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              filterTime={(time) => new Date(time).getTime() > Date.now()}
              wrapperClassName="w-full"
              className={inputClass}
              placeholderText="Select date and time"
            />
          </div>
          <button
            type="button"
            onClick={bookingHandler}
            disabled={loading}
            className="mt-6 w-full rounded-[8px] bg-primaryColor px-6 py-3 font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Redirecting to payment..." : "Book appointment"}
          </button>
          <p className="mt-3 text-center text-[12px] text-textColor">
            Secure payment by Stripe. Cancel any pending appointment for a refund.
          </p>
        </>
      )}
    </div>
  );
};

export default SidePanel;