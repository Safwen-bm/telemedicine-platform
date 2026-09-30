import { Link } from "react-router-dom";
import FaqItem from "./FaqItem";

const faqs = [
  {
    question: "How can I book a consultation?",
    content:
      "You can book a consultation by choosing a doctor or specialist and selecting an available appointment time.",
  },
  {
    question: "Can I consult a doctor online?",
    content:
      "Yes. You can have an online consultation with a doctor through the platform without needing to visit the medical office.",
  },
  {
    question: "How do I find the right doctor?",
    content:
      "You can browse doctors and specialists based on their medical specialty and choose the one that best matches your needs.",
  },
  {
    question: "Can I cancel my appointment?",
    content:
      "Yes. You can cancel an appointment from your account before the scheduled consultation.",
  },
  {
    question: "How does an online consultation work?",
    content:
      "After booking your appointment, you can join the consultation at the scheduled time and communicate with your doctor online.",
  },
];

const FaqList = () => {
  return (
    <section className="py-24">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              FAQ
            </p>

            <h2 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] sm:text-[48px]">
              Questions, <em className="font-normal text-coral">answered.</em>
            </h2>

            <p className="mt-5 max-w-sm text-[16px] leading-7 text-textColor">
              Can't find what you need? Write to us and we will get back to you.
            </p>

            <Link
              to="/contact"
              className="mt-6 inline-block border-b-2 border-ink pb-0.5 font-semibold text-ink transition-colors hover:border-coral hover:text-coral"
            >
              Contact us
            </Link>
          </div>

          <ul className="border-t border-line lg:col-span-8">
            {faqs.map((item, index) => (
              <FaqItem item={item} key={index} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FaqList;

