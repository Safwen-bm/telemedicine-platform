import { useState, useEffect } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext.jsx";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL } from "../../config";

const Profile = ({ doctorData }) => {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    bio: "",
    gender: "",
    specialization: "",
    ticketPrice: 0,
    qualifications: [],
    experiences: [],
    about: "",
    photo: null,
  });

  useEffect(() => {
    setFormData({
      name: doctorData?.name,
      email: doctorData?.email,
      phone: doctorData?.phone,
      bio: doctorData?.bio,
      gender: doctorData?.gender,
      specialization: doctorData?.specialization,
      ticketPrice: doctorData?.ticketPrice,
      qualifications: doctorData?.qualifications,
      experiences: doctorData?.experiences,
      about: doctorData?.about,
      photo: doctorData?.photo,
    });
  }, [doctorData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setFormData({ ...formData, photo: data?.url });
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();

    if (!doctorData || !doctorData._id) {
      toast.error("Doctor data not available. Please try again.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw Error(result.message);
      }

      toast.success(result.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const addItem = (key, item) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: [...prevFormData[key], item],
    }));
  };

  const handleReusableInputChangeFunc = (key, index, event) => {
    const { name, value } = event.target;

    setFormData((prevFormData) => {
      const updateItems = [...prevFormData[key]];
      updateItems[index][name] = value;
      return {
        ...prevFormData,
        [key]: updateItems,
      };
    });
  };

  const deleteItem = (key, index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: prevFormData[key].filter((_, i) => i !== index),
    }));
  };

  const addQualification = (e) => {
    e.preventDefault();
    addItem("qualifications", {
      startingDate: "",
      endingDate: "",
      degree: "",
      university: "",
    });
  };

  const handleQualificationChange = (event, index) => {
    handleReusableInputChangeFunc("qualifications", index, event);
  };

  const deleteQualification = (e, index) => {
    e.preventDefault();
    deleteItem("qualifications", index);
  };

  const addExperience = (e) => {
    e.preventDefault();
    addItem("experiences", {
      startingDate: "",
      endingDate: "",
      position: "",
      hospital: "",
    });
  };

  const handleExperienceChange = (event, index) => {
    handleReusableInputChangeFunc("experiences", index, event);
  };

  const deleteExperience = (e, index) => {
    e.preventDefault();
    deleteItem("experiences", index);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-4xl font-bold text-blue-800 mb-10 border-b-4 border-blue-200 pb-3">
        🛠️ Edit Profile
      </h1>
      <form onSubmit={updateProfileHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
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

        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100"
            readOnly
            aria-readonly
            disabled={true}
          />
        </div>

        {/* Password */}
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

        {/* Phone */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Phone number"
          />
        </div>

        {/* Gender */}
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
          </select>
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Specialization</label>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select</option>
            <option value="surgery">Surgery</option>
            <option value="cardiology">Cardiology</option>
            <option value="dermatology">Dermatology</option>
            <option value="endocrinology">Endocrinology</option>
            <option value="gastroenterology">Gastroenterology</option>
            <option value="neurology">Neurology</option>
            <option value="oncology">Oncology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="pediatrics">Pediatrics</option>
            <option value="psychiatry">Psychiatry</option>
            <option value="radiology">Radiology</option>
          </select>
        </div>

        {/* Ticket Price */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Ticket Price</label>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="100"
          />
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Bio</label>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Bio"
            maxLength={100}
          />
        </div>

        {/* About */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">About</label>
          <textarea
            name="about"
            rows={5}
            value={formData.about}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tell us about yourself"
          ></textarea>
        </div>

        {/* Qualifications */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Qualifications</label>
          {formData.qualifications?.map((item, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Starting Date</label>
                  <input
                    type="date"
                    name="startingDate"
                    value={item.startingDate}
                    onChange={(e) => handleQualificationChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Ending Date</label>
                  <input
                    type="date"
                    name="endingDate"
                    value={item.endingDate}
                    onChange={(e) => handleQualificationChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Degree</label>
                  <input
                    type="text"
                    name="degree"
                    value={item.degree}
                    onChange={(e) => handleQualificationChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">University</label>
                  <input
                    type="text"
                    name="university"
                    value={item.university}
                    onChange={(e) => handleQualificationChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={(e) => deleteQualification(e, index)}
                className="mt-6 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          ))}
          <button
            onClick={addQualification}
            className="mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Add Qualification
          </button>
        </div>

        {/* Experiences */}
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-medium mb-2">Experiences</label>
          {formData.experiences?.map((item, index) => (
            <div key={index} className="border border-gray-200 p-4 rounded-lg mb-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Starting Date</label>
                  <input
                    type="date"
                    name="startingDate"
                    value={item.startingDate}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Ending Date</label>
                  <input
                    type="date"
                    name="endingDate"
                    value={item.endingDate}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={item.position}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">Hospital</label>
                  <input
                    type="text"
                    name="hospital"
                    value={item.hospital}
                    onChange={(e) => handleExperienceChange(e, index)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <button
                onClick={(e) => deleteExperience(e, index)}
                className="mt-6 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          ))}
          <button
            onClick={addExperience}
            className="mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition"
          >
            Add Experience
          </button>
        </div>

        {/* Photo Upload */}
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
              Upload Photo
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;