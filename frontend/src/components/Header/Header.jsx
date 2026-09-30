import { useEffect, useState, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { BiMenu, BiX } from "react-icons/bi";
import { FaTachometerAlt } from "react-icons/fa";
import { BsArrowUpRight } from "react-icons/bs";

import { authContext } from "../../context/AuthContext";

const navLinks = [
  { path: "/", display: "Home" },
  { path: "/services", display: "Services" },
  { path: "/doctors", display: "Find a doctor" },
  { path: "/contact", display: "Contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { user, role, token } = useContext(authContext);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const profilePath =
    role === "doctor" ? "/doctors/profile/me" : "/users/profile/me";

  return (
    <header className={`header ${scrolled ? "sticky__header" : ""}`}>
      <div className="container">
        <div className="flex items-center justify-between leading-normal">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-primaryColor">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 12h5l2-6 4 12 2-6h7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="font-heading text-[24px] font-semibold leading-none tracking-[-0.02em] text-headingColor">
              Tabibi
            </span>
          </Link>

          {/* Menu */}
          <nav
            className={`${
              open ? "block" : "hidden"
            } absolute left-0 top-full w-full border-b border-line bg-paper px-5 py-5 shadow-md md:static md:block md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            <ul className="flex flex-col gap-5 md:flex-row md:items-center md:gap-10">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    end={link.path === "/"}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `relative inline-block py-1 text-[15px] font-semibold leading-none transition-colors ${
                        isActive
                          ? "text-primaryColor after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-coral"
                          : "text-textColor hover:text-primaryColor"
                      }`
                    }
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {token && user ? (
              role === "admin" ? (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-textColor transition-colors hover:text-primaryColor"
                >
                  <FaTachometerAlt className="h-5 w-5" />

                  <span className="text-[15px] font-semibold">
                    Dashboard
                  </span>
                </Link>
              ) : (
                <Link to={profilePath} aria-label="My account">
                  {user?.photo ? (
                    <img
                      src={user.photo}
                      alt="My profile"
                      className="h-[38px] w-[38px] rounded-full border border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primaryColor font-heading text-[16px] text-white">
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </Link>
              )
            ) : (
              <>
                {/* Sign in */}
                <Link
                  to="/login"
                  className="hidden px-2 py-2 text-[15px] font-semibold text-headingColor transition-colors hover:text-primaryColor sm:inline-flex"
                >
                  Sign in
                </Link>

                {/* Get started */}
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 bg-primaryColor px-5 py-2.5 text-[14px] font-semibold text-white transition-colors duration-300 hover:bg-ink"
                >
                  Get started
                  <BsArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <button
              type="button"
              className="md:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? (
                <BiX className="h-7 w-7 text-headingColor" />
              ) : (
                <BiMenu className="h-7 w-7 text-headingColor" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
