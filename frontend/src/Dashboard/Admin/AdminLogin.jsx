import { useState, useContext } from "react";
import { authContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        dispatch({ type: "LOGIN_SUCCESS", payload: { role: "admin", token: data.token } });
        navigate("/admin");
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Login error");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="logo"
            className="w-20 h-20 object-contain"
          />
        </div>
        <h2 className="text-3xl font-bold text-indigo-900 mb-6 text-center">Admin Login</h2>
        <div className="flex justify-center mb-6">
          <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.761 0-5 2.239-5 5v1h10v-1c0-2.761-2.239-5-5-5zm9-5h-3m-3 3h6m-6-6h6" />
          </svg>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 w-full"
            required
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-105"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;