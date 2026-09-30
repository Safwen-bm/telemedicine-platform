import { useState } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import DoctorAbout from "./DoctorAbout";
import Feedback from "./Feedback";
import SidePanel from "./SidePanel";
import { BASE_URL } from "./../../config";
import useFetchData from "./../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";

const DoctorDetails = () => {
  const [tab, setTab] = useState("about");
  const { id } = useParams();
  const { data: doctor, loading, error } = useFetchData(`${BASE_URL}/doctors/${id}`);

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
  } = doctor;

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {loading && <Loader />}
        {error && <Error />}
        {!loading && !error && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <div className="bg-white shadow-lg rounded-2xl p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <figure className="w-40 h-40 rounded-full overflow-hidden border-2 border-gray-200 shadow-md">
                    <img src={photo} alt="Doctor" className="w-full h-full object-cover" />
                  </figure>
                  <div className="text-center sm:text-left">
                    <span className="inline-block bg-gray-200 text-gray-800 px-5 py-2 rounded-full text-sm font-medium capitalize">
                      {specialization || "Specialist"}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-4">{name || "Dr. John Doe"}</h3>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                      <span className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
                        <Star className="w-5 h-5 fill-current" />
                        {averageRating || "N/A"}
                      </span>
                      <span className="text-gray-500 text-sm">({totalRating || 0})</span>
                    </div>
                    <p className="text-gray-600 mt-4 leading-relaxed max-w-xl text-base">
                      {bio || "A dedicated professional with a commitment to excellence in healthcare."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-b border-gray-200">
                <button
                  onClick={() => setTab("about")}
                  className={`py-3 px-6 text-base font-semibold text-gray-900 transition-all duration-200 ${
                    tab === "about" ? "border-b-2 border-blue-600 text-blue-600" : "hover:text-blue-600"
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setTab("feedback")}
                  className={`py-3 px-6 text-base font-semibold text-gray-900 transition-all duration-200 ${
                    tab === "feedback" ? "border-b-2 border-blue-600 text-blue-600" : "hover:text-blue-600"
                  }`}
                >
                  Feedback
                </button>
              </div>

              <div className="mt-8">
                {tab === "about" && (
                  <DoctorAbout
                    name={name}
                    about={about}
                    qualifications={qualifications}
                    experiences={experiences}
                  />
                )}
                {tab === "feedback" && (
                  <Feedback reviews={reviews} totalRating={totalRating} />
                )}
              </div>
            </div>

            {/* Side Panel */}
            <div className="lg:col-span-4">
              <SidePanel doctorId={doctor._id} ticketPrice={ticketPrice} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorDetails;