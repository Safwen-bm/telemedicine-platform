// frontend\src\Dashboard\doctor-account\PatientMedicalFolder.jsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Stethoscope,
  AlertCircle,
  Pill,
  FlaskConical,
} from "lucide-react";
import { toast } from "react-toastify";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import { useAuth } from "../../context/AuthContext.jsx";
import Loading from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import {
  StatusBadge,
  inputClass,
  labelClass,
  fmtDate,
  fmtTime,
} from "../../components/ui/dashboard.jsx";
import { NoteCard } from "../user-account/MedicalNotes";

const EMPTY_MED = { name: "", dosage: "", startDate: "", endDate: "" };
const EMPTY_LAB = { testName: "", result: "", date: "" };

const btnPrimary =
  "rounded-[8px] bg-primaryColor px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50";

const getAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

const Section = ({ icon: Icon, title, count, children }) => (
  <section className="rounded-[14px] border border-line bg-white">
    <header className="flex items-center justify-between border-b border-line px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-mint text-primaryColor">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-heading text-[20px] font-semibold text-headingColor">{title}</h3>
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

const Empty = ({ children }) => <p className="text-[15px] italic text-textColor">{children}</p>;

const Row = ({ children }) => (
  <li className="flex flex-wrap items-start justify-between gap-2 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
    {children}
  </li>
);

const AddForm = ({ onSubmit, children, busy, label }) => (
  <form onSubmit={onSubmit} className="mt-5 space-y-4 border-t border-line pt-5">
    {children}
    <button type="submit" className={btnPrimary} disabled={busy}>
      {busy ? "Saving..." : label}
    </button>
  </form>
);

const PatientMedicalFolder = () => {
  const { patientId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const { data: folder, loading, error, refetch } = useFetchData(
    `${BASE_URL}/medical-folder/${patientId}`
  );
  const hasData = Boolean(folder) && !Array.isArray(folder);

  const [allergy, setAllergy] = useState("");
  const [med, setMed] = useState(EMPTY_MED);
  const [lab, setLab] = useState(EMPTY_LAB);
  const [saving, setSaving] = useState(null);

  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/doctors/profile/me");

    const save = async (section, body, reset, successMessage) => {
    setSaving(section);
    try {
      const res = await fetch(`${BASE_URL}/medical-folder/${patientId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update medical folder");

      await refetch();
      reset();
      toast.success(data.message || successMessage);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(null);
    }
  };

  const addAllergy = (e) => {
    e.preventDefault();
    const value = allergy.trim();
    if (!value) return;
    if ((folder.allergies || []).some((a) => a.toLowerCase() === value.toLowerCase())) {
      return toast.error("This allergy is already listed");
    }
    save("allergies", { allergy: value }, () => setAllergy(""), "Allergy added");
  };

  const addMedication = (e) => {
    e.preventDefault();
    if (med.endDate && med.endDate < med.startDate) {
      return toast.error("The end date cannot be before the start date");
    }
    const payload = { ...med, name: med.name.trim(), dosage: med.dosage.trim() };
    if (!payload.endDate) delete payload.endDate;
    save("medications", { medication: payload }, () => setMed(EMPTY_MED), "Medication added");
  };

  const addLabResult = (e) => {
    e.preventDefault();
    if (new Date(lab.date) > new Date()) {
      return toast.error("The test date cannot be in the future");
    }
    save(
      "labResults",
      { labResult: { ...lab, testName: lab.testName.trim(), result: lab.result.trim() } },
      () => setLab(EMPTY_LAB),
      "Lab result added"
    );
  };

  if (loading && !hasData) {
    return (
      <section className="pb-20 pt-28">
        <div className="container">
          <Loading />
        </div>
      </section>
    );
  }

  if (!hasData) {
    return (
      <section className="pb-20 pt-28">
        <div className="container">
          <ErrorMsg errMessage={error || "Could not load this medical folder."} />
        </div>
      </section>
    );
  }

  const patient = folder.patient || {};
  const age = getAge(patient.dateOfBirth);
  const conditions = patient.conditions || [];
  const allergies = folder.allergies || [];
  const medications = folder.medications || [];
  const labResults = folder.labResults || [];
  const notes = folder.medicalNotes || [];
  const completed = (folder.appointments || []).filter((a) => a.status === "completed");

  const info = [
    ["Date of birth", patient.dateOfBirth ? `${fmtDate(patient.dateOfBirth)}${age !== null ? ` (${age} years)` : ""}` : null],
    ["Gender", patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null],
    ["Blood type", patient.bloodType],
    ["Email", patient.email],
  ];

  return (
    <section className="pb-20 pt-28">
      <div className="container">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-textColor transition-colors hover:text-primaryColor"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
          Patient medical folder
        </p>
        <h1 className="mt-2 font-heading text-[36px] font-semibold leading-tight sm:text-[44px]">
          {patient.name || "Unknown patient"}
        </h1>

        {/* patient summary */}
        <div className="mt-8 flex flex-col gap-6 rounded-[14px] border border-line bg-white p-6 md:flex-row md:items-start">
          {patient.photo ? (
            <img
              src={patient.photo}
              alt={patient.name || "Patient"}
              className="h-20 w-20 shrink-0 rounded-full border border-line object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primaryColor font-heading text-[30px] text-white">
              {(patient.name || "P").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex-1">
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {info.map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor">
                    {label}
                  </dt>
                  <dd className="mt-0.5 truncate text-[15px] font-semibold text-headingColor">
                    {value || "Not set"}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor">
                Medical conditions
              </p>
              {conditions.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {conditions.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-line bg-paper px-3 py-1 text-[13px] text-headingColor"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[15px] text-textColor">None reported</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
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
              <AddForm onSubmit={addAllergy} busy={saving === "allergies"} label="Add allergy">
                <div>
                  <label htmlFor="allergy" className={labelClass}>New allergy</label>
                  <input
                    id="allergy"
                    type="text"
                    value={allergy}
                    onChange={(e) => setAllergy(e.target.value)}
                    placeholder="e.g. Peanuts"
                    className={inputClass}
                    required
                  />
                </div>
              </AddForm>
            </Section>

            <Section icon={FlaskConical} title="Lab results" count={labResults.length}>
              {labResults.length > 0 ? (
                <ul>
                  {labResults.map((r, i) => (
                    <Row key={r._id || i}>
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
              <AddForm onSubmit={addLabResult} busy={saving === "labResults"} label="Add lab result">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="testName" className={labelClass}>Test name</label>
                    <input
                      id="testName"
                      type="text"
                      value={lab.testName}
                      onChange={(e) => setLab({ ...lab, testName: e.target.value })}
                      placeholder="e.g. Blood test"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="labResult" className={labelClass}>Result</label>
                    <input
                      id="labResult"
                      type="text"
                      value={lab.result}
                      onChange={(e) => setLab({ ...lab, result: e.target.value })}
                      placeholder="e.g. Normal"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="labDate" className={labelClass}>Date</label>
                    <input
                      id="labDate"
                      type="date"
                      value={lab.date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setLab({ ...lab, date: e.target.value })}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </AddForm>
            </Section>
          </div>

          <Section icon={Pill} title="Medications" count={medications.length}>
            {medications.length > 0 ? (
              <ul>
                {medications.map((m, i) => (
                  <Row key={m._id || i}>
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
            <AddForm onSubmit={addMedication} busy={saving === "medications"} label="Add medication">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="medName" className={labelClass}>Medication</label>
                  <input
                    id="medName"
                    type="text"
                    value={med.name}
                    onChange={(e) => setMed({ ...med, name: e.target.value })}
                    placeholder="e.g. Ibuprofen"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="medDosage" className={labelClass}>Dosage</label>
                  <input
                    id="medDosage"
                    type="text"
                    value={med.dosage}
                    onChange={(e) => setMed({ ...med, dosage: e.target.value })}
                    placeholder="e.g. 200 mg daily"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="medStart" className={labelClass}>Start date</label>
                  <input
                    id="medStart"
                    type="date"
                    value={med.startDate}
                    onChange={(e) => setMed({ ...med, startDate: e.target.value })}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="medEnd" className={labelClass}>End date (optional)</label>
                  <input
                    id="medEnd"
                    type="date"
                    value={med.endDate}
                    min={med.startDate || undefined}
                    onChange={(e) => setMed({ ...med, endDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </AddForm>
          </Section>

          <div className="grid gap-6 lg:grid-cols-2">
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

            <Section icon={Stethoscope} title="Doctor's notes" count={notes.length}>
              {notes.length > 0 ? (
                <div className="space-y-4">
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
      </div>
    </section>
  );
};

export default PatientMedicalFolder;