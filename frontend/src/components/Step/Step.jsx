import { Link } from "react-router-dom";

const steps = [
  {
    n: "01",
    title: "Create your account",
    text: "Sign up in a minute and start your personal medical folder.",
  },
  {
    n: "02",
    title: "Pick a doctor and a time",
    text: "Browse by specialty, read patient reviews, pay securely and lock your slot.",
  },
  {
    n: "03",
    title: "Meet in the video room",
    text: "Talk face to face. Your doctor's notes are saved to your folder afterwards.",
  },
];

const StepsSection = () => {
  return (
    <section className="bg-ink py-24 text-paper">
      <div className="container">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-yellowColor">
              How it works
            </p>
            <h2 className="mt-4 font-heading text-[38px] font-semibold leading-[1.08] text-paper sm:text-[52px]">
              From symptom to <em className="font-normal text-coral">answer</em> in three steps.
            </h2>
            <Link
              to="/register"
              className="mt-10 inline-block rounded-[8px] bg-coral px-7 py-3 font-semibold text-white hover:bg-paper hover:text-ink transition-colors"
            >
              Start now
            </Link>
            <p className="mt-6 text-[15px] text-paper/70">
              Want to see what is available first?{" "}
              <Link to="/services" className="underline underline-offset-4 hover:text-coral">
                Browse our services
              </Link>
            </p>
          </div>

          <ol className="lg:col-span-7">
            {steps.map((s) => (
              <li
                key={s.n}
                className="flex gap-6 border-t border-paper/20 py-8 first:border-t-0 first:pt-0"
              >
                <span className="font-heading text-[56px] font-semibold leading-none text-yellowColor">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-heading text-[26px] font-semibold text-paper">{s.title}</h3>
                  <p className="mt-2 max-w-md text-[16px] leading-7 text-paper/70">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;