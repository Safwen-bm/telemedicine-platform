import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { ShieldCheck, Video, RotateCcw } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { BASE_URL } from "../../config";

// Default working hours for every doctor. Change them here.
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 17;
const SLOT_MINUTES = 30;
const DAYS_AHEAD = 14;
const MIN_LEAD_MINUTES = 30; // a slot must start at least this far from now

const pad = (n) => String(n).padStart(2, "0");
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const buildDays = (bookedTimes) => {
  const earliest = Date.now() + MIN_LEAD_MINUTES * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const slots = [];
    for (let m = DAY_START_HOUR * 60; m < DAY_END_HOUR * 60; m += SLOT_MINUTES) {
      const slot = new Date(date);
      slot.setHours(Math.floor(m / 60), m % 60, 0, 0);
      const time = slot.getTime();
      slots.push({ time, available: time >= earliest && !bookedTimes.has(time) });
    }

    return { key: keyOf(date), date, slots, available: slots.some((s) => s.available) };
  });
};

const timeLabel = (time) =>
  new Date(time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const PanelHeader = ({ doctorName, price, hasPrice }) => (
  <div className="bg-ink px-6 py-6 text-paper">
    <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-yellowColor">
      Video consultation
    </p>
    {hasPrice ? (
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-heading text-[48px] font-semibold leading-none">${price}</span>
        <span className="text-[14px] text-paper/60">per consultation</span>
      </p>
    ) : (
      <p className="mt-3 font-heading text-[26px] font-semibold leading-tight">Fee not set yet</p>
    )}
    {doctorName && <p className="mt-3 text-[14px] text-paper/70">with {doctorName}</p>}
  </div>
);

const Notes = () => (
  <ul className="mt-6 space-y-3 border-t border-line pt-5 text-[13px] leading-5 text-textColor">
    <li className="flex gap-3">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primaryColor" />
      Secure payment by Stripe
    </li>
    <li className="flex gap-3">
      <Video className="mt-0.5 h-4 w-4 shrink-0 text-primaryColor" />
      Video call in your browser, nothing to install
    </li>
    <li className="flex gap-3">
      <RotateCcw className="mt-0.5 h-4 w-4 shrink-0 text-primaryColor" />
      Full refund if you cancel before the appointment
    </li>
  </ul>
);

const SidePanel = ({ doctorId, doctorName, ticketPrice }) => {
  const { token, role } = useAuth();
  const { pathname } = useLocation();

  const [booked, setBooked] = useState(() => new Set());
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [chosenDay, setChosenDay] = useState(null);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const price = Number(ticketPrice);
  const hasPrice = Number.isFinite(price) && price > 0;
  const isPatient = Boolean(token) && role === "patient";

  const loadAvailability = useCallback(async () => {
    if (!isPatient || !doctorId) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings/availability/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && Array.isArray(data.data)) {
        setBooked(new Set(data.data.map((iso) => new Date(iso).getTime())));
      }
    } catch {
      // The server still refuses a taken slot at payment time.
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorId, token, isPatient]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const days = useMemo(() => buildDays(booked), [booked]);
  const activeDay =
    days.find((d) => d.key === chosenDay && d.available) || days.find((d) => d.available) || null;
  const selectedSlot = activeDay?.slots.find((s) => s.time === chosenSlot && s.available) || null;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const bookingHandler = async () => {
    if (!selectedSlot) {
      toast.error("Please choose a date and a time");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings/checkout-session/${doctorId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentDate: new Date(selectedSlot.time).toISOString() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setChosenSlot(null);
          loadAvailability(); // someone just took it: refresh the grid
        }
        throw new Error(data.message || "Please try again");
      }
      if (!data.session?.url) throw new Error("The payment page is unavailable. Please try again.");

      window.location.href = data.session.url; // keep the loading state while redirecting
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  const shell = (children) => (
    <div className="overflow-hidden rounded-[14px] border border-line bg-white">
      <PanelHeader doctorName={doctorName} price={price} hasPrice={hasPrice} />
      <div className="p-6">{children}</div>
    </div>
  );

  if (!hasPrice) {
    return shell(
      <p className="text-[15px] leading-7 text-textColor">
        This doctor has not set a consultation fee yet, so booking is not available.
      </p>
    );
  }

  if (!token) {
    return shell(
      <>
        <p className="text-[15px] leading-7 text-textColor">
          Log in or create an account to choose a time and book this doctor.
        </p>
        <Link
          to={`/login?redirect=${encodeURIComponent(pathname)}`}
          className="mt-5 block rounded-[8px] bg-primaryColor px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-ink"
        >
          Log in to book
        </Link>
        <Link
          to="/register"
          className="mt-3 block text-center text-[14px] font-semibold text-primaryColor hover:underline"
        >
          Create an account
        </Link>
        <Notes />
      </>
    );
  }

  if (role !== "patient") {
    return shell(
      <p className="text-[15px] leading-7 text-textColor">
        Only patient accounts can book consultations.
      </p>
    );
  }

  return shell(
    <>
      {!activeDay ? (
        <p className="text-[15px] leading-7 text-textColor">
          No free time in the next {DAYS_AHEAD} days. Please check again soon.
        </p>
      ) : (
        <>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-textColor">
            Choose a day
          </p>
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-2" role="listbox" aria-label="Day">
            {days.map((d) => {
              const selected = activeDay.key === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={!d.available}
                  onClick={() => {
                    setChosenDay(d.key);
                    setChosenSlot(null);
                  }}
                  className={`w-[62px] shrink-0 rounded-[10px] border px-1 py-3 text-center transition-colors ${
                    selected
                      ? "border-primaryColor bg-primaryColor text-white"
                      : d.available
                      ? "border-line bg-white text-headingColor hover:border-primaryColor"
                      : "cursor-not-allowed border-line bg-paper text-textColor/40"
                  }`}
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.1em]">
                    {d.date.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="mt-1 block font-heading text-[24px] font-semibold leading-none">
                    {d.date.getDate()}
                  </span>
                  <span className="mt-1 block text-[11px]">
                    {d.date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-textColor">
            Choose a time {loadingSlots && <span className="font-normal normal-case">(checking...)</span>}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2" role="listbox" aria-label="Time">
            {activeDay.slots.map((s) => {
              const selected = selectedSlot?.time === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={!s.available}
                  onClick={() => setChosenSlot(s.time)}
                  className={`rounded-[8px] border px-1 py-2.5 text-[13px] font-semibold transition-colors ${
                    selected
                      ? "border-primaryColor bg-primaryColor text-white"
                      : s.available
                      ? "border-line bg-white text-headingColor hover:border-primaryColor"
                      : "cursor-not-allowed border-line bg-paper text-textColor/40 line-through"
                  }`}
                >
                  {timeLabel(s.time)}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[12px] text-textColor">Times shown in {timeZone}.</p>

          {selectedSlot && (
            <p className="mt-5 rounded-[8px] bg-mint px-4 py-3 text-[14px] font-semibold text-primaryColor">
              {new Date(selectedSlot.time).toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}

          <button
            type="button"
            onClick={bookingHandler}
            disabled={submitting || !selectedSlot}
            className="mt-5 w-full rounded-[8px] bg-primaryColor px-6 py-3.5 font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Redirecting to payment..."
              : selectedSlot
              ? `Book and pay $${price}`
              : "Choose a time"}
          </button>
        </>
      )}
      <Notes />
    </>
  );
};

export default SidePanel;