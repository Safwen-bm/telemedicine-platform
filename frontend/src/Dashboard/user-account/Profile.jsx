import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import uploadImageToCloudinary from "../../utils/uploadCloudinary.js";
import { BASE_URL, token } from "../../config.js";

const Profile = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    conditions: [], 
    photo: null,
    bloodType: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        photo: user.photo || null,
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
        conditions: user.conditions || user.diseases || [], // Fallback to diseases for existing users
        bloodType: user.bloodType || "",
        password: "", // Keep empty unless updated
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "conditions") {
      setFormData((prev) => ({ ...prev, conditions: value.split(",").map((c) => c.trim()) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    const data = await uploadImageToCloudinary(file);
    setFormData((prev) => ({ ...prev, photo: data.url }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!user || !user._id) {
      toast.error("User ID is missing");
      setLoading(false);
      return;
    }

    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      toast.error("Date of Birth cannot be in the future");
      setLoading(false);
      return;
    }

    const dataToSend = { ...formData };
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      const res = await fetch(`${BASE_URL}/users/${user._id}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const { message } = await res.json();

      if (!res.ok) {
        throw new Error(message);
      }

      setLoading(false);
      toast.success(message);
      navigate("/users/profile/me");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10">
      <h1 className="text-4xl font-bold text-blue-800 mb-10 border-b-4 border-blue-200 pb-3">
        🛠️ Edit Profile
      </h1>
      <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
            readOnly
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Leave blank to keep current password"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Medical Conditions (comma-separated)</label>
          <input
            type="text"
            name="conditions"
            value={formData.conditions.join(", ")}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Diabetes, Hypertension"
            list="conditionsList"
          />
          <datalist id="conditionsList">
            <option value="Diabetes" />
            <option value="Hypertension" />
            <option value="Asthma" />
            <option value="Arthritis" />
            <option value="Migraine" />
          </datalist>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Blood Type</label>
          <input
            type="text"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            list="bloodTypes"
          />
          <datalist id="bloodTypes">
            <option value="A+" />
            <option value="A-" />
            <option value="B+" />
            <option value="B-" />
            <option value="AB+" />
            <option value="AB-" />
            <option value="O+" />
            <option value="O-" />
          </datalist>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-4">
          {formData.photo && (
            <figure className="w-20 h-20 rounded-full border-2 border-indigo-200 overflow-hidden">
              <img
                src={formData.photo}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </figure>
          )}
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
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              {selectedFile ? selectedFile.name : "Upload Photo"}
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? <HashLoader size={25} color="#ffffff" /> : "Update Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;