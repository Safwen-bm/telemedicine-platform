// frontend\src\Dashboard\doctor-account\Dashboard.jsx
import { useContext, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Star, ExternalLink, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import Loader from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import useGetProfile from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import { authContext } from "../../context/AuthContext";
import { fmtDate, fmtTime } from "../../components/ui/dashboard.jsx";
import DoctorAbout from "./../../pages/Doctors/DoctorAbout";
import Tabs from "./Tabs";
import Profile from "./Profile";
import Appointments from "./Appointments";
import DeleteAccount from "./DeleteAccount";

const TAB_KEYS = ["overview", "appointments", "settings"];

const APPROVAL = {
  approved: { label: "Approved", cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  pending: { label: "Pending review", cls: "border-amber-200 bg-amber-50 text-amber-800" },
  cancelled: { label: "Not approved", cls: "border-red-200 bg-red-50 text-red-700" },
};

const StatCard = ({ label, value, hint }) => (
  <div className="rounded-[14px] border border-line bg-white p-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor">{label}</p>
    <p className="mt-2 font-heading text-[34px] font-semibold leading-none text-headingColor">
      {value}
    </p>
    {hint && <p className="mt-2 text-[13px] text-textColor">{hint}</p>}
  </div>
);

const Card = ({ title, action, children }) => (
  <section className="rounded-[14px] border border-line bg-white">
    <header className="flex items-center justify-between border-b border-line px-5 py-4">
      <h3 className="font-heading text-[20px] font-semibold text-headingColor">{title}</h3>
      {action}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const linkBtn =
  "text-[14px] font-semibold text-primaryColor hover:underline";

const Overview = ({ data, stats, checklist, setTab }) => {
  const done = checklist.filter((c) => c.done).length;
  const missing = checklist.filter((c) => !c.done);
  const rating = Number(data.averageRating) || 0;
  const reviewCount = Number(data.totalRating) || 0;
  const next = stats.pending.slice(0, 3);

  return (
    <div className="space-y-8">
      {data.isApproved === "pending" && (
        <div className="flex items-start gap-3 rounded-[14px] border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-[15px] leading-7">
            To get approval, please complete your profile. We'll review and approve within 3
            days. Patients cannot see or book you until then.
          </p>
        </div>
      )}
      {data.isApproved === "cancelled" && (
        <div className="flex items-start gap-3 rounded-[14px] border border-red-200 bg-red-50 p-5 text-red-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-[15px] leading-7">
            Your profile was not approved. Please review your information, or{" "}
            <Link to="/contact" className="font-semibold underline">
              contact us
            </Link>
            .
          </p>
        </div>
      )}

      {stats.overdue > 0 && (
        <button
          type="button"
          onClick={() => setTab("appointments")}
          className="flex w-full items-start gap-3 rounded-[14px] border border-coral/40 bg-white p-5 text-left transition-colors hover:bg-paper"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-coral" />
          <p className="text-[15px] leading-7 text-headingColor">
            <strong>
              {stats.overdue} appointment{stats.overdue > 1 ? "s are" : " is"} past{" "}
              {stats.overdue > 1 ? "their" : "its"} time
            </strong>{" "}
            and still pending. Mark {stats.overdue > 1 ? "them" : "it"} as completed to add your
            medical notes.
          </p>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={stats.pending.length} hint="Upcoming appointments" />
        <StatCard label="Completed" value={stats.completed} hint="Consultations done" />
        <StatCard
          label="Rating"
          value={reviewCount > 0 ? rating.toFixed(1) : "None"}
          hint={`${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`}
        />
        <StatCard
          label="Fee"
          value={Number(data.ticketPrice) > 0 ? data.ticketPrice : "Not set"}
          hint={Number(data.ticketPrice) > 0 ? "USD per consultation" : "Set it in your profile"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Next appointments"
          action={
            stats.pending.length > 0 && (
              <button type="button" className={linkBtn} onClick={() => setTab("appointments")}>
                View all
              </button>
            )
          }
        >
          {next.length > 0 ? (
            <ul>
              {next.map((a) => (
                <li
                  key={a._id}
                  className="flex items-center justify-between gap-4 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-headingColor">
                      {a.user?.name || "Unknown patient"}
                    </p>
                    <p className="text-[13px] text-textColor">
                      {fmtDate(a.appointmentDate)}, {fmtTime(a.appointmentDate)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-textColor">No upcoming appointments.</p>
          )}
        </Card>

        <Card
          title="Profile completeness"
          action={
            <span className="text-[13px] font-semibold text-textColor">
              {done} of {checklist.length}
            </span>
          }
        >
          <div className="h-2 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-primaryColor transition-all"
              style={{ width: `${(done / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="mt-4 space-y-2">
            {checklist.map((c) => (
              <li key={c.key} className="flex items-center gap-2 text-[14px]">
                {c.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Circle className="h-4 w-4 text-line" />
                )}
                <span className={c.done ? "text-textColor" : "font-semibold text-headingColor"}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <button type="button" className={`${linkBtn} mt-4`} onClick={() => setTab("settings")}>
              Complete your profile
            </button>
          )}
        </Card>
      </div>

      <Card
        title="Your public profile"
        action={
          <Link to={`/doctors/${data._id}`} className={`${linkBtn} inline-flex items-center gap-1`}>
            View as a patient <ExternalLink className="h-4 w-4" />
          </Link>
        }
      >
        <DoctorAbout
          name={data.name}
          about={data.about}
          qualifications={data.qualifications}
          experiences={data.experiences}
        />
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const { user: authUser, token, role, dispatch } = useContext(authContext);
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab = TAB_KEYS.includes(requested) ? requested : "overview";
  const setTab = (key) => setParams({ tab: key }, { replace: true });

  const { data, error, loading, refetch } = useGetProfile(`${BASE_URL}/doctors/profile/me`);
  const ready = Boolean(data?._id);

  const appointments = Array.isArray(data?.appointments) ? data.appointments : [];

  const stats = useMemo(() => {
    const time = (a) => new Date(a.appointmentDate).getTime() || 0;
    const pending = appointments
      .filter((a) => a.status === "pending")
      .sort((a, b) => time(a) - time(b));
    return {
      pending,
      completed: appointments.filter((a) => a.status === "completed").length,
      // started more than an hour ago and still not completed or cancelled
      overdue: pending.filter((a) => time(a) < Date.now() - 60 * 60 * 1000).length,
    };
  }, [appointments]);

  const handleSaved = (patch) => {
    // keep the header avatar and name in sync, then reload the profile
    if (dispatch && authUser) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: { ...authUser, ...patch }, token, role },
      });
    }
    refetch();
  };

  if (loading && !ready) {
    return (
      <section className="pb-20 pt-28">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="pb-20 pt-28">
        <div className="container">
          <ErrorMsg errMessage={error || "Could not load your dashboard."} />
        </div>
      </section>
    );
  }

  const checklist = [
    { key: "photo", label: "Profile photo", done: Boolean(data.photo) },
    { key: "specialization", label: "Specialization", done: Boolean(data.specialization) },
    { key: "fee", label: "Consultation fee", done: Number(data.ticketPrice) > 0 },
    { key: "bio", label: "Short bio", done: Boolean(data.bio?.trim()) },
    { key: "about", label: "About section", done: Boolean(data.about?.trim()) },
    { key: "qualifications", label: "At least one qualification", done: data.qualifications?.length > 0 },
    { key: "experiences", label: "At least one experience", done: data.experiences?.length > 0 },
  ];

  const approval = APPROVAL[data.isApproved] || APPROVAL.pending;
  const rating = Number(data.averageRating) || 0;
  const reviewCount = Number(data.totalRating) || 0;

  return (
    <section className="pb-20 pt-28">
      <div className="container">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
          Doctor dashboard
        </p>
        <h1 className="mt-2 font-heading text-[36px] font-semibold leading-tight sm:text-[44px]">
          Welcome back, {data.name}
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-[14px] border border-line bg-white p-6 text-center">
                {data.photo ? (
                  <img
                    src={data.photo}
                    alt={data.name}
                    className="mx-auto h-24 w-24 rounded-full border border-line object-cover"
                  />
                ) : (
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primaryColor font-heading text-[36px] text-white">
                    {(data.name || "D").charAt(0).toUpperCase()}
                  </span>
                )}
                <p className="mt-4 font-heading text-[22px] font-semibold text-headingColor">
                  {data.name}
                </p>
                <p className="text-[14px] capitalize text-textColor">
                  {data.specialization || "Specialization not set"}
                </p>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-[14px] text-headingColor">
                  <Star className="h-4 w-4 fill-yellowColor text-yellowColor" />
                  <span className="font-semibold">{reviewCount > 0 ? rating.toFixed(1) : "No ratings"}</span>
                  {reviewCount > 0 && <span className="text-textColor">({reviewCount})</span>}
                </p>
                <span
                  className={`mt-4 inline-flex items-center rounded-[6px] border px-2.5 py-1 text-[12px] font-semibold ${approval.cls}`}
                >
                  {approval.label}
                </span>
              </div>

              <Tabs tab={tab} setTab={setTab} pendingCount={stats.pending.length} />
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            {tab === "overview" && (
              <Overview data={data} stats={stats} checklist={checklist} setTab={setTab} />
            )}
            {tab === "appointments" && <Appointments appointments={data.appointments} />}
            {tab === "settings" && (
              <>
                <Profile doctorData={data} onSaved={handleSaved} />
                <DeleteAccount doctor={data} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;