import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BsArrowUpRight } from "react-icons/bs";
import HashLoader from "react-spinners/HashLoader";
import { authContext } from "../../context/AuthContext";
import { BASE_URL } from "../../config";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { dispatch, token, role } = useContext(authContext);
  const navigate = useNavigate();

  if (token && role === "admin") return <Navigate to="/admin" replace />;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || "Login failed");

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: data.data, role: "admin", token: data.token },
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 transition-colors focus:border-primaryColor focus:outline-none";
  const labelClass =
    "mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor";

  return (
    <main className="flex min-h-screen items-center justify-center bg-mint px-4 py-16">
      <div className="w-full max-w-[460px] rounded-[16px] border border-line bg-paper px-6 py-10 sm:px-10 sm:py-12">
        <div className="text-center">
          <p className="font-heading text-[25px] font-semibold tracking-[-0.02em] text-primaryColor">
            Tabibi
          </p>
          <div className="mx-auto mt-6 h-px w-12 bg-coral" />
          <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
            Administration
          </p>
          <h1 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] text-headingColor">
            Admin <em className="font-normal text-coral">sign in.</em>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 space-y-6">
          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="admin@email.com"
              value={formData.email}
              onChange={handleInputChange}
              autoComplete="email"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-3 bg-primaryColor px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
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
        </form>

        <p className="mt-8 text-center text-[14px] text-textColor">
          <Link to="/" className="font-semibold text-primaryColor hover:text-coral">
            Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;