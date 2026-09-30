import { useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";

const FaqItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="border-b border-line">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-6 py-6 text-left"
      >
        <span className="font-heading text-[22px] font-semibold leading-snug text-headingColor">
          {item.question}
        </span>
        <span
          className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            isOpen
              ? "border-coral bg-coral text-white"
              : "border-line text-primaryColor"
          }`}
        >
          {isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
        }`}
      >
        <p className="overflow-hidden text-[16px] leading-7 text-textColor">
          {item.content}
        </p>
      </div>
    </li>
  );
};

export default FaqItem;