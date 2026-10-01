import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, Building2 } from "lucide-react";
import DoctorAbout from "./DoctorAbout";
import Feedback from "./Feedback";
import SidePanel from "./SidePanel";
import { BASE_URL } from "./../../config";
import useFetchData from "./../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import ErrorMsg from "../../components/Error/Error";

const DoctorDetails = () => {
  const [tab, setTab] = useState("about");
  const { id } = useParams();
  const {
    data: doctor,
    loading,
    error,
    refetch,
  } = useFetchData(`${BASE_URL}/doctors/${id}`);

  // Only show the loader for the first load (or a different doctor), so a
  // refetch after a new review does not blank the page.
  const showLoader = loading && doctor?._id !== id;

  const {
    name,
    qualifications,
    experiences,
    reviews,
    bio,
    about,
    averageRating,
    totalRating,
    specialization,
    ticketPrice,
    photo,
    isApproved,
  } = doctor || {};

  const rating = Number(averageRating) || 0;
  const reviewCount = Number(totalRating) || 0;
  const hospital = experiences?.[0]?.hospital;
  const bookable = !isApproved || isApproved === "approved";

  const tabs = [
    { key: "about", label: "About" },
    { key: "feedback", label: `Reviews (${reviewCount})` },
  ];

  return (
    <section className="min-h-screen pb-24 pt-28">
      <div className="container">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-[14px] font-semibold text-textColor transition-colors hover:text-primaryColor"
        >
          <ArrowLeft className="h-4 w-4" /> All doctors
        </Link>

        {showLoader && (
          <div className="py-20">
            <Loader />
          </div>
        )}

        {error && !showLoader && (
          <div className="py-20">
            <ErrorMsg errMessage={error} />
          </div>
        )}

        {!showLoader && !error && doctor?._id && (
          <div className="mt-8 grid gap-12 lg:grid-cols-12">
            {/* main column */}
            <div className="lg:col-span-8">
              <header className="flex flex-col gap-8 sm:flex-row sm:items-start">
                <div className="relative mx-auto shrink-0 sm:mx-0">
                  <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[14px] border-2 border-primaryColor" />
                  {photo ? (
                    <img
                      src={photo}
                      alt={name ? `Portrait of ${name}` : "Doctor"}
                      className="relative h-60 w-48 rounded-[14px] bg-mint object-cover"
                    />
                  ) : (
                    <div className="relative flex h-60 w-48 items-center justify-center rounded-[14px] bg-mint font-heading text-[64px] text-primaryColor">
                      {(name || "D").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-center sm:pt-1 sm:text-left">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                    {specialization || "Specialist"}
                  </p>
                  <h1 className="mt-2 font-heading text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] text-headingColor sm:text-[48px]">
                    {name}
                  </h1>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setTab("feedback")}
                      className="flex items-center gap-2 text-[15px] text-headingColor hover:text-primaryColor"
                    >
                      <Star className="h-5 w-5 fill-yellowColor text-yellowColor" />
                      <span className="font-semibold">
                        {reviewCount > 0 ? rating.toFixed(1) : "No ratings yet"}
                      </span>
                      {reviewCount > 0 && (
                        <span className="text-textColor">
                          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      )}
                    </button>

                    {hospital && (
                      <span className="flex items-center gap-2 text-[15px] text-textColor">
                        <Building2 className="h-4 w-4" /> {hospital}
                      </span>
                    )}
                  </div>

                  {bio && (
                    <p className="mt-5 max-w-xl text-[17px] leading-7 text-textColor">{bio}</p>
                  )}
                </div>
              </header>

              {/* tabs */}
              <div className="mt-12 flex gap-8 border-b border-line" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition-colors ${
                      tab === t.key
                        ? "border-coral text-headingColor"
                        : "border-transparent text-textColor hover:text-primaryColor"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="mt-10">
                {tab === "about" && (
                  <DoctorAbout
                    name={name}
                    about={about}
                    qualifications={qualifications}
                    experiences={experiences}
                  />
                )}
                {tab === "feedback" && (
                  <Feedback
                    reviews={reviews}
                    totalRating={totalRating}
                    averageRating={averageRating}
                    onReviewAdded={refetch}
                  />
                )}
              </div>
            </div>

            {/* booking panel */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                {bookable ? (
                  <SidePanel doctorId={doctor._id} ticketPrice={ticketPrice} />
                ) : (
                  <div className="rounded-[14px] border border-line bg-white p-6 text-[15px] leading-7 text-textColor">
                    This doctor is not accepting bookings at the moment.
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorDetails;