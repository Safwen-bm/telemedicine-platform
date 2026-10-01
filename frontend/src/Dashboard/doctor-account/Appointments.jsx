// Telemedecine\frontend\src\Dashboard\doctor-account\Appointments.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FolderOpen, Video, Bell, Check, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import { BASE_URL } from "../../config";
import {
  PanelHeader,
  EmptyState,
  StatusBadge,
  Modal,
  inputClass,
  labelClass,
  fmtDate,
  fmtTime,
} from "../../components/ui/dashboard.jsx";

const JOIN_WINDOW_MS = 15 * 60 * 1000;
const EMPTY_NOTE = { diagnosis: "", treatment: "", notes: "" };

const FILTERS = [
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const btnPrimary =
  "inline-flex items-center gap-2 rounded-[8px] bg-primaryColor px-4 py-2 text-[14px] font-semibold text-white transition-colors hover:bg-ink disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor transition-colors hover:border-primaryColor hover:text-primaryColor disabled:opacity-50";

const Appointments = ({ appointments: initialAppointments }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState(initialAppointments || []);
  const [filter, setFilter] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [toCancel, setToCancel] = useState(null);
  const [noteBooking, setNoteBooking] = useState(null);
  const [noteData, setNoteData] = useState(EMPTY_NOTE);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    setAppointments(initialAppointments || []);
  }, [initialAppointments]);

  const request = async (url, method, body) => {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  };

  const patchAppointment = (id, patch) =>
    setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, ...patch } : a)));

  const runAction = async (id, action) => {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const sendReminder = (appt) =>
    runAction(appt._id, async () => {
      await request(`${BASE_URL}/bookings/notify/${appt._id}`, "POST");
      toast.success("Reminder sent successfully");
    });

  const markCompleted = (appt) =>
    runAction(appt._id, async () => {
      await request(`${BASE_URL}/bookings/complete/${appt._id}`, "PATCH");
      patchAppointment(appt._id, { status: "completed" });
      toast.success("Appointment marked as completed");
    });

  const confirmCancel = () => {
    const appt = toCancel;
    runAction(appt._id, async () => {
      const data = await request(`${BASE_URL}/bookings/cancel/${appt._id}`, "DELETE");
      patchAppointment(appt._id, { status: "cancelled" });
      toast.success(data.message || "Appointment cancelled successfully");
      setToCancel(null);
    });
  };

  const openNote = async (appt) => {
    setNoteBooking(appt);
    setNoteData(EMPTY_NOTE);

    if (appt.noteId && appt.user?._id) {
      try {
        const data = await request(`${BASE_URL}/medical-notes/patient/${appt.user._id}`, "GET");
        const note = data.data.find((n) => n._id === appt.noteId);
        if (note) {
          setNoteData({
            diagnosis: note.diagnosis || "",
            treatment: note.treatment || "",
            notes: note.notes || "",
          });
        }
      } catch {
        toast.error("Error fetching existing note");
      }
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    const isEdit = Boolean(noteBooking.noteId);
    setSavingNote(true);
    try {
      const data = await request(
        isEdit
          ? `${BASE_URL}/medical-notes/${noteBooking.noteId}`
          : `${BASE_URL}/medical-notes`,
        isEdit ? "PUT" : "POST",
        { bookingId: noteBooking._id, ...noteData }
      );
      toast.success(data.message || "Note saved");
      patchAppointment(
        noteBooking._id,
        isEdit ? { note: data.data } : { noteId: data.data._id, note: data.data }
      );
      setNoteBooking(null);
      setNoteData(EMPTY_NOTE);
    } catch (err) {
      toast.error(err.message || "Failed to save medical note");
    } finally {
      setSavingNote(false);
    }
  };

  const counts = useMemo(
    () =>
      FILTERS.reduce(
        (acc, f) => ({ ...acc, [f.key]: appointments.filter((a) => a.status === f.key).length }),
        {}
      ),
    [appointments]
  );

  const visible = useMemo(() => {
    const time = (a) => new Date(a.appointmentDate).getTime() || 0;
    const list = appointments.filter((a) => a.status === filter);
    return list.sort((a, b) => (filter === "pending" ? time(a) - time(b) : time(b) - time(a)));
  }, [appointments, filter]);

  const lastUpdated = appointments
    .map((a) => new Date(a.updatedAt).getTime())
    .filter(Number.isFinite);

  return (
    <div>
      <PanelHeader
        title="Appointments"
        description="Your consultations, from upcoming to completed."
      />

      <div className="mb-6 flex gap-6 border-b border-line" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition-colors ${
              filter === f.key
                ? "border-coral text-headingColor"
                : "border-transparent text-textColor hover:text-primaryColor"
            }`}
          >
            {f.label}{" "}
            <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-[12px]">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={`No ${filter} appointments`}
          text={
            filter === "pending"
              ? "New bookings from patients will appear here."
              : "Nothing to show in this list."
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((appt) => {
            const date = new Date(appt.appointmentDate);
            const valid = !Number.isNaN(date.getTime());
            const timeReached = valid && Date.now() >= date.getTime() - JOIN_WINDOW_MS;
            const pastStart = valid && Date.now() >= date.getTime();
            const patient = appt.user;
            const busy = busyId === appt._id;

            return (
              <article
                key={appt._id}
                className="flex flex-col gap-5 rounded-[14px] border border-line bg-white p-5 lg:flex-row lg:items-center"
              >
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[10px] bg-mint text-primaryColor">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                    {valid ? date.toLocaleString("en-US", { month: "short" }) : "N/A"}
                  </span>
                  <span className="font-heading text-[26px] font-semibold leading-none">
                    {valid ? date.getDate() : "-"}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {patient?.photo ? (
                    <img
                      src={patient.photo}
                      alt={patient.name}
                      className="h-12 w-12 shrink-0 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-paper font-heading text-[18px] text-primaryColor">
                      {(patient?.name || "P").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[20px] font-semibold text-headingColor">
                      {patient?.name || "Unknown patient"}
                    </p>
                    <p className="text-[14px] text-textColor">
                      {fmtDate(appt.appointmentDate)}, {fmtTime(appt.appointmentDate)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <StatusBadge status={appt.status} />
                  <div className="flex flex-wrap items-center gap-2">
                    {patient?._id && (
                      <button
                        type="button"
                        className={btnSecondary}
                        onClick={() => navigate(`/doctors/medical-folder/${patient._id}`)}
                      >
                        <FolderOpen className="h-4 w-4" /> Medical folder
                      </button>
                    )}

                    {appt.status === "pending" && (
                      <>
                        {timeReached && (
                          <button
                            type="button"
                            className={btnPrimary}
                            onClick={() => navigate(`/consultation/${appt._id}`)}
                          >
                            <Video className="h-4 w-4" /> Join
                          </button>
                        )}
                        <button
                          type="button"
                          className={btnSecondary}
                          disabled={busy}
                          onClick={() => sendReminder(appt)}
                        >
                          <Bell className="h-4 w-4" /> Remind
                        </button>
                        {pastStart && (
                          <button
                            type="button"
                            className={btnSecondary}
                            disabled={busy}
                            onClick={() => markCompleted(appt)}
                          >
                            <Check className="h-4 w-4" /> Mark completed
                          </button>
                        )}
                        <button
                          type="button"
                          className="rounded-[8px] border border-red-200 bg-white px-4 py-2 text-[14px] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          disabled={busy}
                          onClick={() => setToCancel(appt)}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {appt.status === "completed" && (
                      <button type="button" className={btnPrimary} onClick={() => openNote(appt)}>
                        <FileText className="h-4 w-4" />
                        {appt.noteId ? "Edit medical note" : "Add medical note"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {lastUpdated.length > 0 && (
        <p className="mt-6 text-[12px] text-textColor">
          Last updated {fmtDate(Math.max(...lastUpdated))}
        </p>
      )}

      {toCancel && (
        <Modal
          title="Cancel this appointment?"
          onClose={() => busyId === null && setToCancel(null)}
          footer={
            <>
              <button
                type="button"
                className={btnSecondary}
                disabled={busyId !== null}
                onClick={() => setToCancel(null)}
              >
                Keep appointment
              </button>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={confirmCancel}
                className="rounded-[8px] bg-red-700 px-4 py-2 text-[14px] font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {busyId !== null ? "Cancelling..." : "Yes, cancel"}
              </button>
            </>
          }
        >
          <p className="text-[15px] leading-7 text-textColor">
            The appointment with{" "}
            <strong className="text-headingColor">{toCancel.user?.name || "this patient"}</strong>{" "}
            on {fmtDate(toCancel.appointmentDate)} at {fmtTime(toCancel.appointmentDate)} will be
            cancelled, and the patient will be refunded automatically.
          </p>
        </Modal>
      )}

      {noteBooking && (
        <Modal
          title={`${noteBooking.noteId ? "Edit" : "Add"} medical note for ${
            noteBooking.user?.name || "patient"
          }`}
          onClose={() => !savingNote && setNoteBooking(null)}
          footer={
            <>
              <button
                type="button"
                className={btnSecondary}
                disabled={savingNote}
                onClick={() => setNoteBooking(null)}
              >
                Cancel
              </button>
              <button type="submit" form="note-form" className={btnPrimary} disabled={savingNote}>
                {savingNote ? "Saving..." : "Save note"}
              </button>
            </>
          }
        >
          <form id="note-form" onSubmit={saveNote} className="space-y-4">
            <div>
              <label htmlFor="diagnosis" className={labelClass}>Diagnosis</label>
              <input
                id="diagnosis"
                type="text"
                value={noteData.diagnosis}
                onChange={(e) => setNoteData({ ...noteData, diagnosis: e.target.value })}
                placeholder="e.g. Flu"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="treatment" className={labelClass}>Treatment</label>
              <input
                id="treatment"
                type="text"
                value={noteData.treatment}
                onChange={(e) => setNoteData({ ...noteData, treatment: e.target.value })}
                placeholder="e.g. Rest, hydration"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="notes" className={labelClass}>Additional notes (optional)</label>
              <textarea
                id="notes"
                value={noteData.notes}
                onChange={(e) => setNoteData({ ...noteData, notes: e.target.value })}
                className={`${inputClass} h-32 resize-none`}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Appointments;