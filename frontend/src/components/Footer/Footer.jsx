import { Link } from "react-router-dom";

const columns = [
  {
    title: "Patients",
    links: [
      { to: "/doctors", label: "Find a doctor" },
      { to: "/services", label: "Services" },
      { to: "/register", label: "Create an account" },
      { to: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Doctors",
    links: [
      { to: "/register", label: "Join the network" },
      { to: "/login", label: "Doctor login" },
    ],
  },
  {
    title: "Help",
    links: [{ to: "/contact", label: "Contact us" }],
  },
];

const Footer = () => {
  return (
    <footer className="bg-ink text-paper">
      <div className="container pt-16 pb-4">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-heading text-[44px] font-semibold leading-none tracking-[-0.02em] sm:text-[64px]">
              Tabibi
              <span className="text-coral">.</span>
            </p>

            <p className="mt-5 max-w-sm text-[16px] leading-7 text-paper/70">
              Online consultations with licensed doctors, and a medical folder
              that stays with you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-6">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.16em] text-yellowColor">
                  {col.title}
                </h3>

                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-[15px] text-paper/80 transition-colors hover:text-coral"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency notice */}
        <p className="mt-14 text-center text-[12px] text-paper/50">
          Not for emergencies. If you think you are having a medical emergency,
          contact your local emergency services.
        </p>

        {/* Bottom links */}
        <div className="mt-4 border-t border-paper/15 pt-6 text-[13px] text-paper/60">
          <div className="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-center">
            {/* Copyright */}
            <p className="text-center md:text-left">
              © {new Date().getFullYear()} Tabibi. All rights reserved.
            </p>

            {/* Built by */}
            <p className="text-center">
              Built by{" "}
              <span className="font-semibold text-paper/80">
                Safwen Ben Mabrouk
              </span>
            </p>

            {/* Social links */}
            <div className="flex items-center justify-center gap-5 md:justify-end">
              <a
                href="https://linkedin.com/in/safwen-ben-mabrouk"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-coral"
              >
                LinkedIn
              </a>

              <a
                href="https://github.com/Safwen-bm"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-coral"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
