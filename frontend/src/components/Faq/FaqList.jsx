import { faqs } from "./../../assets/data/faqs";
import FaqItem from "./FaqItem";

const FaqList = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 mb-12 max-w-xl mx-auto">
          Here are answers to common questions. If you need more help, feel free to contact us directly.
        </p>
        <ul>
          {faqs.map((item, index) => (
            <FaqItem item={item} key={index} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FaqList;
