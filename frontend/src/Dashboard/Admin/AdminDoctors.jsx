import { useMemo, useState } from "react";
import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { Search, Stethoscope } from "lucide-react";
import { toast } from "react-toastify";
import useFetchData from "../../hooks/useFetchData";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../config";
import Loader from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import {
  PanelHeader,
  EmptyState,
  StatusBadge,
  Modal,
  inputClass,
} from "../../components/ui/dashboard.jsx";

const SPECIALIZATIONS = [
  "surgery",
  "cardiology",
  "dermatology",
  "endocrinology",
  "gastroenterology",
  "neurology",
  "oncology",
  "orthopedics",
  "pediatrics",
  "psychiatry",
  "radiology",
];

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "cancelled", label: "Rejected" },
];

const STATUS_LABEL = { pending: "Pending", approved: "Approved", cancelled: "Rejected" };

const smallBtn =
  "rounded-[8px] px-4 py-2 text-[14px] font-semibold transition-colors disabled:opacity-50";

const AdminDoctors = () => {
  const { token } = useAuth();
  const { refreshPending } = useOutletContext() || {};
  const [params, setParams] = useSearchParams();
  const status = TABS.some((t) => t.key === params.get("status")) ? params.get("status") : "all";

  const { data, loading, error, refetch } = useFetchData(`${BASE_URL}/doctors/admin/doctors`);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [busyId, setBusyId] = useState(null);
  const [confirm, setConfirm] = useState(null); // { doctor, status }

  const all = Array.isArray(data) ? data : [];
  const total = all.length;

  const counts = useMemo(
    () => ({
      all: all.length,
      pending: all.filter((d) => d.isApproved === "pending").length,
      approved: all.filter((d) => d.isApproved === "approved").length,
      cancelled: all.filter((d) => d.isApproved === "cancelled").length,
    }),
    [all]
  );

  const doctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all
      .filter((d) => status === "all" || d.isApproved === status)
      .filter((d) => specialization === "all" || d.specialization === specialization)
      .filter(
        (d) => !q || d.name?.toLowerCase().includes(q) || d.email?.toLowerCase().includes(q)
      )
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [all, status, specialization, search]);

  const setApproval = async (doctor, newStatus) => {
    setBusyId(doctor._id);
    try {
      const res = await fetch(`${BASE_URL}/doctors/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doctorId: doctor._id, status: newStatus }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Failed to update approval");

      toast.success(result.message || "Doctor updated");
      setConfirm(null);
      await refetch();
      refreshPending?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const ask = (doctor, newStatus) => setConfirm({ doctor, status: newStatus });

  return (
    <div>
      <PanelHeader title="Doctors" description="Review profiles and decide who patients can book." />

      <div className="mb-6 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={status === t.key}
            onClick={() => setParams(t.key === "all" ? {} : { status: t.key }, { replace: true })}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-[15px] font-semibold transition-colors ${
              status === t.key
                ? "border-coral text-headingColor"
                : "border-transparent text-textColor hover:text-primaryColor"
            }`}
          >
            {t.label}{" "}
            <span className="ml-1 rounded-full bg-paper px-2 py-0.5 text-[12px]">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative md:w-1/2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textColor" />
          <input
            type="search"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-12`}
            aria-label="Search doctors"
          />
        </div>
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className={`${inputClass} capitalize md:w-64`}
          aria-label="Filter by specialization"
        >
          <option value="all">All specializations</option>
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading && total === 0 && <Loader />}
      {error && total === 0 && <ErrorMsg errMessage={error} />}

      {!(loading && total === 0) && !(error && total === 0) && (
        doctors.length > 0 ? (
          <ul className="space-y-3">
            {doctors.map((d) => {
              const busy = busyId === d._id;
              const incomplete = !d.specialization || !(Number(d.ticketPrice) > 0);
              return (
                <li
                  key={d._id}
                  className="flex flex-col gap-4 rounded-[14px] border border-line bg-white p-4 lg:flex-row lg:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {d.photo ? (
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-14 w-14 shrink-0 rounded-full border border-line object-cover"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-paper font-heading text-[20px] text-primaryColor">
                        {(d.name || "D").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-heading text-[19px] font-semibold text-headingColor">
                        {d.name || "Unnamed doctor"}
                      </p>
                      <p className="truncate text-[14px] capitalize text-textColor">
                        {d.specialization || "Specialization not set"}
                      </p>
                      <p className="truncate text-[13px] text-textColor">
                        {d.email}
                        {Number(d.ticketPrice) > 0 && ` / $${d.ticketPrice}`}
                        {Number(d.totalRating) > 0 && ` / ${Number(d.averageRating).toFixed(1)} stars`}
                      </p>
                      {incomplete && (
                        <p className="mt-1 text-[12px] font-semibold text-coral">
                          Incomplete profile: specialization or fee missing
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <StatusBadge status={d.isApproved} label={STATUS_LABEL[d.isApproved]} />
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/doctors/${d._id}`}
                        className={`${smallBtn} border border-line bg-white text-headingColor hover:border-primaryColor hover:text-primaryColor`}
                      >
                        View profile
                      </Link>

                      {(d.isApproved === "pending" || d.isApproved === "cancelled") && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setApproval(d, "approved")}
                          className={`${smallBtn} bg-primaryColor text-white hover:bg-ink`}
                        >
                          Approve
                        </button>
                      )}
                      {d.isApproved === "pending" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => ask(d, "cancelled")}
                          className={`${smallBtn} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
                        >
                          Reject
                        </button>
                      )}
                      {d.isApproved === "approved" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => ask(d, "cancelled")}
                          className={`${smallBtn} border border-red-200 bg-white text-red-700 hover:bg-red-50`}
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Stethoscope}
            title="No doctors found"
            text={
              search || specialization !== "all" || status !== "all"
                ? "Try another search or filter."
                : "Doctors appear here after they sign up."
            }
          />
        )
      )}

      {confirm && (
        <Modal
          title={confirm.doctor.isApproved === "approved" ? "Suspend this doctor?" : "Reject this doctor?"}
          onClose={() => busyId === null && setConfirm(null)}
          footer={
            <>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => setConfirm(null)}
                className={`${smallBtn} border border-line bg-white text-headingColor hover:border-primaryColor`}
              >
                Go back
              </button>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => setApproval(confirm.doctor, confirm.status)}
                className={`${smallBtn} bg-red-700 text-white hover:bg-red-800`}
              >
                {busyId !== null
                  ? "Saving..."
                  : confirm.doctor.isApproved === "approved"
                  ? "Yes, suspend"
                  : "Yes, reject"}
              </button>
            </>
          }
        >
          <p className="text-[15px] leading-7 text-textColor">
            <strong className="text-headingColor">{confirm.doctor.name}</strong> will no longer be
            visible to patients or bookable.
            {confirm.doctor.isApproved === "approved" &&
              " Appointments that are already booked are not cancelled automatically."}{" "}
            You can approve this doctor again later.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default AdminDoctors;