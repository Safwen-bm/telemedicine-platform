import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { authContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(authContext);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password);
    setLoading(false);
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-0 py-12 bg-white">
      <div className="w-full max-w-[570px] mx-auto rounded-lg shadow-md p-6 sm:p-8 md:p-10">
        <h3 className="text-headingColor text-[22px] font-heading sm:text-2xl md:text-[22px] leading-9 font-bold mb-6 sm:mb-8 text-center">
          Hello <span className="text-primaryColor font-bold ">Welcome</span> Back 💐
        </h3>

        <form className="py-4 md:py-0" onSubmit={submitHandler}>
          <div className="mb-4 sm:mb-5">
            <input
              type="email"
              placeholder="Enter Your Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>

          <div className="mb-4 sm:mb-5">
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>

          <div className="mt-6 sm:mt-7">
            <button
              type="submit"
              className="w-full bg-primaryColor text-white text-base sm:text-lg md:text-[18px] leading-7 rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors"
            >
              {loading ? <HashLoader size={25} color="fff" /> : "Login"}
            </button>
          </div>

          <p className="mt-5 sm:mt-6 text-textColor text-center text-sm sm:text-base">
            Don't have an account?{" "}
            <Link to="/register" className="text-primaryColor font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;