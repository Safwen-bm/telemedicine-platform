import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BsArrowUpRight, BsCamera } from "react-icons/bs";
import HashLoader from "react-spinners/HashLoader";

import uploadImageToCloudinary from "../utils/uploadCloudinary.js";
import { BASE_URL } from "../config.js";

const Signup = () => {
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "male",
    photo: "",
    role: "patient",
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setLoading(true);

    try {
      const data = await uploadImageToCloudinary(file);

      setPreviewURL(data.url);

      setFormData((prev) => ({
        ...prev,
        photo: data.url,
      }));
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

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
    <main>
      <section className="min-h-screen bg-mint px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid overflow-hidden rounded-[16px] border border-line bg-paper lg:grid-cols-2">
            {/* Image */}
            <div className="relative hidden min-h-[720px] overflow-hidden lg:block">
              <img
                src="/signup-img.jpg"
                alt="Create your Tabibi account"
                className="h-full w-full object-contain"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/80">
                  Welcome to Tabibi
                </p>

                <h2 className="mt-3 max-w-[480px] font-heading text-[42px] font-semibold leading-[1.05] text-white">
                  Your health,
                  <br />
                  <em className="font-normal text-coral">
                    in good hands.
                  </em>
                </h2>

                <p className="mt-5 max-w-[420px] text-[15px] leading-7 text-white/80">
                  Create your account and connect with doctors for simple,
                  convenient online consultations.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="w-full max-w-[460px]">
                <div className="mb-8">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-primaryColor">
                    Get started
                  </p>

                  <h1 className="mt-3 font-heading text-[38px] font-semibold leading-[1.05] text-headingColor sm:text-[46px]">
                    Create your
                    <br />
                    <em className="font-normal text-coral">
                      account.
                    </em>
                  </h1>

                  <p className="mt-4 text-[15px] leading-7 text-textColor">
                    Join Tabibi and make your next healthcare consultation
                    easier.
                  </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Full name
                    </label>

                    <input
                      type="text"
                      placeholder="Your full name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="your@email.com"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Create a password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none"
                      required
                    />
                  </div>

                  {/* Role + Gender */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                        Role
                      </label>

                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full border-b border-line bg-transparent py-3 text-[16px] leading-7 text-headingColor focus:border-primaryColor focus:outline-none"
                        required
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                        Gender
                      </label>

                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full border-b border-line bg-transparent py-3 text-[16px] leading-7 text-headingColor focus:border-primaryColor focus:outline-none"
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile Photo */}
                  <div className="pt-2">
                    <label className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Profile photo
                    </label>

                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-mint">
                        {previewURL ? (
                          <img
                            src={previewURL}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BsCamera
                            size={21}
                            className="text-primaryColor"
                          />
                        )}
                      </div>

                      <div>
                        <input
                          type="file"
                          name="photo"
                          id="customFile"
                          accept=".jpg, .jpeg, .png"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />

                        <label
                          htmlFor="customFile"
                          className="inline-flex cursor-pointer items-center gap-2 border border-line bg-white px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-headingColor transition-colors hover:border-primaryColor hover:text-primaryColor"
                        >
                          {previewURL ? "Change photo" : "Upload photo"}
                        </label>

                        <p className="mt-2 text-[12px] text-textColor">
                          JPG, JPEG or PNG
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-3">
                    <button
                      disabled={loading}
                      type="submit"
                      className="group flex w-full items-center justify-center gap-3 bg-primaryColor px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <HashLoader size={22} color="#ffffff" />
                      ) : (
                        <>
                          Create account
                          <BsArrowUpRight className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Login */}
                  <p className="pt-2 text-center text-[14px] text-textColor">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-primaryColor transition-colors hover:text-coral"
                    >
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Signup;
