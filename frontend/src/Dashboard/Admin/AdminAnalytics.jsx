import { useContext, useEffect, useState } from "react";
import { authContext } from "../../context/AuthContext";
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminAnalytics = () => {
  const { token } = useContext(authContext);
  const [analytics, setAnalytics] = useState({ totalDoctors: 0, totalPatients: 0, totalBookings: 0 });
  const [bookingTrends, setBookingTrends] = useState({ labels: [], data: [] });
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/analytics/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch analytics");
      if (data.success) setAnalytics(data.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchBookingTrends = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/v1/analytics/booking-trends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch booking trends");
      if (data.success) {
        // Filter out null labels and corresponding data
        const filteredTrends = {
          labels: data.data.labels.filter(label => label !== null),
          data: data.data.data.filter((_, index) => data.data.labels[index] !== null),
        };
        setBookingTrends(filteredTrends);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchBookingTrends();
  }, []);

  // Chart.js data configuration
  const chartData = {
    labels: bookingTrends.labels,
    datasets: [
      {
        label: "Bookings",
        data: bookingTrends.data,
        borderColor: "#4B5EFC",
        backgroundColor: "rgba(75, 94, 252, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Month" } },
      y: { title: { display: true, text: "Number of Bookings" }, beginAtZero: true },
    },
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 border-indigo-200 pb-3">
        Admin Analytics Dashboard
      </h2>
      {error && <p className="text-red-600 mb-4 text-lg">Error: {error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-900">Total Doctors</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{analytics.totalDoctors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-900">Total Patients</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{analytics.totalPatients}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-900">Total Bookings</h3>
          <p className="text-3xl font-bold text-indigo-700 mt-2">{analytics.totalBookings}</p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg border border-indigo-200">
        <h3 className="text-xl font-semibold text-indigo-900 mb-4">Booking Trends (Monthly)</h3>
        {bookingTrends.labels.length > 0 ? (
          <div style={{ height: "400px", width: "100%" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-600">No booking trends data available.</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;