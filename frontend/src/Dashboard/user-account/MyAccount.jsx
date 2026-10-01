// Telemedecine\frontend\src\Dashboard\user-account\MyAccount.jsx
import { useContext, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarCheck2, FolderHeart, UserCog, LogOut } from "lucide-react";
import { authContext } from "./../../context/AuthContext";
import MyBookings from "./MyBookings";
import Profile from "./Profile";
import MedicalFolder from "./MedicalFolder";
import DeleteAccount from "./DeleteAccount";
import useGetProfile from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";
import { fmtDate } from "../../components/ui/dashboard.jsx";

const TABS = [
  { key: "appointments", label: "Appointments", icon: CalendarCheck2 },
  { key: "folder", label: "Medical folder", icon: FolderHeart },
  { key: "settings", label: "Profile settings", icon: UserCog },
];

const getAge = (dob) => {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
};

const Vital = ({ label, value }) => (
  <div>
    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor">
      {label}
    </dt>
    <dd className="mt-0.5 text-[15px] font-semibold text-headingColor">
      {value || "Not set"}
    </dd>
  </div>
);

const MyAccount = () => {
  const { user: authUser, token, role, dispatch, logout } = useContext(authContext);
  const [params, setParams] = useSearchParams();
  const [profile, setProfile] = useState(null);

  const requested = params.get("tab");
  const tab = TABS.some((t) => t.key === requested) ? requested : "appointments";
  const setTab = (key) => setParams({ tab: key }, { replace: true });

  const {
    data: userData,
    loading,
    error,
  } = useGetProfile(`${BASE_URL}/users/profile/me`);

  const current = profile || userData;

  const handleSaved = (patch) => {
    setProfile({ ...current, ...patch });
    // keep the header avatar and name in sync
    if (dispatch && authUser) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: { ...authUser, ...patch }, token, role },
      });
    }
  };

  if (loading && !error) {
    return (
      <section className="pb-20 pt-28">
        <div className="container">
          <Loading />
        </div>
      </section>
    );
  }

  if (error || !current) {
    return (
      <section className="pb-20 pt-28">
        <div className="container">
          <ErrorMsg errMessage={error || "Could not load your account."} />
        </div>
      </section>
    );
  }

  const conditions = current.conditions || current.diseases || [];
  const age = getAge(current.dateOfBirth);
  const firstName = current.name?.split(" ")[0] || "there";
  const profileIncomplete = !current.bloodType || !current.dateOfBirth;

  return (
    <section className="pb-20 pt-28">
      <div className="container">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
          My account
        </p>
        <h1 className="mt-2 font-heading text-[36px] font-semibold leading-tight sm:text-[44px]">
          Hello, {firstName}
        </h1>
        <p className="mt-2 text-[16px] text-textColor">
          Manage your appointments, medical folder and personal details.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          {/* sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-[14px] border border-line bg-white p-6">
                <div className="flex items-center gap-4">
                  {current.photo ? (
                    <img
                      src={current.photo}
                      alt="My profile"
                      className="h-16 w-16 shrink-0 rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primaryColor font-heading text-[26px] text-white">
                      {(current.name || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-heading text-[20px] font-semibold text-headingColor">
                      {current.name}
                    </p>
                    <p className="truncate text-[14px] text-textColor">{current.email}</p>
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5">
                  <Vital label="Blood type" value={current.bloodType} />
                  <Vital label="Age" value={age !== null ? `${age} years` : null} />
                  {current.dateOfBirth && (
                    <div className="col-span-2">
                      <Vital label="Date of birth" value={fmtDate(current.dateOfBirth)} />
                    </div>
                  )}
                </dl>

                {conditions.length > 0 && (
                  <div className="mt-5 border-t border-line pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor">
                      Conditions
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {conditions.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-line bg-paper px-3 py-1 text-[13px] text-headingColor"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileIncomplete && (
                  <button
                    type="button"
                    onClick={() => setTab("settings")}
                    className="mt-5 w-full rounded-[8px] bg-mint px-4 py-3 text-left text-[13px] leading-5 text-primaryColor transition-colors hover:bg-line"
                  >
                    <span className="font-semibold">Complete your profile.</span>{" "}
                    Add your blood type and date of birth so doctors see them.
                  </button>
                )}
              </div>

              <nav
                aria-label="Account sections"
                className="flex gap-1 overflow-x-auto rounded-[14px] border border-line bg-white p-2 lg:flex-col"
              >
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    aria-current={tab === key ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-3 rounded-[8px] px-4 py-3 text-[15px] font-semibold transition-colors ${
                      tab === key
                        ? "bg-primaryColor text-white"
                        : "text-textColor hover:bg-paper hover:text-headingColor"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="flex shrink-0 items-center gap-3 rounded-[8px] px-4 py-3 text-[15px] font-semibold text-textColor transition-colors hover:bg-paper hover:text-red-700 lg:mt-1 lg:border-t lg:border-line"
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </button>
              </nav>
            </div>
          </aside>

          {/* content */}
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            {tab === "appointments" && <MyBookings />}
            {tab === "folder" && <MedicalFolder />}
            {tab === "settings" && (
              <>
                <Profile user={current} onSaved={handleSaved} />
                <DeleteAccount user={current} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyAccount;