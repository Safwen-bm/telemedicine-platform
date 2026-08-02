import { useContext, useEffect } from "react";
import { authContext } from "../context/AuthContext";
import { useNavigate, Link, Outlet } from "react-router-dom";
import AdminHeader from "../Dashboard/Admin/AdminHeader";

const AdminLayout = () => {
  const { dispatch, token } = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/admin/login");
  };

  useEffect(() => {
    console.log("Token in AdminLayout:", token);
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white text-gray-800 p-4 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-indigo-900">Admin Panel</h2>
          <nav>
            <ul>
              <li className="mb-4">
                <Link
                  to="/admin/patients"
                  className="block p-2 rounded-md transition duration-200 hover:bg-indigo-600 hover:text-white"
                >
                  Patients
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  to="/admin/doctors"
                  className="block p-2 rounded-md transition duration-200 hover:bg-indigo-600 hover:text-white"
                >
                  Doctors
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  to="/admin/bookings"
                  className="block p-2 rounded-md transition duration-200 hover:bg-indigo-600 hover:text-white"
                >
                  Bookings
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  to="/admin/analytics"
                  className="block p-2 rounded-md transition duration-200 hover:bg-indigo-600 hover:text-white"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-white p-2 bg-red-500 hover:bg-red-600 rounded-md transition duration-200"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 bg-gray-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;