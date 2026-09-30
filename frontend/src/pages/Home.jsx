import { Link } from "react-router-dom";
import Hero from "../components/Hero/Hero";
import ServiceList from "../components/Services/ServiceList";
import Step from "../components/Step/Step";
import About from "../components/About/About";
import DoctorList from "../components/Doctors/DoctorList";
import Testimonial from "../components/Testimonial/Testimonial";
import FaqList from "../components/Faq/FaqList";
import ClosingCTA from "../components/ClosingCTA/ClosingCTA";

const Home = () => {
  return (
    <>
      <Hero />
      <ServiceList />
      <Step />
      <About />

      {/* Doctors */}
      <section className="bg-white py-24">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                Our doctors
              </p>
              <h2 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] sm:text-[52px]">
                Meet the people
                <br />
                behind the <em className="font-normal text-coral">screen.</em>
              </h2>
            </div>
            <Link
              to="/doctors"
              className="border-b-2 border-ink pb-0.5 font-semibold text-ink transition-colors hover:border-coral hover:text-coral"
            >
              See all doctors
            </Link>
          </div>
          <DoctorList limit={3} />
        </div>
      </section>

      <Testimonial />
      <FaqList />

      <ClosingCTA />
    </>
  );
};

export default Home;
