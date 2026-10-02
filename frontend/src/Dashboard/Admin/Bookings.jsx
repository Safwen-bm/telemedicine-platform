import { useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
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
  fmtDate,
  fmtTime,
} from "../../components/ui/dashboard.jsx";

const Bookings = () => {
  const { token } = useAuth();
  const { data, loading, error, refetch } = useFetchData(`${BASE_URL}/bookings`);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const total = Array.isArray(data) ? data.length : 0;

  const bookings = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    const q = search.trim().toLowerCase();
    const time = (b) => new Date(b.appointmentDate).getTime() || 0;
    return list
      .filter((b) => status === "all" || b.status === status)
      .filter(
        (b) =>
          !q ||
          b.user?.name?.toLowerCase().includes(q) ||
          b.doctor?.name?.toLowerCase().includes(q)
      )
      .sort((a, b) => time(b) - time(a));
  }, [data, search, status]);

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings/cancel/${toCancel._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Failed to cancel booking");

      toast.success(result.message || "Booking cancelled");
      setToCancel(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div>
      <PanelHeader
        title="Bookings"
        description={total ? `${total} ${total === 1 ? "booking" : "bookings"} in total` : undefined}
      />

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative md:w-1/2">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textColor" />
          <input
            type="search"
            placeholder="Search by patient or doctor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} pl-12`}
            aria-label="Search bookings"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`${inputClass} md:w-56`}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading && total === 0 && <Loader />}
      {error && total === 0 && <ErrorMsg errMessage={error} />}

      {!(loading && total === 0) && !(error && total === 0) && (
        bookings.length > 0 ? (
          <ul className="space-y-3">
            {bookings.map((b) => {
              const date = new Date(b.appointmentDate);
              const valid = !Number.isNaN(date.getTime());
              const cancellable = ["pending", "approved"].includes(b.status);
              return (
                <li
                  key={b._id}
                  className="flex flex-col gap-4 rounded-[14px] border border-line bg-white p-4 md:flex-row md:items-center"
                >
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[10px] bg-mint text-primaryColor">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                      {valid ? date.toLocaleString("en-US", { month: "short" }) : "N/A"}
                    </span>
                    <span className="font-heading text-[26px] font-semibold leading-none">
                      {valid ? date.getDate() : "-"}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-[18px] font-semibold text-headingColor">
                      {b.user?.name || "Deleted patient"}
                    </p>
                    <p className="truncate text-[14px] text-textColor">
                      with Dr. {b.doctor?.name || "Unknown"}
                      {b.doctor?.specialization && (
                        <span className="capitalize">, {b.doctor.specialization}</span>
                      )}
                    </p>
                    <p className="text-[13px] text-textColor">
                      {fmtDate(b.appointmentDate)}, {fmtTime(b.appointmentDate)}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <StatusBadge status={b.status} />
                    <p className="text-[13px] text-textColor">
                      ${b.ticketPrice} {b.isPaid ? "paid" : "unpaid"}
                    </p>
                    {cancellable && (
                      <button
                        type="button"
                        onClick={() => setToCancel(b)}
                        className="rounded-[8px] border border-red-200 bg-white px-4 py-2 text-[14px] font-semibold text-red-700 transition-colors hover:bg-red-50"
                      >
                        Cancel booking
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No bookings found"
            text={search || status !== "all" ? "Try another search or filter." : "Bookings appear here once patients pay."}
          />
        )
      )}

      {toCancel && (
        <Modal
          title="Cancel this booking?"
          onClose={() => !cancelling && setToCancel(null)}
          footer={
            <>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setToCancel(null)}
                className="rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor hover:border-primaryColor"
              >
                Keep booking
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={confirmCancel}
                className="rounded-[8px] bg-red-700 px-4 py-2 text-[14px] font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Yes, cancel"}
              </button>
            </>
          }
        >
          <p className="text-[15px] leading-7 text-textColor">
            The appointment of{" "}
            <strong className="text-headingColor">{toCancel.user?.name || "this patient"}</strong>{" "}
            with Dr. {toCancel.doctor?.name || "Unknown"} on {fmtDate(toCancel.appointmentDate)} at{" "}
            {fmtTime(toCancel.appointmentDate)} will be cancelled, and the patient refunded
            automatically.
          </p>
        </Modal>
      )}
    </div>
  );
};

export default Bookings;