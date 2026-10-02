import { useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Stethoscope, CalendarCheck2, TrendingUp } from "lucide-react";
import { authContext } from "../context/AuthContext";
import AdminHeader from "../Dashboard/Admin/AdminHeader";
import useFetchData from "../hooks/useFetchData";
import { BASE_URL } from "../config";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/patients", label: "Patients", icon: Users },
  { to: "/admin/doctors", label: "Doctors", icon: Stethoscope, badge: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck2 },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp },
];

const AdminLayout = () => {
  const { dispatch, user } = useContext(authContext);
  const navigate = useNavigate();

  const { data: pending, refetch: refreshPending } = useFetchData(`${BASE_URL}/doctors/pending`);
  const pendingCount = Array.isArray(pending) ? pending.length : 0;

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-paper">
      <AdminHeader name={user?.name} onLogout={handleLogout} />

      <div className="flex flex-col lg:flex-row">
        <aside className="border-b border-line bg-white lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <nav
            aria-label="Admin sections"
            className="flex gap-1 overflow-x-auto p-3 lg:sticky lg:top-16 lg:flex-col lg:p-4"
          >
            {NAV.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-[8px] px-4 py-3 text-[15px] font-semibold transition-colors ${
                    isActive
                      ? "bg-primaryColor text-white"
                      : "text-textColor hover:bg-paper hover:text-headingColor"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-5 w-5" />
                    {label}
                    {badge && pendingCount > 0 && (
                      <span
                        className={`ml-auto rounded-full px-2 py-0.5 text-[12px] ${
                          isActive ? "bg-white/20 text-white" : "bg-coral text-white"
                        }`}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-8">
          <Outlet context={{ refreshPending }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;