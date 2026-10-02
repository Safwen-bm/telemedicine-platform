import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loader from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import { PanelHeader, StatCard } from "../../components/ui/dashboard.jsx";

const AdminDashboard = () => {
  const { data, loading, error } = useFetchData(`${BASE_URL}/analytics/dashboard`);
  const { data: pending } = useFetchData(`${BASE_URL}/doctors/pending`);

  const stats = data && !Array.isArray(data) ? data : null;
  const pendingDoctors = Array.isArray(pending) ? pending : [];

  if (!stats && loading) return <Loader />;
  if (!stats) return <ErrorMsg errMessage={error || "Could not load the overview."} />;

  return (
    <div>
      <PanelHeader title="Overview" description="What needs your attention, and how the platform is doing." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Patients" value={stats.totalPatients} />
        <StatCard
          label="Doctors"
          value={stats.approvedDoctors}
          hint={`${stats.totalDoctors} registered, ${stats.pendingDoctors} pending`}
        />
        <StatCard
          label="Bookings"
          value={stats.totalBookings}
          hint={`${stats.bookingsByStatus.pending} pending, ${stats.bookingsByStatus.completed} completed`}
        />
        <StatCard label="Revenue" value={`$${stats.revenue}`} hint="Paid, excluding cancelled" />
      </div>

      <section className="mt-8 rounded-[14px] border border-line bg-white">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-heading text-[20px] font-semibold text-headingColor">
            Doctors awaiting review
          </h3>
          {pendingDoctors.length > 0 && (
            <Link
              to="/admin/doctors?status=pending"
              className="flex items-center gap-1 text-[14px] font-semibold text-primaryColor hover:underline"
            >
              Review all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </header>

        <div className="p-5">
          {pendingDoctors.length > 0 ? (
            <ul>
              {pendingDoctors.slice(0, 5).map((d) => (
                <li
                  key={d._id}
                  className="flex items-center justify-between gap-4 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {d.photo ? (
                      <img
                        src={d.photo}
                        alt={d.name}
                        className="h-10 w-10 shrink-0 rounded-full border border-line object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper font-heading text-primaryColor">
                        {(d.name || "D").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-headingColor">{d.name}</p>
                      <p className="truncate text-[13px] capitalize text-textColor">
                        {d.specialization || "Specialization not set"}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/doctors/${d._id}`}
                    className="shrink-0 text-[14px] font-semibold text-primaryColor hover:underline"
                  >
                    View profile
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-textColor">No doctors are waiting for review.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;