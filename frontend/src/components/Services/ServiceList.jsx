import { useState } from "react";
import { Link } from "react-router-dom";
import { BsArrowUpRight } from "react-icons/bs";
import { serviceLists, serviceTabs } from "./ServiceData";

const ServiceList = () => {
  const [tab, setTab] = useState("symptoms");

  return (
    <section className="py-24">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left content */}
          <div className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              What can we help with
            </p>

            <h2 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] sm:text-[52px]">
              What brings you in{" "}
              <em className="font-normal text-coral">today?</em>
            </h2>

            <p className="mt-5 max-w-md text-[17px] leading-7 text-textColor">
              Start from how you feel, or go straight to the specialty you
              need.
            </p>

            {/* Tabs */}
            <div
              className="mt-8 flex gap-6 border-b border-line"
              role="tablist"
            >
              {serviceTabs.map((tabItem) => (
                <button
                  key={tabItem.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === tabItem.key}
                  onClick={() => setTab(tabItem.key)}
                  className={`-mb-px border-b-2 pb-3 text-[15px] font-semibold transition-colors ${
                    tab === tabItem.key
                      ? "border-coral text-headingColor"
                      : "border-transparent text-textColor hover:text-primaryColor"
                  }`}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Service list */}
          <ul className="grid gap-x-12 lg:col-span-7 md:grid-cols-2">
            {serviceLists[tab].map(({ name, icon: Icon }, i) => (
              <li key={name}>
                <Link
                  to="/doctors"
                  className="group flex items-center gap-3 border-b border-line py-4"
                >
                  {/* Number */}
                  <span className="w-6 shrink-0 font-heading text-[13px] text-coral">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Icon */}
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-headingColor transition-all duration-300 group-hover:border-coral group-hover:text-coral">
                    <Icon size={22} strokeWidth={1.6} />
                  </span>

                  {/* Name */}
                  <span className="flex-1 font-heading text-[20px] font-semibold leading-tight text-headingColor transition-colors group-hover:text-primaryColor">
                    {name}
                  </span>

                  {/* Arrow */}
                  <BsArrowUpRight className="text-textColor transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coral" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ServiceList;