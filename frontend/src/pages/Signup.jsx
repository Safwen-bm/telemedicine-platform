import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";

import uploadImageToCloudinary from "../utils/uploadCloudinary.js";
import { BASE_URL } from "../config.js";

const Signup = () => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
    //country: "",
    //dateOfBirth: "",
    photo: "",
    role: "patient",
  });

  const navigate = useNavigate();

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setLoading(true);
  try {
    const data = await uploadImageToCloudinary(file); // returns { url: "..." }

    setPreviewURL(data.url);

    // ✅ store ONLY the URL in formData.photo (string)
    setFormData((prev) => ({ ...prev, photo: data.url }));
  } catch (err) {
    toast.error("Image upload failed");
  } finally {
    setLoading(false);
  }
};


  const submitHandler = async event => {

    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const { message } = await res.json();

      if (!res.ok) {
        throw new Error(message);
      }

      setLoading(false);
      toast.success(message);
      navigate("/login");

    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 lg:px-0 py-12 bg-white">
      <div className="max-w-[1170px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Box */}
          <div className="hidden lg:flex justify-center rounded-l-lg">
            <figure className="rounded-l-lg overflow-hidden w-full">
              <img
                src="/signup-img.png"
                alt="Signup illustration"
                className="w-full h-auto object-contain"
              />
            </figure>
          </div>

          {/* Signup Form */}
          <div className="flex justify-center items-center rounded-l-lg py-10 bg-white shadow-md">
            <div className="w-full max-w-[400px]">
              <h3 className="text-headingColor text-[22px] font-heading sm:text-2xl md:text-[22px] leading-9 font-bold mb-6 sm:mb-8 text-center">
                Create an <span className="text-primaryColor font-bold">account</span>
              </h3>

              <form onSubmit={submitHandler} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Enter Your Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                    required
                  />
                </div>

                <div>
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

                <div>
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

                <div>
                  <label className="text-gray-900 text-base font-medium mb-2 block">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                    required
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-900 text-base font-medium mb-2 block">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                { /* 
                <div>
                  <label className="text-gray-900 text-base font-medium mb-2 block">Country</label>
                  <input
                    type="text"
                    placeholder="Enter Your Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-900 text-base font-medium mb-2 block">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-base leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
                    required
                  />
                </div>
                */}

                <div className="mb-5 flex items-center gap-3">
                  {selectedFile ? (
                    <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                      {previewURL ? (
                        <img
                          src={previewURL}
                          alt="Profile preview"
                          className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center animate-pulse bg-gray-200 rounded-full">
                          <span className="text-gray-500 text-sm">Loading...</span>
                        </div>
                      )}
                    </figure>
                  ) : null}

                  <div>
                    <input
                      type="file"
                      name="photo"
                      id="customFile"
                      accept=".jpg, .png"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="customFile"
                      className="text-primaryColor font-medium cursor-pointer bg-blue-100 py-2 px-4 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      Upload Photo
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    disabled={loading && true}
                    type="submit"
                    className="w-full bg-primaryColor text-white text-base sm:text-lg md:text-[18px] leading-7 rounded-lg px-4 py-3 hover:bg-blue-700 transition-colors"
                  >
                    {loading ? (
                      <HashLoader size={35} color="#ffffff" />
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>

                <p className="mt-5 text-textColor text-center text-sm sm:text-base">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primaryColor font-medium">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;