import { Link } from "react-router-dom";
import { BsArrowUpRight } from "react-icons/bs";
import { serviceLists } from "./ServiceData";

const ServiceColumn = ({ title, items }) => {
  return (
    <div>
      <div className="flex items-end justify-between border-b border-headingColor pb-4">
        <h2 className="font-heading text-[30px] font-semibold text-headingColor sm:text-[36px]">
          {title}
        </h2>

        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-textColor">
          {items.length} services
        </span>
      </div>

      <ul>
        {items.map(({ name, icon: Icon }, i) => (
          <li key={name}>
            <Link
              to="/doctors"
              className="group flex items-center gap-4 border-b border-line py-4"
            >
              {/* Number */}
              <span className="w-7 shrink-0 font-heading text-[13px] text-coral">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Icon */}
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-headingColor transition-all duration-300 group-hover:border-coral group-hover:text-coral">
                <Icon size={24} strokeWidth={1.6} />
              </span>

              {/* Name */}
              <span className="flex-1 font-heading text-[20px] font-semibold text-headingColor transition-colors group-hover:text-primaryColor sm:text-[22px]">
                {name}
              </span>

              {/* Arrow */}
              <BsArrowUpRight className="text-textColor transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coral" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AllServices = () => {
  return (
    <main>
      {/* Hero */}
      <section className="px-5 pt-8 pb-20 sm:pt-10 lg:pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[16px]">
            <img
              src="/service-img.jpg"
              alt="Doctor during an online video consultation"
              className="block h-auto w-full"
            />

            {/* Soft overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-paper/95 via-paper/65 to-transparent" />

            {/* Hero content */}
            <div className="absolute inset-0 flex items-center">
              <div className="px-7 sm:px-12 lg:px-16">
                <div className="max-w-[500px]">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                    Our services
                  </p>

                  <h1 className="mt-4 font-heading text-[46px] font-semibold leading-[1.02] tracking-[-0.02em] text-headingColor sm:text-[64px]">
                    Care that fits
                    <br />
                    <em className="font-normal text-coral">your needs.</em>
                  </h1>

                  <p className="mt-6 max-w-[440px] text-[17px] leading-7 text-textColor">
                    Whether you know what you need or are starting with a
                    symptom, find the right care and connect with a doctor
                    online.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service directory */}
      <section className="pb-24">
        <div className="container">
          <div className="mb-12">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              Find your care
            </p>

            <h2 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] sm:text-[52px]">
              What can we help with{" "}
              <em className="font-normal text-coral">today?</em>
            </h2>
          </div>

          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <ServiceColumn title="By symptom" items={serviceLists.symptoms} />

            <ServiceColumn
              title="By specialty"
              items={serviceLists.specialties}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default AllServices;
