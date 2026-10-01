import { useEffect } from "react";
import { X } from "lucide-react";

export const inputClass =
  "w-full rounded-[8px] border border-line bg-white px-4 py-3 text-[15px] text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none focus:ring-2 focus:ring-primaryColor/20 disabled:cursor-not-allowed disabled:bg-paper disabled:text-textColor";

export const labelClass = "mb-1.5 block text-[13px] font-semibold text-headingColor";

export const fmtDate = (
  value,
  options = { day: "numeric", month: "short", year: "numeric" }
) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-US", options);
};

export const fmtTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "N/A"
    : d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
};

const STATUS_STYLES = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  completed: "border-primaryColor/20 bg-mint text-primaryColor",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

export const StatusBadge = ({ status = "" }) => (
  <span
    className={`inline-flex items-center rounded-[6px] border px-2.5 py-1 text-[12px] font-semibold capitalize ${
      STATUS_STYLES[status] || "border-line bg-paper text-textColor"
    }`}
  >
    {status || "unknown"}
  </span>
);

export const PanelHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="font-heading text-[30px] font-semibold leading-tight text-headingColor">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[15px] text-textColor">{description}</p>
      )}
    </div>
    {action}
  </div>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="rounded-[14px] border border-dashed border-line bg-white px-6 py-12 text-center">
    {Icon && (
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint text-primaryColor">
        <Icon className="h-6 w-6" />
      </span>
    )}
    <p className="mt-4 font-heading text-[22px] font-semibold text-headingColor">
      {title}
    </p>
    {text && (
      <p className="mx-auto mt-2 max-w-md text-[15px] text-textColor">{text}</p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const Modal = ({ title, onClose, children, footer }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-ink/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-[14px] bg-white shadow-panelShadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-heading text-[22px] font-semibold text-headingColor">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-textColor transition-colors hover:bg-paper hover:text-headingColor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};