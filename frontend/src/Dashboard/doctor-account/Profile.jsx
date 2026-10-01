// frontend\src\Dashboard\doctor-account\Profile.jsx
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL } from "../../config";
import { PanelHeader, inputClass, labelClass } from "../../components/ui/dashboard.jsx";

const SPECIALIZATIONS = [
  "surgery",
  "cardiology",
  "dermatology",
  "endocrinology",
  "gastroenterology",
  "neurology",
  "oncology",
  "orthopedics",
  "pediatrics",
  "psychiatry",
  "radiology",
];
const MAX_PHOTO_MB = 5;
const BIO_MAX = 100;

const REPEATERS = {
  qualifications: {
    title: "Qualifications",
    addLabel: "Add qualification",
    empty: { degree: "", university: "", startingDate: "", endingDate: "" },
    fields: [
      { name: "degree", label: "Degree", type: "text" },
      { name: "university", label: "University", type: "text" },
      { name: "startingDate", label: "Start date", type: "date" },
      { name: "endingDate", label: "End date", type: "date" },
    ],
  },
  experiences: {
    title: "Experience",
    addLabel: "Add experience",
    empty: { position: "", hospital: "", startingDate: "", endingDate: "" },
    fields: [
      { name: "position", label: "Position", type: "text" },
      { name: "hospital", label: "Hospital", type: "text" },
      { name: "startingDate", label: "Start date", type: "date" },
      { name: "endingDate", label: "End date", type: "date" },
    ],
  },
};

// Date inputs need yyyy-mm-dd, the API returns full ISO timestamps.
const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
};

const toRows = (rows, cfg) =>
  (rows || []).map((row) =>
    Object.fromEntries(
      cfg.fields.map((f) => [
        f.name,
        f.type === "date" ? toDateInput(row[f.name]) : row[f.name] || "",
      ])
    )
  );

const toForm = (d) => ({
  name: d?.name || "",
  email: d?.email || "",
  password: "",
  phone: d?.phone || "",
  bio: d?.bio || "",
  gender: d?.gender || "",
  specialization: d?.specialization || "",
  ticketPrice: d?.ticketPrice ?? "",
  about: d?.about || "",
  photo: d?.photo || null,
  qualifications: toRows(d?.qualifications, REPEATERS.qualifications),
  experiences: toRows(d?.experiences, REPEATERS.experiences),
});

const isEmptyRow = (row) => Object.values(row).every((v) => !v);

const SectionTitle = ({ children }) => (
  <legend className="mb-4 font-heading text-[20px] font-semibold text-headingColor">
    {children}
  </legend>
);

