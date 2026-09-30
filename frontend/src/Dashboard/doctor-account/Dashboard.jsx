import { useState } from "react";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import useGetProfile from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Tabs from "./Tabs";
import { Star } from "lucide-react";
import DoctorAbout from "./../../pages/Doctors/DoctorAbout";
import Profile from "./Profile";
import Appointments from "./Appointments";

const Dashboard = () => {
  const { data, error, loading } = useGetProfile(`${BASE_URL}/doctors/profile/me`);
  const [tab, setTab] = useState("overview");

  return (
    <section className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}
        {!loading && !error && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-3 lg:sticky lg:top-12">
              <Tabs tab={tab} setTab={setTab} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-10">
              {/* Profile Header */}
              <div className="bg-white shadow-lg rounded-2xl p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  <figure className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                    <img
                      src={data?.photo}
                      alt="Doctor"
                      className="w-full h-full object-cover"
                    />
                  </figure>
                  <div className="text-center lg:text-left">
                    <span className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full text-base font-medium capitalize">
                      {data.specialization || "Specialist"}
                    </span>
                    <h1 className="text-3xl font-bold text-gray-900 mt-4">{data.name || "Dr. John Doe"}</h1>
                    <div className="flex items-center justify-center lg:justify-start gap-2 mt-3">
                      <span className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
                        <Star className="w-5 h-5 fill-current" />
                        {data.averageRating || "N/A"}
                      </span>
                      <span className="text-gray-500 text-sm">({data.totalRating || 0})</span>
                    </div>
                    <p className="text-gray-600 mt-4 leading-relaxed max-w-xl text-base">
                      {data?.bio || "A dedicated professional with a commitment to excellence in healthcare."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Approval Warning */}
              {data.isApproved === "pending" && (
                <div className="flex items-center p-5 bg-gray-100 border-l-4 border-blue-600 rounded-xl shadow-md animate-fade-in">
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6 mr-3 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-800 tracking-wide">
                    To get approval, please complete your profile. We'll review and approve within 3 days.
                  </span>
                </div>
              )}

              {/* Tab Content */}
              <div className="space-y-10">
                {tab === "overview" && (
                  <div className="bg-white shadow-lg rounded-2xl p-8 animate-fade-in">
                    <DoctorAbout
                      name={data.name}
                      about={data.about}
                      qualifications={data.qualifications}
                      experiences={data.experiences}
                    />
                  </div>
                )}
                {tab === "appointments" && (
                  <div className="bg-white shadow-lg rounded-2xl p-8 animate-fade-in">
                    <Appointments appointments={data.appointments} />
                  </div>
                )}
                {tab === "settings" && (
                  <div className="bg-white shadow-lg rounded-2xl p-8 animate-fade-in">
                    <Profile doctorData={data} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Styles for Animations */}
      <style jsx>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  );
};

export default Dashboard;