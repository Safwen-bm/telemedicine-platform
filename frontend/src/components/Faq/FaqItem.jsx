import { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

const FaqItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className="group bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-lg lg:text-xl font-semibold text-gray-900 leading-snug">
          {item.question}
        </h4>
        <div
          className={`w-8 h-8 min-w-[2rem] min-h-[2rem] flex items-center justify-center rounded-full border transition-all duration-300 ${
            isOpen
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 text-blue-600 border-gray-300"
          }`}
        >
          {isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "mt-4 max-h-[1000px]" : "max-h-0"
        }`}
      >
        <p className="text-gray-600 text-base leading-relaxed">
          {item.content}
        </p>
      </div>
    </div>
  );
};

export default FaqItem;
