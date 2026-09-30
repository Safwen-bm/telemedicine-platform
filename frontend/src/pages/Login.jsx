import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { BsArrowUpRight } from "react-icons/bs";

import { authContext } from "../context/AuthContext.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const { login } = useContext(authContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    await login(formData.email, formData.password);

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-mint px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-[560px] items-center justify-center">
        <div className="w-full rounded-[16px] border border-line bg-paper px-6 py-10 sm:px-10 sm:py-12">
          {/* Brand */}
          <div className="text-center">
            <Link
              to="/"
              className="font-heading text-[25px] font-semibold tracking-[-0.02em] text-primaryColor"
            >
              Tabibi
            </Link>

            <div className="mx-auto mt-7 h-px w-12 bg-coral" />
          </div>

          {/* Heading */}
          <div className="mt-8 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
              Welcome back
            </p>

            <h1 className="mt-3 font-heading text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-headingColor sm:text-[48px]">
              Good to
              <br />
              <em className="font-normal text-coral">see you again.</em>
            </h1>

            <p className="mx-auto mt-4 max-w-[380px] text-[15px] leading-7 text-textColor">
              Sign in to manage your appointments and continue your care.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="mt-9">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 transition-colors focus:border-primaryColor focus:outline-none"
                required
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="password"
                className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Your password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 transition-colors focus:border-primaryColor focus:outline-none"
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="group mt-8 flex w-full items-center justify-center gap-3 bg-primaryColor px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <HashLoader size={22} color="#ffffff" />
              ) : (
                <>
                  Sign in
                  <BsArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            <p className="mt-6 text-center text-[14px] text-textColor">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-primaryColor transition-colors hover:text-coral"
              >
                Create one
              </Link>
            </p>
          </form>

          {/* Small footer note */}
          <div className="mt-9 border-t border-line pt-5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-textColor/70">
              Secure · Simple · Private
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
