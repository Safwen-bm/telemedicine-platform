import { Link } from "react-router-dom";

const points = [
  {
    title: "Personalized healthcare",
    text: "One medical folder with every visit, note and document, so you never start from zero with a new doctor.",
  },
  {
    title: "Secure and private",
    text: "Your medical folder is yours. You decide who gets to see it.",
  },
];

const About = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="grid items-center gap-16 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[14px] border-2 border-primaryColor" />
            <img
              src="/about-img.png"
              alt="Telehealth consultation"
              className="relative w-full rounded-[14px] bg-mint object-cover"
            />
          </div>

          <div className="lg:col-span-7">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              About
            </p>
            <h2 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] sm:text-[52px]">
              Care that follows you, <em className="font-normal text-coral">securely.</em>
            </h2>
            <p className="mt-5 max-w-xl text-[17px] leading-7 text-textColor">
              Seamless video consultations, organized medical records and easy
              follow-ups, all in one trusted place.
            </p>

            <ul className="mt-10 border-t border-line">
              {points.map((p) => (
                <li key={p.title} className="border-b border-line py-6">
                  <h3 className="font-heading text-[24px] font-semibold text-headingColor">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-lg text-[16px] leading-7 text-textColor">
                    {p.text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link to="/doctors" className="btn !mt-0">
                Book a consultation
              </Link>
              <Link
                to="/register"
                className="border-b-2 border-ink pb-0.5 font-semibold text-ink transition-colors hover:border-coral hover:text-coral"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;