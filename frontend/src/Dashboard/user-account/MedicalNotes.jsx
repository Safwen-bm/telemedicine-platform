import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import { useAuth } from "../../context/AuthContext.jsx";
import { fmtDate } from "../../components/ui/dashboard.jsx";

export const NoteCard = ({ note }) => {
  const fields = [
    ["Diagnosis", note.diagnosis],
    ["Treatment", note.treatment],
    ["Prescription", note.prescription],
    ["Notes", note.notes],
  ].filter(([, value]) => value);

  return (
    <article className="rounded-[10px] border border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading text-[18px] font-semibold text-headingColor">
            Dr. {note.doctor?.name || "Unknown"}
          </p>
          {note.doctor?.specialization && (
            <p className="text-[13px] text-textColor">{note.doctor.specialization}</p>
          )}
        </div>
        <span className="text-[13px] text-textColor">{fmtDate(note.createdAt)}</span>
      </div>

      {fields.length > 0 ? (
        <dl className="mt-4 space-y-3">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor">
                {label}
              </dt>
              <dd className="mt-0.5 whitespace-pre-line text-[15px] leading-6 text-headingColor">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-[14px] italic text-textColor">No details recorded.</p>
      )}
    </article>
  );
};

const MedicalNotes = ({ bookingId }) => {
  const { user, token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/medical-notes/patient/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Could not load notes");
        if (!cancelled) setNotes(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?._id, token]);

  if (loading) return <Loading />;
  if (error) return <ErrorMsg errMessage={error} />;

  const visible = (
    bookingId
      ? notes.filter((n) => (n.booking?._id || n.booking) === bookingId)
      : notes
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (visible.length === 0) {
    return (
      <p className="py-6 text-center text-[15px] text-textColor">
        {bookingId
          ? "Your doctor has not added notes for this appointment yet."
          : "No medical notes available."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map((note) => (
        <NoteCard key={note._id} note={note} />
      ))}
    </div>
  );
};

export default MedicalNotes;