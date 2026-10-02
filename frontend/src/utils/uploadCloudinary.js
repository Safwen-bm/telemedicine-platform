const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;

const uploadImageToCloudinary = async (file) => {
  if (!UPLOAD_PRESET || !CLOUD_NAME) {
    throw new Error("Image upload is not configured");
  }

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: uploadData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error?.message || "Image upload failed");
  }

  // Callers read `url`: make sure it is the https one.
  return { ...data, url: data.secure_url || data.url };
};

export default uploadImageToCloudinary;