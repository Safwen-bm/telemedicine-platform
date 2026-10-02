import { Link } from "react-router-dom";
import { ExternalLink, LogOut } from "lucide-react";

const AdminHeader = ({ name, onLogout }) => (
  <header className="sticky top-0 z-40 border-b border-line bg-paper">
    <div className="flex h-16 items-center justify-between px-5 lg:px-8">
      <Link to="/admin" className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primaryColor">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path
              d="M2 12h5l2-6 4 12 2-6h7"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-heading text-[22px] font-semibold leading-none tracking-[-0.02em] text-headingColor">
          Tabibi
        </span>
        <span className="rounded-[6px] bg-mint px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primaryColor">
          Admin
        </span>
      </Link>

      <div className="flex items-center gap-5">
        <Link
          to="/"
          className="hidden items-center gap-1.5 text-[14px] font-semibold text-textColor transition-colors hover:text-primaryColor sm:flex"
        >
          <ExternalLink className="h-4 w-4" /> View site
        </Link>
        {name && <span className="hidden text-[14px] text-textColor md:block">{name}</span>}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-[14px] font-semibold text-textColor transition-colors hover:text-red-700"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </div>
  </header>
);

export default AdminHeader;