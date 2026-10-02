import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loader from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import { PanelHeader, StatCard } from "../../components/ui/dashboard.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PRIMARY = "#8F3D4F";
const GRID = "#DED5D1";

const STATUS_ROWS = [
  { key: "pending", label: "Pending", bar: "bg-amber-400" },
  { key: "approved", label: "Approved", bar: "bg-emerald-500" },
  { key: "completed", label: "Completed", bar: "bg-primaryColor" },
  { key: "cancelled", label: "Cancelled", bar: "bg-red-400" },
];

const monthLabel = (key) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "2-digit" });

const AdminAnalytics = () => {
  const { data, loading, error } = useFetchData(`${BASE_URL}/analytics/dashboard`);
  const { data: trends, error: trendsError } = useFetchData(`${BASE_URL}/analytics/booking-trends`);

  const stats = data && !Array.isArray(data) ? data : null;
  const hasTrends = trends && Array.isArray(trends.labels) && trends.labels.length > 0;
  const totalInTrend = hasTrends ? trends.data.reduce((a, b) => a + b, 0) : 0;

  if (!stats && loading) return <Loader />;
  if (!stats) return <ErrorMsg errMessage={error || "Could not load analytics."} />;

  const chartData = {
    labels: hasTrends ? trends.labels.map(monthLabel) : [],
    datasets: [
      {
        label: "Bookings",
        data: hasTrends ? trends.data : [],
        borderColor: PRIMARY,
        backgroundColor: "rgba(143, 61, 79, 0.12)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: PRIMARY,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: GRID } },
    },
  };

  return (
    <div>
      <PanelHeader title="Analytics" description="Activity on the platform over the last 12 months." />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Doctors" value={stats.totalDoctors} hint={`${stats.approvedDoctors} approved`} />
        <StatCard label="Patients" value={stats.totalPatients} />
        <StatCard label="Bookings" value={stats.totalBookings} />
        <StatCard label="Revenue" value={`$${stats.revenue}`} hint="Paid, excluding cancelled" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <section className="rounded-[14px] border border-line bg-white p-5 xl:col-span-2">
          <h3 className="font-heading text-[20px] font-semibold text-headingColor">
            Appointments per month
          </h3>
          <p className="mt-1 text-[13px] text-textColor">By appointment date, cancelled ones excluded.</p>
          {trendsError ? (
            <p className="mt-6 text-textColor">{trendsError}</p>
          ) : totalInTrend > 0 ? (
            <div className="mt-6 h-[340px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="mt-6 italic text-textColor">No appointments in this period yet.</p>
          )}
        </section>

        <section className="rounded-[14px] border border-line bg-white p-5">
          <h3 className="font-heading text-[20px] font-semibold text-headingColor">Bookings by status</h3>
          <ul className="mt-5 space-y-4">
            {STATUS_ROWS.map(({ key, label, bar }) => {
              const count = stats.bookingsByStatus[key] || 0;
              const pct = stats.totalBookings ? (count / stats.totalBookings) * 100 : 0;
              return (
                <li key={key}>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="font-semibold text-headingColor">{label}</span>
                    <span className="text-textColor">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper">
                    <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AdminAnalytics;