const Profile = ({ doctorData, onSaved }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState(() => toForm(doctorData));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setFormData(toForm(doctorData));
  }, [doctorData]);

  const baseline = useMemo(() => JSON.stringify(toForm(doctorData)), [doctorData]);
  const dirty = JSON.stringify(formData) !== baseline;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addItem = (key) =>
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], { ...REPEATERS[key].empty }] }));

  const updateItem = (key, index, name, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? { ...item, [name]: value } : item)),
    }));

  const removeItem = (key, index) =>
    setFormData((prev) => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

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

  const discard = () => setFormData(toForm(doctorData));

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!doctorData?._id) return toast.error("Doctor data not available. Please try again.");
    if (!formData.name.trim()) return toast.error("Your name is required");

    const fee = formData.ticketPrice === "" ? undefined : Number(formData.ticketPrice);
    if (fee !== undefined && (!Number.isFinite(fee) || fee < 0)) {
      return toast.error("Consultation fee must be a positive number");
    }

    const cleaned = {};
    for (const [key, cfg] of Object.entries(REPEATERS)) {
      cleaned[key] = formData[key]
        .filter((row) => !isEmptyRow(row))
        .map((row) => ({
          ...row,
          startingDate: row.startingDate || undefined,
          endingDate: row.endingDate || undefined,
        }));
      for (const row of cleaned[key]) {
        if (row.startingDate && row.endingDate && row.endingDate < row.startingDate) {
          return toast.error(`In ${cfg.title.toLowerCase()}, an end date is before its start date`);
        }
      }
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      bio: formData.bio.trim(),
      about: formData.about.trim(),
      gender: formData.gender,
      specialization: formData.specialization,
      ticketPrice: fee,
      photo: formData.photo || "",
      ...cleaned,
    };
    if (formData.password) payload.password = formData.password;

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Update failed");

      toast.success(result.message || "Profile updated");
      onSaved?.({ name: payload.name, photo: payload.photo || undefined });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PanelHeader
        title="Profile settings"
        description="This is what patients see on your public page."
      />

      <form
        onSubmit={submitHandler}
        className="space-y-10 rounded-[14px] border border-line bg-white p-6 md:p-8"
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
              {(formData.name || "D").charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <input
              type="file"
              id="doctorPhoto"
              accept="image/*"
              onChange={handlePhoto}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="doctorPhoto"
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
          <SectionTitle>Personal information</SectionTitle>
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
              <input id="email" type="email" value={formData.email} className={inputClass} disabled />
              <p className="mt-1.5 text-[12px] text-textColor">
                Your email is your login and cannot be changed here.
              </p>
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Phone number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+216 ..."
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
              </select>
            </div>
          </div>
        </fieldset>

        {/* professional */}
        <fieldset>
          <SectionTitle>Professional information</SectionTitle>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="specialization" className={labelClass}>Specialization</label>
              <select
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className={`${inputClass} capitalize`}
              >
                <option value="">Select</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ticketPrice" className={labelClass}>Consultation fee (USD)</label>
              <input
                id="ticketPrice"
                type="number"
                min="0"
                step="0.01"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. 30"
              />
              <p className="mt-1.5 text-[12px] text-textColor">
                Patients are charged this amount in USD. It must be above 0 to be bookable.
              </p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="bio" className={labelClass}>Short bio</label>
              <input
                id="bio"
                type="text"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className={inputClass}
                placeholder="One line shown under your name"
                maxLength={BIO_MAX}
              />
              <p className="mt-1.5 text-right text-[12px] text-textColor">
                {formData.bio.length}/{BIO_MAX}
              </p>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="about" className={labelClass}>About</label>
              <textarea
                id="about"
                name="about"
                rows={5}
                value={formData.about}
                onChange={handleChange}
                className={inputClass}
                placeholder="Tell patients about your approach and background"
              />
            </div>
          </div>
        </fieldset>

        {/* repeaters */}
        {Object.entries(REPEATERS).map(([key, cfg]) => (
          <fieldset key={key}>
            <SectionTitle>{cfg.title}</SectionTitle>
            <div className="space-y-4">
              {formData[key].map((item, index) => (
                <div key={index} className="rounded-[10px] border border-line bg-paper p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {cfg.fields.map((f) => (
                      <div key={f.name}>
                        <label htmlFor={`${key}-${index}-${f.name}`} className={labelClass}>
                          {f.label}
                        </label>
                        <input
                          id={`${key}-${index}-${f.name}`}
                          type={f.type}
                          value={item[f.name]}
                          onChange={(e) => updateItem(key, index, f.name, e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(key, index)}
                    className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-red-700 hover:underline"
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              ))}

              {formData[key].length === 0 && (
                <p className="italic text-textColor">None added yet.</p>
              )}

              <button
                type="button"
                onClick={() => addItem(key)}
                className="inline-flex items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-2 text-[14px] font-semibold text-headingColor transition-colors hover:border-primaryColor hover:text-primaryColor"
              >
                <Plus className="h-4 w-4" /> {cfg.addLabel}
              </button>
            </div>
          </fieldset>
        ))}

        {/* security */}
        <fieldset>
          <SectionTitle>Security</SectionTitle>
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