import { useEffect, useRef, useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import { BiMenu } from "react-icons/bi";
import { authContext } from "../../context/AuthContext";
import { FaTachometerAlt } from "react-icons/fa"; 

const navLinks = [
  {
    path: "/home",
    display: "Home",
  },
  {
    path: "/doctors",
    display: "Find a Doctor",
  },
  {
    path: "/services",
    display: "Services",
  },
  {
    path: "/contact",
    display: "Contact",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, role, token } = useContext(authContext);

  const handleStickyHeader = () => {
    window.addEventListener("scroll", () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    });
  };

  useEffect(() => {
    handleStickyHeader();
    return () => window.removeEventListener("scroll", handleStickyHeader);
  }, []);

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu");

  useEffect(() => {
    console.log("Header Context Values:", {
      user: user || "No user",
      role: role || "No role",
      token: token ? "Token exists" : "No token",
      isAdmin: role === "admin"
    });
  }, [user, role, token]);

  console.log("Rendering with role:", role);

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* logo */}
          <div>
            <img src="/logo.png" alt="logo" />
          </div>

          {/* menu */}
          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <ul className="menu flex items-center gap-[2.7rem]">
              {navLinks.map((link, index) => (
                <li key={index}>
                  <NavLink
                    to={link.path}
                    className={(navClass) =>
                      navClass.isActive
                        ? "text-primaryColor text-[16px] leading-7 font-[600]"
                        : "text-textColor text-[16px] leading-7 font-[500] hover:text-primaryColor"
                    }
                    end={link.path === "/doctors"} 
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* nav right */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <>
                <div className="debug-role" style={{ display: 'none' }}>
                  Current role: {role}
                </div>
                {role === "admin" ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-textColor hover:text-primaryColor"
                  >
                    <FaTachometerAlt className="w-6 h-6" />
                    <span className="text-[16px] leading-7 font-[500]">Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to={`${role === "doctor" ? "/doctors/profile/me" : "/users/profile/me"}`}
                  >
                    <figure className="w-[35px] h-[35px] rounded-full cursor-pointer">
                      <img
                        src={user?.photo}
                        className="w-full rounded-full"
                        alt="user image"
                      />
                    </figure>
                  </Link>
                )}
              </>
            ) : (
              <Link to="/login">
                <button className="bg-primaryColor py-2 px-6 text-white font-[600] h-[44px] flex items-center justify-center rounded-[50px]">
                  Login
                </button>
              </Link>
            )}

            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;