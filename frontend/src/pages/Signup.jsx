import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BsArrowUpRight, BsCamera } from "react-icons/bs";
import HashLoader from "react-spinners/HashLoader";

import uploadImageToCloudinary from "../utils/uploadCloudinary.js";
import { BASE_URL } from "../config.js";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PHOTO_MB = 5;

const labelClass =
  "mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor";
const lineInputClass =
  "w-full border-b border-line bg-transparent px-0 py-3 text-[16px] leading-7 text-headingColor placeholder:text-textColor/60 focus:border-primaryColor focus:outline-none";
const lineSelectClass =
  "w-full border-b border-line bg-transparent py-3 text-[16px] leading-7 text-headingColor focus:border-primaryColor focus:outline-none";

const Signup = () => {
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_PHOTO_MB} MB`);
      return;
    }

    setUploading(true);
    try {
      const data = await uploadImageToCloudinary(file);
      if (!data?.url) throw new Error("Upload failed");

      setPreviewURL(data.url);
      setFormData((prev) => ({ ...prev, photo: data.url }));
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
        }),
      });

      // The server (or a proxy in front of it) may answer with something that is not JSON.
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Could not create your account. Please try again.");
      }

      toast.success(
        formData.role === "doctor"
          ? "Account created. Your profile will be reviewed before patients can book you."
          : data.message || "Account created"
      );
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || uploading;

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
                className="h-full w-full object-cover"
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
                    <label htmlFor="name" className={labelClass}>
                      Full name
                    </label>

                    <input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      autoComplete="name"
                      className={lineInputClass}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      className={lineInputClass}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className={labelClass}>
                      Password
                    </label>

                    <input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={MIN_PASSWORD_LENGTH}
                      autoComplete="new-password"
                      className={lineInputClass}
                      required
                    />
                    <p className="mt-2 text-[12px] text-textColor">
                      At least {MIN_PASSWORD_LENGTH} characters
                    </p>
                  </div>

                  {/* Role + Gender */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="role" className={labelClass}>
                        Role
                      </label>

                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={lineSelectClass}
                        required
                      >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="gender" className={labelClass}>
                        Gender
                      </label>

                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={lineSelectClass}
                        required
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>

                  {formData.role === "doctor" && (
                    <p className="border-l-2 border-coral bg-white px-4 py-3 text-[13px] leading-6 text-textColor">
                      Doctor profiles are reviewed before they become visible to
                      patients. You can complete your profile right after signing in.
                    </p>
                  )}

                  {/* Profile Photo */}
                  <div className="pt-2">
                    <p className="mb-3 block text-[12px] font-semibold uppercase tracking-[0.08em] text-headingColor">
                      Profile photo
                    </p>

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
                          disabled={busy}
                        />

                        <label
                          htmlFor="customFile"
                          className={`inline-flex cursor-pointer items-center gap-2 border border-line bg-white px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-headingColor transition-colors hover:border-primaryColor hover:text-primaryColor ${
                            busy ? "pointer-events-none opacity-60" : ""
                          }`}
                        >
                          {uploading
                            ? "Uploading..."
                            : previewURL
                            ? "Change photo"
                            : "Upload photo"}
                        </label>

                        <p className="mt-2 text-[12px] text-textColor">
                          JPG, JPEG or PNG, up to {MAX_PHOTO_MB} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-3">
                    <button
                      disabled={busy}
                      type="submit"
                      className="group flex w-full items-center justify-center gap-3 bg-primaryColor px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <HashLoader size={22} color="#ffffff" />
                      ) : uploading ? (
                        "Uploading photo..."
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