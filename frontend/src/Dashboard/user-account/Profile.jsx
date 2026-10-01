//Telemedecine\frontend\src\Dashboard\user-account\Profile.jsx
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import uploadImageToCloudinary from "../../utils/uploadCloudinary.js";
import { BASE_URL } from "../../config.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  PanelHeader,
  inputClass,
  labelClass,
} from "../../components/ui/dashboard.jsx";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MAX_PHOTO_MB = 5;

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const toFormData = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  photo: user?.photo || null,
  gender: user?.gender || "",
  dateOfBirth: toDateInput(user?.dateOfBirth),
  bloodType: user?.bloodType || "",
  password: "",
});

const toConditionsText = (user) =>
  (user?.conditions || user?.diseases || []).join(", ");

const Profile = ({ user, onSaved }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(() => toFormData(user));
  const [conditionsText, setConditionsText] = useState(() => toConditionsText(user));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData(toFormData(user));
    setConditionsText(toConditionsText(user));
  }, [user]);

  const dirty =
    JSON.stringify(formData) !== JSON.stringify(toFormData(user)) ||
    conditionsText !== toConditionsText(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_PHOTO_MB} MB`);
      return;
    }

    try {
      setUploading(true);
      const data = await uploadImageToCloudinary(file);
      if (!data?.url) throw new Error("Upload failed");
      setFormData((prev) => ({ ...prev, photo: data.url }));
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const discard = () => {
    setFormData(toFormData(user));
    setConditionsText(toConditionsText(user));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!user?._id) return toast.error("User ID is missing");
    if (!formData.name.trim()) return toast.error("Your name is required");
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      return toast.error("Date of birth cannot be in the future");
    }

    const dataToSend = {
      ...formData,
      name: formData.name.trim(),
      conditions: conditionsText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
    };
    if (!dataToSend.password) delete dataToSend.password;

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Update failed");

      toast.success(result.message || "Profile updated");
      const { password, ...saved } = dataToSend;
      onSaved?.(saved);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <PanelHeader
        title="Profile settings"
        description="Keep your details up to date so doctors have the right information."
      />

      <form
        onSubmit={submitHandler}
        className="space-y-8 rounded-[14px] border border-line bg-white p-6 md:p-8"
      >
        {/* photo */}
        <div className="flex flex-wrap items-center gap-5">
          {formData.photo ? (
            <img
              src={formData.photo}
              alt="Profile"
              className="h-20 w-20 rounded-full border border-line object-cover"
            />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primaryColor font-heading text-[30px] text-white">
              {(formData.name || "U").charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <input
              type="file"
              id="profilePhoto"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="profilePhoto"
              className={`inline-block cursor-pointer rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor transition-colors hover:border-primaryColor hover:text-primaryColor ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {uploading ? "Uploading..." : "Change photo"}
            </label>
            <p className="mt-2 text-[13px] text-textColor">
              JPG or PNG, up to {MAX_PHOTO_MB} MB. Save to apply.
            </p>
          </div>
        </div>

        {/* personal */}
        <fieldset>
          <legend className="mb-4 font-heading text-[20px] font-semibold text-headingColor">
            Personal information
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClass}>Full name</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                className={inputClass}
                disabled
              />
              <p className="mt-1.5 text-[12px] text-textColor">
                Your email is your login and cannot be changed here.
              </p>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className={labelClass}>Date of birth</label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={today}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="gender" className={labelClass}>Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </fieldset>

        {/* health */}
        <fieldset>
          <legend className="mb-4 font-heading text-[20px] font-semibold text-headingColor">
            Health information
          </legend>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="bloodType" className={labelClass}>Blood type</label>
              <select
                id="bloodType"
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                {BLOOD_TYPES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="conditions" className={labelClass}>Medical conditions</label>
              <input
                id="conditions"
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                className={inputClass}
                placeholder="e.g. Diabetes, Hypertension"
              />
              <p className="mt-1.5 text-[12px] text-textColor">Separate with commas.</p>
            </div>
          </div>
        </fieldset>

        {/* security */}
        <fieldset>
          <legend className="mb-4 font-heading text-[20px] font-semibold text-headingColor">
            Security
          </legend>
          <div className="md:w-1/2 md:pr-2.5">
            <label htmlFor="password" className={labelClass}>New password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
              placeholder="Leave blank to keep your current password"
              autoComplete="new-password"
            />
          </div>
        </fieldset>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={discard}
            disabled={!dirty || saving}
            className="rounded-[8px] px-5 py-3 text-[15px] font-semibold text-textColor transition-colors hover:text-headingColor disabled:opacity-40"
          >
            Discard changes
          </button>
          <button
            type="submit"
            disabled={!dirty || saving || uploading}
            className="rounded-[8px] bg-primaryColor px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;