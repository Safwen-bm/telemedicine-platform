import { useEffect, useState } from "react";
import { BsArrowUpRight, BsSearch } from "react-icons/bs";

import DoctorCard from "../../components/Doctors/DoctorCard";
import Testimonial from "../../components/Testimonial/Testimonial";
import { BASE_URL } from "../../config";
import useFetchData from "../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";

const Doctors = () => {
  const [query, setQuery] = useState("");
  const [debounceQuery, setDebounceQuery] = useState("");

    const handleSearch = () => {
    const trimmed = query.trim();
    setQuery(trimmed);
    setDebounceQuery(trimmed);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceQuery(query);
    }, 700);

    return () => clearTimeout(timeout);
  }, [query]);

  const {
    data: doctors,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/doctors?query=${encodeURIComponent(debounceQuery)}`);

  return (
    <main>
      {/* Hero / Search */}
      <section className="border-b border-line bg-mint pt-24 pb-16 sm:pt-28 sm:pb-20">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              Find your doctor
            </p>

            <h1 className="mt-4 max-w-[850px] font-heading text-[48px] font-semibold leading-[1.02] tracking-[-0.02em] text-headingColor sm:text-[64px] lg:text-[76px]">
              The right care,
              <br />
              <em className="font-normal text-coral">
                when you need it.
              </em>
            </h1>

            <p className="mt-6 max-w-[560px] text-[17px] leading-7 text-textColor">
              Browse our doctors by name or specialty and find the right
              person for your consultation.
            </p>

            {/* Search */}
            <div className="mt-10 w-full max-w-[680px]">
              <div className="rounded-[14px] border border-line bg-paper p-6 text-left shadow-panelShadow sm:p-7">
                <div className="flex items-center gap-3 border-b border-headingColor pb-3">
                  <BsSearch
                    size={18}
                    className="shrink-0 text-primaryColor"
                  />

                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Doctor name or specialty"
                    className="min-w-0 flex-1 bg-transparent font-sans text-[16px] text-headingColor placeholder:text-textColor/70 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="group flex shrink-0 items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-headingColor transition-colors hover:text-coral"
                  >
                    Search
                    <BsArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                </div>

                <p className="mt-3 text-[12px] uppercase tracking-[0.12em] text-textColor">
                  Search by name or specialty
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="mb-10 flex items-end justify-between border-b border-headingColor pb-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                Available doctors
              </p>

              <h2 className="mt-2 font-heading text-[34px] font-semibold leading-tight sm:text-[42px]">
                Meet your care team
              </h2>
            </div>

            {!loading && !error && doctors && (
              <span className="hidden text-[12px] font-semibold uppercase tracking-[0.12em] text-textColor sm:block">
                {doctors.length}{" "}
                {doctors.length === 1 ? "doctor" : "doctors"}
              </span>
            )}
          </div>

          {loading && (
            <div className="flex min-h-[240px] items-center justify-center">
              <Loader />
            </div>
          )}

          {error && (
            <div className="border border-line bg-white px-6 py-10 text-center">
              <Error />
            </div>
          )}

          {!loading && !error && (
            <>
              {doctors?.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} />
                  ))}
                </div>
              ) : (
                <div className="border-y border-line py-20 text-center">
                  <p className="font-heading text-[28px] font-semibold text-headingColor">
                    No doctors found.
                  </p>

                  <p className="mt-3 text-[16px] leading-7 text-textColor">
                    Try searching for another name or specialty.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonial />
    </main>
  );
};

export default Doctors;
