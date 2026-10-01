import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { BASE_URL } from "../config";

const CheckoutSuccessPage = () => {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const { token } = useAuth();
  const started = useRef(false);
  const [state, setState] = useState(sessionId ? "confirming" : "missing");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId || !token || started.current) return;
    started.current = true;

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/bookings/confirm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          setMessage(data.message);
          setState("refunded");
          return;
        }
        if (!res.ok) throw new Error(data.message || "Could not confirm your payment");
        setState("success");
      } catch (err) {
        setMessage(err.message);
        setState("error");
      }
    })();
  }, [sessionId, token]);

  const card = "mx-auto w-full max-w-md rounded-[14px] border border-line bg-white p-8 text-center";
  const primary =
    "inline-block rounded-[8px] bg-primaryColor px-8 py-3 font-semibold text-white transition-colors hover:bg-ink";

  return (
    <section className="flex min-h-screen items-center px-5 pb-16 pt-28">
      <div className={card}>
        {!token && (
          <>
            <h1 className="font-heading text-[28px] font-semibold">Please log in</h1>
            <p className="mt-3 text-[15px] text-textColor">
              Log in to see your appointment.
            </p>
            <Link to="/login" className={`${primary} mt-8`}>
              Log in
            </Link>
          </>
        )}

        {token && state === "confirming" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-line border-t-primaryColor" />
            <h1 className="mt-6 font-heading text-[28px] font-semibold">Confirming your payment</h1>
            <p className="mt-3 text-[15px] text-textColor">This only takes a moment.</p>
          </>
        )}

        {token && state === "success" && (
          <>
            <FiCheckCircle className="mx-auto h-14 w-14 text-primaryColor" />
            <h1 className="mt-5 font-heading text-[30px] font-semibold">Appointment booked</h1>
            <p className="mt-3 text-[15px] leading-7 text-textColor">
              Thank you, your payment went through. You will find the consultation in
              your appointments, with a Join button when it is time.
            </p>
            <Link to="/users/profile/me?tab=appointments" className={`${primary} mt-8`}>
              View my appointments
            </Link>
          </>
        )}

        {token && state === "refunded" && (
          <>
            <FiAlertCircle className="mx-auto h-14 w-14 text-coral" />
            <h1 className="mt-5 font-heading text-[28px] font-semibold">Slot no longer available</h1>
            <p className="mt-3 text-[15px] leading-7 text-textColor">{message}</p>
            <Link to="/doctors" className={`${primary} mt-8`}>
              Choose another time
            </Link>
          </>
        )}

        {token && (state === "error" || state === "missing") && (
          <>
            <FiAlertCircle className="mx-auto h-14 w-14 text-coral" />
            <h1 className="mt-5 font-heading text-[28px] font-semibold">
              We could not confirm your booking
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-textColor">
              {state === "error"
                ? message
                : "No payment was found for this page."}{" "}
              If you were charged, your appointment will still appear in your dashboard
              shortly.
            </p>
            <Link to="/users/profile/me?tab=appointments" className={`${primary} mt-8`}>
              Check my appointments
            </Link>
          </>
        )}
      </div>
    </section>
  );
};

export default CheckoutSuccessPage;