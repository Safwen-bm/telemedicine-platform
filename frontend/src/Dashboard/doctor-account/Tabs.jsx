import { useContext } from "react";
import { BiMenu } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { authContext } from "../../context/AuthContext";
import { CalendarCheck2, UserCog, LogOut } from "lucide-react";

const Tabs = ({ tab, setTab }) => {
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <CalendarCheck2 className="w-5 h-5 mr-2" /> },
    { id: "appointments", label: "Appointments", icon: <CalendarCheck2 className="w-5 h-5 mr-2" /> },
    { id: "settings", label: "Profile Settings", icon: <UserCog className="w-5 h-5 mr-2" /> },
  ];

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors/delete-account`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to delete account");
        dispatch({ type: "LOGOUT" });
        navigate("/");
      } catch (error) {
        console.error("Delete account error:", error.message);
        alert("Error deleting account. Please try again.");
      }
    }
  };

  return (
    <div className="w-full">
      <div className="lg:hidden mb-6">
        <BiMenu className="w-6 h-6 cursor-pointer text-gray-700" />
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col gap-4">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`w-full flex items-center px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
              tab === id
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
        <hr className="my-6 border-gray-200" />
        <button
          onClick={handleLogout}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
        >
          Logout
        </button>
        <button
          onClick={handleDeleteAccount}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Tabs;