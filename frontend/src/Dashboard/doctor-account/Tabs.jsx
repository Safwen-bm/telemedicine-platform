import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, CalendarCheck2, UserCog, LogOut } from "lucide-react";
import { authContext } from "../../context/AuthContext";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", icon: CalendarCheck2 },
  { id: "settings", label: "Profile settings", icon: UserCog },
];

const Tabs = ({ tab, setTab, pendingCount = 0 }) => {
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <nav
      aria-label="Dashboard sections"
      className="flex gap-1 overflow-x-auto rounded-[14px] border border-line bg-white p-2 lg:flex-col"
    >
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setTab(id)}
          aria-current={tab === id ? "page" : undefined}
          className={`flex shrink-0 items-center gap-3 rounded-[8px] px-4 py-3 text-[15px] font-semibold transition-colors ${
            tab === id
              ? "bg-primaryColor text-white"
              : "text-textColor hover:bg-paper hover:text-headingColor"
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
          {id === "appointments" && pendingCount > 0 && (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[12px] ${
                tab === id ? "bg-white/20 text-white" : "bg-mint text-primaryColor"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>
      ))}
      <button
        type="button"
        onClick={handleLogout}
        className="flex shrink-0 items-center gap-3 rounded-[8px] px-4 py-3 text-[15px] font-semibold text-textColor transition-colors hover:bg-paper hover:text-red-700 lg:mt-1 lg:border-t lg:border-line"
      >
        <LogOut className="h-5 w-5" />
        Log out
      </button>
    </nav>
  );
};

export default Tabs;