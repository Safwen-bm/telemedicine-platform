// Telemedecine\frontend\src\Dashboard\user-account\MedicalFolder.jsx
import {
  CalendarDays,
  Stethoscope,
  AlertCircle,
  Pill,
  FlaskConical,
} from "lucide-react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext.jsx";
import Loading from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import {
  PanelHeader,
  StatusBadge,
  fmtDate,
  fmtTime,
} from "../../components/ui/dashboard.jsx";
import { NoteCard } from "./MedicalNotes";

const Section = ({ icon: Icon, title, count, children }) => (
  <section className="rounded-[14px] border border-line bg-white">
    <header className="flex items-center justify-between border-b border-line px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-mint text-primaryColor">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-heading text-[20px] font-semibold text-headingColor">
          {title}
        </h3>
      </div>
      {typeof count === "number" && (
        <span className="rounded-full bg-paper px-2.5 py-0.5 text-[13px] font-semibold text-textColor">
          {count}
        </span>
      )}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const Empty = ({ children }) => (
  <p className="text-[15px] italic text-textColor">{children}</p>
);

const Row = ({ children }) => (
  <li className="flex flex-wrap items-start justify-between gap-2 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
    {children}
  </li>
);

const MedicalFolder = () => {
  const { user, token } = useAuth();
  const { data: folder, loading, error } = useFetchData(
    `${BASE_URL}/medical-folder/${user?._id}`,
    token
  );

  if (loading) return <Loading />;
  if (error) return <ErrorMsg errMessage={error} />;

  const completed = (folder?.appointments || []).filter(
    (a) => a.status === "completed"
  );
  const notes = folder?.medicalNotes || [];
  const allergies = folder?.allergies || [];
  const medications = folder?.medications || [];
  const labResults = folder?.labResults || [];

  return (
    <div>
      <PanelHeader
        title="Medical folder"
        description={
          folder?.updatedAt
            ? `Last updated ${fmtDate(folder.updatedAt)}`
            : "Everything your doctors have recorded about you, in one place."
        }
      />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Section icon={AlertCircle} title="Allergies" count={allergies.length}>
            {allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allergies.map((a, i) => (
                  <span
                    key={`${a}-${i}`}
                    className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[14px] font-medium text-red-800"
                  >
                    {a}
                  </span>
                ))}
              </div>
            ) : (
              <Empty>No allergies recorded.</Empty>
            )}
          </Section>

          <Section icon={Pill} title="Medications" count={medications.length}>
            {medications.length > 0 ? (
              <ul>
                {medications.map((m, i) => (
                  <Row key={m._id || `${m.name}-${i}`}>
                    <div>
                      <p className="text-[15px] font-semibold text-headingColor">{m.name}</p>
                      <p className="text-[14px] text-textColor">{m.dosage || "Dosage not set"}</p>
                    </div>
                    <p className="text-[13px] text-textColor">
                      {fmtDate(m.startDate)} to {m.endDate ? fmtDate(m.endDate) : "ongoing"}
                    </p>
                  </Row>
                ))}
              </ul>
            ) : (
              <Empty>No medications recorded.</Empty>
            )}
          </Section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section icon={FlaskConical} title="Lab results" count={labResults.length}>
            {labResults.length > 0 ? (
              <ul>
                {labResults.map((r, i) => (
                  <Row key={r._id || `${r.testName}-${i}`}>
                    <div>
                      <p className="text-[15px] font-semibold text-headingColor">{r.testName}</p>
                      <p className="text-[14px] text-textColor">{r.result}</p>
                    </div>
                    <p className="text-[13px] text-textColor">{fmtDate(r.date)}</p>
                  </Row>
                ))}
              </ul>
            ) : (
              <Empty>No lab results recorded.</Empty>
            )}
          </Section>

          <Section icon={CalendarDays} title="Past consultations" count={completed.length}>
            {completed.length > 0 ? (
              <ul>
                {completed.map((a) => (
                  <Row key={a._id}>
                    <div>
                      <p className="text-[15px] font-semibold text-headingColor">
                        Dr. {a.doctor?.name || "Unknown"}
                      </p>
                      <p className="text-[14px] text-textColor">
                        {a.doctor?.specialization || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] text-textColor">
                        {fmtDate(a.appointmentDate)}, {fmtTime(a.appointmentDate)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={a.status} />
                      </div>
                    </div>
                  </Row>
                ))}
              </ul>
            ) : (
              <Empty>No completed consultations yet.</Empty>
            )}
          </Section>
        </div>

        <Section icon={Stethoscope} title="Doctor's notes" count={notes.length}>
          {notes.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {notes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}
            </div>
          ) : (
            <Empty>No medical notes recorded.</Empty>
          )}
        </Section>
      </div>
    </div>
  );
};

export default MedicalFolder;