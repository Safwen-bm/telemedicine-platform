import { Link } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";

const stats = [
  { value: "10 min", label: "average time to a first consultation" },
  { value: "35+", label: "medical specialties" },
  { value: "5 days", label: "free follow-up after each visit" },
];

const gridBg = {
  backgroundImage:
    "linear-gradient(#D9D2C3 1px, transparent 1px), linear-gradient(90deg, #D9D2C3 1px, transparent 1px)",
  backgroundSize: "48px 48px",
  maskImage: "linear-gradient(to bottom, black, transparent 85%)",
  WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
};

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-[80px] pb-20 lg:pt-[88px] lg:pb-28">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      {/* Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={gridBg}
      />

      {/* Content */}
      <div className="container relative">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          {/* left */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-[4px] border border-line bg-white/70 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em] text-primaryColor">
              <span className="h-2 w-2 rounded-full bg-coral animate-blink" />
              Doctors online now
            </p>

            <h1 className="mt-6 text-[46px] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-[64px] lg:text-[84px]">
              A doctor,
              <br />
              without the
              <br />
              <em className="font-normal text-coral">waiting room.</em>
            </h1>

            <p className="mt-7 max-w-[520px] text-[18px] leading-[30px] text-textColor">
              Video consultations with licensed doctors, your whole medical folder
              in one place, and notes you can actually find later. Book in
              minutes, from any device.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link to="/doctors" className="btn !mt-0 inline-flex items-center gap-2">
                Find a doctor <BsArrowRight />
              </Link>
              <Link
                to="/register"
                className="border-b-2 border-ink pb-0.5 font-semibold text-ink hover:border-coral hover:text-coral transition-colors"
              >
                Create a free account
              </Link>
            </div>

            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-6">
              {stats.map((s) => (
                <div key={s.value}>
                  <dt className="font-heading text-[30px] font-semibold leading-none text-headingColor">
                    {s.value}
                  </dt>
                  <dd className="mt-2 text-[13px] leading-5 text-textColor">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* right: consultation slip */}
          <div className="relative lg:col-span-5">
            <div className="absolute -right-3 -top-3 hidden h-full w-full rotate-3 rounded-[14px] border border-line bg-mint sm:block" />

            <div className="relative -rotate-1 animate-rise rounded-[14px] border border-ink/15 bg-white p-6 shadow-panelShadow">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-textColor">
                <span>Consultation slip</span>
                <span>No. 0427</span>
              </div>

              <div className="my-4 border-t-2 border-dashed border-line" />

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primaryColor font-heading text-[20px] text-white">
                  LM
                </div>
                <div className="flex-1">
                  <p className="font-heading text-[20px] font-semibold leading-tight text-headingColor">
                    Dr. Leila M.
                  </p>
                  <p className="text-[14px] text-textColor">General medicine</p>
                </div>
                <span className="flex items-center gap-2 text-[13px] font-semibold text-primaryColor">
                  <span className="h-2 w-2 rounded-full bg-primaryColor animate-blink" />
                  Online
                </span>
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-line py-4 text-[14px]">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-textColor">Date</dt>
                  <dd className="mt-1 font-semibold text-headingColor">Today</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-textColor">Time</dt>
                  <dd className="mt-1 font-semibold text-headingColor">16:30</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-textColor">Type</dt>
                  <dd className="mt-1 font-semibold text-headingColor">Video, 20 min</dd>
                </div>
              </dl>

              {/* ECG line */}
              <svg viewBox="0 0 300 60" className="mt-5 h-14 w-full" fill="none" aria-hidden="true">
                <path
                  d="M0 30 H70 L80 30 L90 8 L102 52 L112 30 H150 L158 30 L166 18 L174 38 L182 30 H300"
                  stroke="#F0583A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw"
                  style={{ strokeDasharray: 600, strokeDashoffset: 600 }}
                />
              </svg>

              <Link
                to="/doctors"
                className="mt-4 flex items-center justify-center gap-2 rounded-[8px] bg-ink py-3 font-semibold text-paper hover:bg-primaryColor transition-colors"
              >
                Join the video room <BsArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;