export const formateDate = (date, config = {}) => {
  const defaultOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  const options = { ...defaultOptions, ...config };

  try {
    // Check if date is valid
    if (!date || isNaN(new Date(date).getTime())) {
      throw new Error("Invalid date provided");
    }

    return new Date(date).toLocaleDateString("en-US", options);
  } catch (error) {
    console.error("Date formatting error:", error.message);
    return "Invalid Date"; 
  }
};