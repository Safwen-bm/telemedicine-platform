import { Link } from "react-router-dom";

const ClosingCTA = () => {
  return (
    <section className="px-5 py-20 sm:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-[16px] bg-primaryColor px-7 py-12 sm:px-12 sm:py-14 lg:px-16">
          {/* Decorative medical line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 right-[-20px] z-0 w-[380px] opacity-50"
          >
            <svg viewBox="0 0 360 80" fill="none" className="w-full">
              <path
                d="M0 40 H105 L120 40 L132 15 L148 65 L162 40 H215 L226 40 L238 25 L250 55 L262 40 H360"
                stroke="#F0E3E0"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Your health, on your schedule
              </p>

              <h2 className="font-heading text-[38px] font-semibold leading-[1.05] tracking-[-0.02em] text-white sm:text-[52px]">
                Feeling unwell?
                <br />
                <em className="font-normal text-white/75">Skip the queue.</em>
              </h2>

              <p className="mt-5 max-w-lg text-[16px] leading-7 text-white/75">
                Connect with a doctor from wherever you are. Book a video
                consultation in just a few minutes.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                to="/doctors"
                className="group inline-flex items-center gap-4 rounded-[8px] bg-coral px-7 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-paper hover:text-ink"
              >
                <span>Book a consultation</span>

                <span className="text-[20px] transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <p className="mt-3 text-center text-[11px] uppercase tracking-[0.12em] text-white/50">
                Doctors available online
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClosingCTA;
