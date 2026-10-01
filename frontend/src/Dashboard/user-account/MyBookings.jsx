//Telemedecine\frontend\src\Dashboard\user-account\MyBookings.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Video } from "lucide-react";
import { toast } from "react-toastify";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  PanelHeader,
  EmptyState,
  StatusBadge,
  Modal,
  fmtDate,
  fmtTime,
} from "../../components/ui/dashboard.jsx";
import MedicalNotes from "./MedicalNotes";

const FINISHED = ["completed", "cancelled"];

const btnPrimary =
  "inline-flex items-center gap-2 rounded-[8px] bg-primaryColor px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-ink";
const btnSecondary =
  "rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor transition-colors hover:border-primaryColor hover:text-primaryColor";

const AppointmentCard = ({ appt, upcoming, onCancel, onNotes }) => {
  const date = new Date(appt.appointmentDate);
  const valid = !Number.isNaN(date.getTime());
  const doctor = appt.doctor || {};
  const status = appt.status || "";
  const canJoin =
  ["pending", "approved"].includes(status) &&
  valid &&
  Date.now() >= date.getTime() - 15 * 60 * 1000;
  const canCancel = upcoming && !FINISHED.includes(status);

  return (
    <article className="flex flex-col gap-5 rounded-[14px] border border-line bg-white p-5 md:flex-row md:items-center">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[10px] bg-mint text-primaryColor">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
          {valid ? date.toLocaleString("en-US", { month: "short" }) : "N/A"}
        </span>
        <span className="font-heading text-[26px] font-semibold leading-none">
          {valid ? date.getDate() : "-"}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4">
        {doctor.photo ? (
          <img
            src={doctor.photo}
            alt={doctor.name || "Doctor"}
            className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper font-heading text-[18px] text-primaryColor">
            {(doctor.name || "D").charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-heading text-[20px] font-semibold text-headingColor">
            Dr. {doctor.name || "Unknown"}
          </p>
          <p className="text-[14px] text-textColor">
            {doctor.specialization || "Specialty not set"}
            {valid && ` · ${fmtTime(appt.appointmentDate)}`}
          </p>
          {doctor._id && (
            <Link
              to={`/doctors/${doctor._id}`}
              className="mt-1 inline-block text-[13px] font-semibold text-primaryColor hover:underline"
            >
              View doctor profile
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end">
        <StatusBadge status={status} />
        <div className="flex flex-wrap items-center gap-3">
          {canJoin && (
            <Link to={`/consultation/${appt._id}`} className={btnPrimary}>
              <Video className="h-4 w-4" /> Join video room
            </Link>
          )}
          {!upcoming && status !== "cancelled" && (
            <button type="button" className={btnSecondary} onClick={() => onNotes(appt)}>
              View notes
            </button>
          )}
          {canCancel && (
            <button
              type="button"
              className="text-[14px] font-semibold text-red-700 hover:underline"
              onClick={() => onCancel(appt)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const GroupTitle = ({ children }) => (
  <h3 className="mb-3 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-textColor">
    {children}
  </h3>
);

const MyBookings = () => {
  const { token } = useAuth();
  const {
    data: initialAppointments,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/users/appointments/my-appointments`);

  const [appointments, setAppointments] = useState([]);
  const [notesFor, setNotesFor] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setAppointments(Array.isArray(initialAppointments) ? initialAppointments : []);
  }, [initialAppointments]);

  const { upcoming, past } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const time = (a) => new Date(a.appointmentDate).getTime() || 0;
    const isPast = (a) =>
      FINISHED.includes(a.status) || time(a) < startOfToday.getTime();

    return {
      upcoming: appointments.filter((a) => !isPast(a)).sort((a, b) => time(a) - time(b)),
      past: appointments.filter(isPast).sort((a, b) => time(b) - time(a)),
    };
  }, [appointments]);

  const confirmCancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings/cancel/${toCancel._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to cancel appointment");

      setAppointments((prev) =>
        prev.map((a) => (a._id === toCancel._id ? { ...a, status: "cancelled" } : a))
      );
      toast.success("Appointment cancelled");
      setToCancel(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const findDoctorAction = (
    <Link to="/doctors" className={btnPrimary}>
      Find a doctor
    </Link>
  );

  return (
    <div>
      <PanelHeader
        title="Appointments"
        description="Your upcoming consultations and your history."
        action={appointments.length > 0 ? findDoctorAction : null}
      />

      {loading && !error && <Loading />}
      {error && !loading && <ErrorMsg errMessage={error} />}

      {!loading && !error && appointments.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="No appointments yet"
          text="Book your first online consultation. It takes a couple of minutes."
          action={findDoctorAction}
        />
      )}

      {!loading && !error && appointments.length > 0 && (
        <div className="space-y-10">
          <div>
            <GroupTitle>Upcoming ({upcoming.length})</GroupTitle>
            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appt={appt}
                    upcoming
                    onCancel={setToCancel}
                    onNotes={setNotesFor}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing scheduled"
                text="You have no upcoming appointments."
                action={findDoctorAction}
              />
            )}
          </div>

          {past.length > 0 && (
            <div>
              <GroupTitle>Past ({past.length})</GroupTitle>
              <div className="space-y-4">
                {past.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appt={appt}
                    upcoming={false}
                    onCancel={setToCancel}
                    onNotes={setNotesFor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {notesFor && (
        <Modal
          title={`Notes from ${fmtDate(notesFor.appointmentDate)}`}
          onClose={() => setNotesFor(null)}
        >
          <MedicalNotes bookingId={notesFor._id} />
        </Modal>
      )}

      {toCancel && (
        <Modal
          title="Cancel this appointment?"
          onClose={() => !cancelling && setToCancel(null)}
          footer={
            <>
              <button
                type="button"
                className={btnSecondary}
                disabled={cancelling}
                onClick={() => setToCancel(null)}
              >
                Keep appointment
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={confirmCancel}
                className="rounded-[8px] bg-red-700 px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, cancel"}
              </button>
            </>
          }
        >
          <p className="text-[15px] leading-7 text-textColor">
            Your appointment with{" "}
            <strong className="text-headingColor">
              Dr. {toCancel.doctor?.name || "Unknown"}
            </strong>{" "}
            on {fmtDate(toCancel.appointmentDate)} at{" "}
            {fmtTime(toCancel.appointmentDate)} will be cancelled.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;