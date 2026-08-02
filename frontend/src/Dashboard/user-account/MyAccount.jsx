import { useContext, useState } from "react";
import { authContext } from "./../../context/AuthContext";
import MyBookings from "./MyBookings";
import Profile from "./Profile";
import MedicalFolder from "./MedicalFolder";
import useGetProfile from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { CalendarCheck2, FolderHeart, UserCog } from "lucide-react";

const MyAccount = () => {
  const { dispatch } = useContext(authContext);
  const [tab, setTab] = useState("bookings");

  const {
    data: userData,
    loading,
    error,
  } = useGetProfile(`${BASE_URL}/users/profile/me`);

  const handleLogout = () => {
    if (dispatch) dispatch({ type: "LOGOUT" });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 mt-6">
      {loading && !error && <Loading />}
      {error && !loading && <Error errMessage={error} />}
      {!loading && !error && (
        <div className="grid md:grid-cols-4 gap-8">
          {/* LEFT SIDE - PROFILE CARD */}
          <div className="bg-white p-6 rounded-2xl shadow border">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-200 shadow-sm">
                <img
                  src={userData.photo}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mt-4">{userData.name}</h3>
              <p className="text-sm text-gray-500">{userData.email}</p>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-indigo-600 font-medium">Blood Type:</span> {userData.bloodType}
                </p>
                {userData.dateOfBirth && (
                  <p>
                    <span className="text-indigo-600 font-medium">DOB:</span>{" "}
                    {new Date(userData.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
                {(userData.conditions || userData.diseases)?.length > 0 && (
                  <p>
                    <span className="text-indigo-600 font-medium">Conditions:</span>{" "}
                    {(userData.conditions || userData.diseases).join(", ")}
                  </p>
                )}
              </div>

              <div className="mt-6 w-full space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
                >
                  Logout
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - CONTENT */}
          <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow border">
            {/* TABS */}
            <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-200 pb-4">
              <TabButton
                label="My Appointments"
                icon={<CalendarCheck2 className="w-4 h-4 mr-2" />}
                isActive={tab === "bookings"}
                onClick={() => setTab("bookings")}
              />
              <TabButton
                label="Medical Folder"
                icon={<FolderHeart className="w-4 h-4 mr-2" />}
                isActive={tab === "medical-folder"}
                onClick={() => setTab("medical-folder")}
              />
              
              <TabButton
                label="Profile Settings"
                icon={<UserCog className="w-4 h-4 mr-2" />}
                isActive={tab === "settings"}
                onClick={() => setTab("settings")}
              />
            </div>

            {/* CONTENT */}
            <div>
              {tab === "bookings" && <MyBookings />}
              {tab === "settings" && userData && <Profile user={userData} />}
              {tab === "medical-folder" && <MedicalFolder />}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// Tab Button Component
const TabButton = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center px-5 py-2 rounded-lg font-medium border transition-all ${
      isActive
        ? "bg-indigo-600 text-white border-indigo-600 shadow"
        : "text-gray-700 border-gray-300 bg-white hover:bg-gray-100"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default MyAccount;
